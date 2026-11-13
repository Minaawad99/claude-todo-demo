/* «العبور: الساعة اتنين الضهر» — the «القصة» style: toon-shaded three.js, a pure function of time (renderAt(t)).
   World units ≈ metres. The Suez Canal runs along Z; +X is east (Sinai), −X is west (the Egyptian bank).
   Real shapes: the canal ~180 m wide, the Bar Lev sand rampart ~20–25 m high with a steep face to the water, strongpoints
   on top; rubber boats, water pumps on small boats with fire hoses, wooden ladders, pontoon bridges, tanks; the delta and
   swept-wing jets of the opening strike; the Aswan High Dam embankment with its lotus tower. */
(function () {
  var T3 = THREE, LN = window.TIMING.lines, END = window.TIMING.duration;
  function L(i) { return i >= LN.length ? END + 1.5 : LN[i].start; }
  function clamp(x, a, b) { a = a == null ? 0 : a; b = b == null ? 1 : b; return x < a ? a : x > b ? b : x; }
  function ease(x) { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
  function lerp(a, b, k) { return a + (b - a) * k; }
  function hash(i) { var x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
  var seed = 21; function rnd() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }

  var canvas = document.getElementById("gl");
  var R = new T3.WebGLRenderer({ canvas: canvas, antialias: true, preserveDrawingBuffer: true });
  R.setPixelRatio(window.devicePixelRatio || 1); R.setSize(360, 640, false); R.outputEncoding = T3.LinearEncoding;
  var cam = new T3.PerspectiveCamera(42, 360 / 640, 0.2, 9000);
  var ramp = new T3.DataTexture(new Uint8Array([90, 90, 90, 255, 175, 175, 175, 255, 255, 255, 255, 255]), 3, 1, T3.RGBAFormat);
  ramp.minFilter = ramp.magFilter = T3.NearestFilter; ramp.needsUpdate = true;
  function toon(c, o) { return new T3.MeshToonMaterial(Object.assign({ color: c, gradientMap: ramp }, o || {})); }
  function basic(c, o) { return new T3.MeshBasicMaterial(Object.assign({ color: c }, o || {})); }
  var INKM = basic(0x1b1d22, { side: T3.BackSide });
  function inked(geo, m, w) { var g = new T3.Group(), a = new T3.Mesh(geo, m), b = new T3.Mesh(geo, INKM); b.scale.setScalar(1 + (w || .04)); g.add(a, b); g.main = a; return g; }
  function skyMat() { return new T3.ShaderMaterial({ side: T3.BackSide, depthWrite: false, fog: false,
    uniforms: { top: { value: new T3.Color(0x3f86d0) }, mid: { value: new T3.Color(0xa9cdea) }, bot: { value: new T3.Color(0xe8dcc0) } },
    vertexShader: "varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
    fragmentShader: "uniform vec3 top; uniform vec3 mid; uniform vec3 bot; varying vec3 vP; void main(){ float h=vP.y; vec3 c = h>0.0 ? mix(mid, top, pow(clamp(h*1.6,0.0,1.0),0.7)) : bot; gl_FragColor=vec4(c,1.0); }" }); }
  function mkScene() { var s = new T3.Scene(); s.fog = new T3.Fog(0xe8dcc0, 300, 3500); s.skyM = skyMat(); s.add(new T3.Mesh(new T3.SphereGeometry(7000, 32, 16), s.skyM));
    s.hemi = new T3.HemisphereLight(0xeaf3ff, 0x9a8a68, .45); s.sun = new T3.DirectionalLight(0xfff2da, .75); s.sun.position.set(-300, 400, 100); s.add(s.hemi, s.sun); return s; }
  // times of day: sky top/mid/horizon, fog, sun colour+intensity+direction, hemisphere intensity
  var TOD = {
    night:   [0x05070f, 0x101a33, 0x1a2440, 0x0e1428, 0x8aa0d0, .22, [100, 300, -200], .25],
    predawn: [0x0b1026, 0x2a3358, 0x6a5a70, 0x2a2a44, 0xa8a0c8, .3, [300, 120, 0], .3],
    dawn:    [0x3a5a8a, 0xd89a70, 0xf6c890, 0xe0b090, 0xffc890, .7, [600, 120, 0], .42],
    day:     [0x2f78c8, 0x9cc8ea, 0xefe2c4, 0xe8dcc0, 0xfff2da, .8, [-100, 500, 100], .48],
    noon:    [0x2a72c4, 0xa8d0ee, 0xf2e6c8, 0xeee2c8, 0xfff6e6, .85, [-200, 520, 60], .5],
    sunset:  [0x2a3a6a, 0xd47a4a, 0xf6b070, 0xd89a70, 0xffb070, .8, [-600, 90, 0], .35],
    smoke:   [0x6a5a50, 0xb8987a, 0xd8b890, 0xc8a888, 0xffd8a8, .7, [-300, 300, 0], .42]
  };
  function setTOD(s, k) { var p = TOD[k]; s.skyM.uniforms.top.value.setHex(p[0]); s.skyM.uniforms.mid.value.setHex(p[1]); s.skyM.uniforms.bot.value.setHex(p[2]); s.fog.color.setHex(p[3]); s.sun.color.setHex(p[4]); s.sun.intensity = p[5]; s.sun.position.set(p[6][0], p[6][1], p[6][2]); s.hemi.intensity = p[7]; }

  // ── people with real proportions (about 7 heads), solid limbs and joints, toon-shaded: soldiers in desert camouflage
  //    with a steel helmet, belt and boots; officers in plain khaki with a peaked cap; a woman in a dress; dam workers.
  //    Built at 2.1 units and scaled ×1.85 so they replace the old characters at the same framing. ──
  var SKINS = [0xc98f66, 0xb98058, 0xd9a57a, 0xa87048];
  var camoC = document.createElement("canvas"); camoC.width = camoC.height = 128; var cc = camoC.getContext("2d"); cc.fillStyle = "#c4ae7c"; cc.fillRect(0, 0, 128, 128);
  [["#8f7a4c", 26], ["#6e6c42", 18], ["#4f4a32", 12]].forEach(function (p, j) { cc.fillStyle = p[0]; for (var i = 0; i < p[1]; i++) { var x = hash(i * 7 + j * 31) * 128, y = hash(i * 13 + j * 17) * 128, r = 5 + hash(i + j * 5) * 9; cc.beginPath(); cc.ellipse(x, y, r * 1.6, r * .8, hash(i * 3 + j) * 3, 0, 7); cc.fill(); cc.beginPath(); cc.ellipse((x + 64) % 128, y, r * 1.6, r * .8, hash(i * 3 + j) * 3, 0, 7); cc.fill(); } });
  var camoT = new T3.CanvasTexture(camoC); camoT.wrapS = camoT.wrapT = T3.RepeatWrapping; camoT.repeat.set(1.5, 1.5);
  var MAT = { camo: toon(0xffffff, { map: camoT }), khaki: toon(0xb3a272), dress: toon(0x34405a), work: toon(0x3a5a8a), boot: toon(0x2a221c), belt: toon(0x4a3a22), olive: toon(0x5f6040), ink: toon(0x16171b) };
  function limb(r, len, m) { var g = new T3.Group(); var c = inked(new T3.CapsuleGeometry(r, len, 4, 10), m, .06); c.position.y = -len / 2 - r * .3; g.add(c); return g; }
  function bean(o) {
    o = o || {}; var g = new T3.Group(), body = new T3.Group(); body.scale.setScalar(1.85); g.add(body);
    var skin = toon(o.skin || SKINS[(o.k || 0) % 4]), cloth = o.helmet === 0xf2c230 ? MAT.work : o.helmet ? MAT.camo : o.cap ? MAT.khaki : o.bun ? MAT.dress : toon(o.body || 0xb8a274);
    var pants = o.bun ? MAT.dress : cloth;
    // legs: hip → knee → foot
    function leg(x) { var hip = new T3.Group(); hip.position.set(x, 1.05, 0); var th = limb(.105, .34, pants); hip.add(th); var knee = new T3.Group(); knee.position.y = -.5; hip.add(knee); var sh = limb(.085, .34, pants); knee.add(sh);
      var bt = inked(new T3.BoxGeometry(.2, .14, .34), o.bun ? MAT.ink : MAT.boot, .05); bt.position.set(0, -.5, .07); knee.add(bt); body.add(hip); return { hip: hip, knee: knee }; }
    g.L = leg(-.1); g.R = leg(.1);
    if (o.bun) { var sk = inked(new T3.CylinderGeometry(.2, .34, .62, 14), MAT.dress, .04); sk.position.y = .82; body.add(sk); }
    var pel = inked(new T3.BoxGeometry(.36, .2, .22), pants, .04); pel.position.y = 1.08; body.add(pel);
    var torso = new T3.Group(); torso.position.y = 1.12; body.add(torso); g.torso = torso;
    var ch = inked(new T3.CylinderGeometry(.21, .17, .56, 14), cloth, .04); ch.scale.z = .68; ch.position.y = .3; torso.add(ch);
    var sh2 = inked(new T3.SphereGeometry(.21, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), cloth, .04); sh2.scale.set(1, .35, .68); sh2.position.y = .58; torso.add(sh2);
    if (o.helmet || o.cap) { var bl = new T3.Mesh(new T3.CylinderGeometry(.185, .185, .06, 14), MAT.belt); bl.scale.z = .7; bl.position.y = .04; torso.add(bl);
      var bk = new T3.Mesh(new T3.BoxGeometry(.06, .05, .02), toon(0xc9a860)); bk.position.set(0, .04, .13); torso.add(bk); }
    if (o.helmet && o.helmet !== 0xf2c230) { var st = new T3.Mesh(new T3.BoxGeometry(.05, .6, .02), MAT.belt); st.position.set(.06, .32, .145); st.rotation.z = .5; torso.add(st);
      var pk = inked(new T3.BoxGeometry(.3, .32, .14), MAT.olive, .05); pk.position.set(0, .32, -.17); torso.add(pk); }
    // arms: shoulder → elbow; rotation.z on the shoulder raises the arm sideways (same meaning as before: ±.5 rest, ±2.6 up)
    function arm(x, sgn) { var sh = new T3.Group(); sh.position.set(x * 1.85, (1.12 + .55) * 1.85, 0); var up = limb(.07, .24, cloth); up.scale.setScalar(1.85); sh.add(up);
      var el = new T3.Group(); el.position.y = -.38 * 1.85; sh.add(el); var fo = limb(.06, .22, o.cap || o.helmet ? cloth : skin); fo.scale.setScalar(1.85); el.add(fo);
      var hd = inked(new T3.SphereGeometry(.065, 10, 8), skin, .06); hd.position.y = -.36 * 1.85; hd.scale.setScalar(1.85); el.add(hd); g.add(sh); sh.rotation.z = sgn * .12; sh.elbow = el; return sh; }
    g.armL = arm(-.25, -1); g.armR = arm(.25, 1);
    // neck, head, face
    var nk = new T3.Mesh(new T3.CylinderGeometry(.055, .065, .1, 10), skin); nk.position.y = 1.76; body.add(nk);
    var head = new T3.Group(); head.position.y = 1.93 * 1.85; g.add(head); g.head = head; var hs = 1.85;
    var hb = inked(new T3.SphereGeometry(.135 * hs, 20, 14), skin, .04); hb.scale.set(.92, 1.05, 1); head.add(hb);
    var jaw = new T3.Mesh(new T3.SphereGeometry(.1 * hs, 14, 10), skin); jaw.position.set(0, -.07 * hs, .03 * hs); jaw.scale.set(1, .8, .9); head.add(jaw);
    [-1, 1].forEach(function (sd) { var ear = new T3.Mesh(new T3.SphereGeometry(.03 * hs, 8, 6), skin); ear.position.set(sd * .125 * hs, 0, 0); ear.scale.z = .6; head.add(ear); });
    var nose = new T3.Mesh(new T3.ConeGeometry(.02 * hs, .05 * hs, 6), skin); nose.rotation.x = Math.PI / 2; nose.position.set(0, -.015 * hs, .135 * hs); head.add(nose);
    g.eyes = []; [-.045, .045].forEach(function (ex) { var ey = new T3.Mesh(new T3.SphereGeometry(.016 * hs, 8, 6), MAT.ink); ey.position.set(ex * hs, .02 * hs, .118 * hs); ey.scale.set(1, 1.3, .5); head.add(ey); g.eyes.push(ey);
      var br = new T3.Mesh(new T3.BoxGeometry(.05 * hs, .012 * hs, .01 * hs), toon(o.hair || 0x1a1410)); br.position.set(ex * hs, .055 * hs, .124 * hs); br.rotation.z = ex > 0 ? -.12 : .12; head.add(br); });
    var mw = .035 * hs; g.smile = new T3.Mesh(new T3.TorusGeometry(mw, .006 * hs, 4, 10, Math.PI), MAT.ink); g.smile.position.set(0, -.06 * hs, .128 * hs); g.smile.rotation.z = Math.PI; head.add(g.smile);
    g.frown = new T3.Mesh(new T3.TorusGeometry(mw, .006 * hs, 4, 10, Math.PI), MAT.ink); g.frown.position.set(0, -.085 * hs, .126 * hs); head.add(g.frown);
    g.flat = new T3.Mesh(new T3.BoxGeometry(mw * 1.8, .01 * hs, .01 * hs), MAT.ink); g.flat.position.set(0, -.07 * hs, .13 * hs); head.add(g.flat);
    if (o.mustache) { var ms = new T3.Mesh(new T3.BoxGeometry(.08 * hs, .018 * hs, .02 * hs), toon(o.hair || 0x1a1410)); ms.position.set(0, -.045 * hs, .13 * hs); head.add(ms); }
    if (o.glasses) [-.045, .045].forEach(function (ex) { var gl = new T3.Mesh(new T3.TorusGeometry(.026 * hs, .004 * hs, 4, 12), MAT.ink); gl.position.set(ex * hs, .02 * hs, .13 * hs); head.add(gl); });
    // headgear / hair
    if (o.helmet) { var hm = inked(new T3.SphereGeometry(.165 * hs, 18, 10, 0, Math.PI * 2, 0, Math.PI * .5), toon(o.helmet === 0xf2c230 ? 0xf2c230 : 0x5a5c3c), .04); hm.position.y = .03 * hs; hm.scale.y = .9; head.add(hm);
      var rm = inked(new T3.CylinderGeometry(.19 * hs, .19 * hs, .018 * hs, 20), toon(o.helmet === 0xf2c230 ? 0xe0b020 : 0x4f5034), .05); rm.position.y = .03 * hs; head.add(rm); }
    else if (o.cap) { var hr0 = inked(new T3.SphereGeometry(.14 * hs, 16, 8, 0, Math.PI * 2, 0, Math.PI * .45), toon(o.hair || 0x1a1410), .03); hr0.rotation.x = -.3; head.add(hr0);
      var cp = inked(new T3.CylinderGeometry(.15 * hs, .14 * hs, .08 * hs, 18), toon(o.cap), .04); cp.position.y = .12 * hs; cp.rotation.x = -.1; head.add(cp); var vz = new T3.Mesh(new T3.BoxGeometry(.18 * hs, .012 * hs, .09 * hs), MAT.ink); vz.position.set(0, .085 * hs, .14 * hs); head.add(vz); }
    else { var hr = inked(new T3.SphereGeometry(.142 * hs, 16, 8, 0, Math.PI * 2, 0, Math.PI * (o.bob ? .62 : .44)), toon(o.hair || 0x1a1410), .03); hr.rotation.x = -.3; head.add(hr);
      if (o.bun) { var bn = inked(new T3.SphereGeometry(.06 * hs, 10, 8), toon(o.hair || 0x1a1410), .05); bn.position.set(0, .1 * hs, -.12 * hs); head.add(bn); } }
    g.mood = function (m) { g.smile.visible = m === "smile"; g.frown.visible = m === "sad"; g.flat.visible = m === "flat" || !m; };
    g.mood(o.mood || "flat");
    g.legL = g.L.hip; g.legR = g.R.hip; g.ph = hash(o.k || 0) * 6;
    g.pose = function (p, t) {   // stand | sit | paddle | climb | walk
      var w = Math.sin((t || 0) * 3 + g.ph);
      g.L.hip.rotation.x = g.R.hip.rotation.x = 0; g.L.knee.rotation.x = g.R.knee.rotation.x = 0; g.armL.elbow.rotation.x = g.armR.elbow.rotation.x = 0; g.armL.rotation.x = g.armR.rotation.x = 0; body.position.y = 0;
      if (p === "sit" || p === "paddle") { g.L.hip.rotation.x = g.R.hip.rotation.x = -1.45; g.L.knee.rotation.x = g.R.knee.rotation.x = 1.5; body.position.y = -.45; g.head.position.y = 1.93 * 1.85 - .45 * 1.85; g.armL.position.y = g.armR.position.y = (1.12 + .55 - .45) * 1.85;
        if (p === "paddle") { g.armL.rotation.x = g.armR.rotation.x = -.9 + w * .5; g.armL.elbow.rotation.x = g.armR.elbow.rotation.x = -.6; } }
      else { g.head.position.y = 1.93 * 1.85; g.armL.position.y = g.armR.position.y = (1.12 + .55) * 1.85; }
      if (p === "climb") { g.L.hip.rotation.x = -.8 - w * .5; g.L.knee.rotation.x = 1 + w * .4; g.R.hip.rotation.x = -.8 + w * .5; g.R.knee.rotation.x = 1 - w * .4; g.armL.rotation.x = -2.6 + w * .3; g.armR.rotation.x = -2.6 - w * .3; }
      if (p === "walk") { g.L.hip.rotation.x = w * .5; g.R.hip.rotation.x = -w * .5; g.L.knee.rotation.x = Math.max(0, -w) * .6; g.R.knee.rotation.x = Math.max(0, w) * .6; g.armL.rotation.x = -w * .4; g.armR.rotation.x = w * .4; }
    };
    g.pose("stand", 0);
    return g;
  }
  function live(b, t, o) { o = o || {}; var bl = ((t + b.ph) % 3.3) < .12; b.eyes.forEach(function (e) { e.scale.y = bl ? .15 : 1.5; }); b.head.rotation.z = Math.sin(t * .9 + b.ph) * .05; if (o.cheer) { var w = Math.sin(t * 6 + b.ph); b.armL.rotation.z = -2.6 - w * .2; b.armR.rotation.z = 2.6 + w * .2; } }

  // ═════════ WORLD: the canal, both banks, the rampart ═════════
  var W = mkScene();
  var SAND = 0xd8bc84, SAND2 = 0xc9a86c;
  var west = new T3.Mesh(new T3.PlaneGeometry(4000, 6000), toon(SAND)); west.rotation.x = -Math.PI / 2; west.position.set(-2095, 3, 0); W.add(west);
  var east = new T3.Mesh(new T3.PlaneGeometry(4000, 6000), toon(0xe0c690)); east.rotation.x = -Math.PI / 2; east.position.set(2160, 3, 0); W.add(east);
  var bed = new T3.Mesh(new T3.PlaneGeometry(400, 6000), toon(0x8a7a5a)); bed.rotation.x = -Math.PI / 2; bed.position.set(0, -6, 0); W.add(bed);
  var waterM = toon(0x2f8fb8, { transparent: true, opacity: .93 }); var water = new T3.Mesh(new T3.PlaneGeometry(260, 6000), waterM); water.rotation.x = -Math.PI / 2; water.position.y = 0; W.add(water);
  var wbank = new T3.Mesh(new T3.PlaneGeometry(14, 6000), toon(SAND2)); wbank.rotation.y = Math.PI / 2; wbank.rotation.x = 0; wbank.position.set(-95, -1, 0); wbank.rotation.set(0, Math.PI / 2, 0); W.add(wbank);
  // foam streaks drifting on the water
  var foam = new T3.InstancedMesh(new T3.BoxGeometry(6, .05, .5), basic(0xd8f0f8, { transparent: true, opacity: .6 }), 160); foam.frustumCulled = false; W.add(foam);
  // clouds: puffy toon clusters high over the desert, drifting slowly
  var clouds = new T3.Group(); W.add(clouds); var cloudM = toon(0xffffff, { fog: false }), cloudS = toon(0xdfe4ea, { fog: false });
  for (var cq = 0; cq < 34; cq++) { var cg = new T3.Group(), n0 = 5 + Math.floor(rnd() * 5);
    for (var cp2 = 0; cp2 < n0; cp2++) { var r0 = 34 + rnd() * 40, pm = new T3.Mesh(new T3.SphereGeometry(r0, 14, 10), cp2 % 3 ? cloudM : cloudS); pm.position.set((cp2 - n0 / 2) * 26 + rnd() * 10, rnd() * 18 - (cp2 % 2) * 6, rnd() * 24); pm.scale.y = .62; cg.add(pm); }
    var ang = rnd() * Math.PI * 2, rad = 700 + rnd() * 1800; cg.position.set(Math.cos(ang) * rad, 220 + rnd() * 320, Math.sin(ang) * rad); cg.userData.v = 3 + rnd() * 4; clouds.add(cg); }
  function driftClouds(t) { clouds.children.forEach(function (c, i) { c.position.z += 0; c.rotation.y = 0; c.position.x = c.userData.x0 == null ? (c.userData.x0 = c.position.x) : c.userData.x0 + t * c.userData.v; }); }
  // the rampart: a strip mesh along Z with a sand profile; breaches cut notches into it
  var ZN = 520, Z0 = -1950, Z1 = 1950, PX = [88, 96, 104, 110, 116, 124, 132, 140, 152, 168], PH = [-.5, 7, 15, 21, 24, 24, 22, 14, 7, 3];
  var rg = new T3.BufferGeometry(), rpos = new Float32Array(ZN * PX.length * 3), ridx = [];
  var PH0 = PH.slice(), rnoise = function (zi, xi) { return (Math.sin(zi * .37) * .6 + Math.sin(zi * 1.7 + xi) * .35 + (hash(zi * 13 + xi) - .5) * .9) * (xi > 0 && xi < PX.length - 1 ? 1 : 0); };
  var rcol = new Float32Array(ZN * PX.length * 3);
  for (var zi = 0; zi < ZN; zi++) for (var xi = 0; xi < PX.length; xi++) { var k3 = (zi * PX.length + xi) * 3; rpos[k3] = PX[xi] + (xi > 0 && xi < 4 ? Math.sin(zi * 2.3 + xi) * .8 : 0); rpos[k3 + 1] = PH[xi] + rnoise(zi, xi); rpos[k3 + 2] = Z0 + (Z1 - Z0) * zi / (ZN - 1);
    var sh = xi < 4 ? .78 + .08 * Math.sin(zi * 2.3) : xi < 7 ? 1.0 : .9; rcol[k3] = sh; rcol[k3 + 1] = sh * .97; rcol[k3 + 2] = sh * .92; }
  for (var zj = 0; zj < ZN - 1; zj++) for (var xj = 0; xj < PX.length - 1; xj++) { var a0 = zj * PX.length + xj, b0 = a0 + 1, c0 = a0 + PX.length, d0 = c0 + 1; ridx.push(a0, c0, b0, b0, c0, d0); }
  var ruv = new Float32Array(ZN * PX.length * 2); for (var zu = 0; zu < ZN; zu++) for (var xu = 0; xu < PX.length; xu++) { var ku = (zu * PX.length + xu) * 2; ruv[ku] = zu / 6; ruv[ku + 1] = xu / (PX.length - 1); }
  rg.setAttribute("position", new T3.BufferAttribute(rpos, 3)); rg.setAttribute("uv", new T3.BufferAttribute(ruv, 2)); rg.setAttribute("color", new T3.BufferAttribute(rcol, 3)); rg.setIndex(ridx); rg.computeVertexNormals();
  var sandC = document.createElement("canvas"); sandC.width = 256; sandC.height = 256; var sc2 = sandC.getContext("2d"); sc2.fillStyle = "#e2c48a"; sc2.fillRect(0, 0, 256, 256);
  for (var st = 0; st < 26; st++) { sc2.fillStyle = st % 2 ? "rgba(150,110,60,.18)" : "rgba(255,240,200,.25)"; sc2.fillRect(0, st * 10 + (st % 3) * 2, 256, 2 + (st % 4)); }
  for (var dt = 0; dt < 900; dt++) { sc2.fillStyle = dt % 3 ? "rgba(120,90,50,.35)" : "rgba(255,250,230,.4)"; sc2.fillRect(hash(dt) * 256, hash(dt + 1) * 256, 1.5 + hash(dt + 2) * 2, 1.5); }
  for (var gl2 = 0; gl2 < 14; gl2++) { sc2.strokeStyle = "rgba(110,80,40,.35)"; sc2.lineWidth = 1.5; sc2.beginPath(); var gx = hash(gl2 + 50) * 256; sc2.moveTo(gx, 0); sc2.lineTo(gx + (hash(gl2) - .5) * 30, 256); sc2.stroke(); }
  var sandT = new T3.CanvasTexture(sandC); sandT.wrapS = sandT.wrapT = T3.RepeatWrapping;
  var rampart = new T3.Mesh(rg, toon(0xffffff, { map: sandT, vertexColors: true })); W.add(rampart);
  var rampInk = new T3.Mesh(rg, basic(0x1b1d22, { side: T3.BackSide })); rampInk.scale.set(1.004, 1.02, 1); W.add(rampInk);
  var BREACH = []; for (var bi = 0; bi < 64; bi++) BREACH.push({ z: -1800 + bi * 57 + (hash(bi) - .5) * 20, p: 0, w: 9 + hash(bi + 3) * 4 });
  var lastSig = "init";
  function cutRampart() {
    var sig = BREACH.map(function (b) { return b.p.toFixed(2); }).join(""); if (sig === lastSig) return; lastSig = sig;
    for (var zi2 = 0; zi2 < ZN; zi2++) { var z = Z0 + (Z1 - Z0) * zi2 / (ZN - 1), cut = 0;
      for (var q = 0; q < BREACH.length; q++) { var b = BREACH[q]; if (b.p <= 0) continue; var dz = (z - b.z) / b.w; if (Math.abs(dz) < 3) cut = Math.max(cut, b.p * Math.exp(-dz * dz * .7)); }
      for (var xi2 = 0; xi2 < PX.length; xi2++) { var k4 = (zi2 * PX.length + xi2) * 3, hh = PH[xi2] + rnoise(zi2, xi2); rpos[k4 + 1] = PH[xi2] <= 3 ? hh : lerp(hh, xi2 === 0 ? -.5 : 1.5, cut); } }
    rg.attributes.position.needsUpdate = true; rg.computeVertexNormals();
  }
  // strongpoints on top: low concrete bunkers with slits, sandbag rings
  var forts = new T3.Group(); W.add(forts);
  for (var fq = 0; fq < 12; fq++) { var fz = -1650 + fq * 300; var bk = inked(new T3.BoxGeometry(12, 4, 18), toon(0x8a8a80), .03); bk.position.set(124, 26, fz); forts.add(bk); var sl = new T3.Mesh(new T3.BoxGeometry(.4, .6, 12), basic(0x15171c)); sl.position.set(117.9, 26.5, fz); forts.add(sl); }
  // the west bank: palms, sandbag trench, guns further back
  var palms = new T3.Group(); W.add(palms);
  for (var pi = 0; pi < 70; pi++) { var px = -120 - rnd() * 260, pz = -1500 + rnd() * 3000; var pt = new T3.Group(); pt.position.set(px, 3, pz);
    var tr = inked(new T3.CylinderGeometry(.5, .8, 12, 7), toon(0x8a6a44), .05); tr.position.y = 6; tr.rotation.z = (rnd() - .5) * .2; pt.add(tr);
    for (var fr = 0; fr < 7; fr++) { var lf = inked(new T3.ConeGeometry(1.1, 7, 4), toon(0x5a8a3a), .05); lf.position.set(Math.cos(fr) * 2.6, 12.2, Math.sin(fr) * 2.6); lf.rotation.set(Math.sin(fr) * 1.3, 0, -Math.cos(fr) * 1.3); pt.add(lf); }
    pt.scale.setScalar(.8 + rnd() * .5); palms.add(pt); }
  var bagM = toon(0xb89a68), bagG = new T3.CapsuleGeometry(.45, 1.1, 3, 8); bagG.rotateZ(Math.PI / 2);
  var bags = new T3.InstancedMesh(bagG, bagM, 900), m4 = new T3.Matrix4(), q4 = new T3.Quaternion(), e4 = new T3.Euler(), nb = 0;
  for (var row = 0; row < 3; row++) for (var bz = -60; bz < 60; bz += 1.6) { [-112, -104].forEach(function (bx) { m4.compose(new T3.Vector3(bx, 3.5 + row * .8, bz + (row % 2) * .8), q4.setFromEuler(e4.set(0, Math.PI / 2, 0)), new T3.Vector3(1, 1, 1)); bags.setMatrixAt(nb++, m4); }); }
  bags.count = nb; bags.frustumCulled = false; W.add(bags);
  var lantern = new T3.Mesh(new T3.SphereGeometry(.35, 12, 8), basic(0xffd27a)); lantern.position.set(-108, 4.6, 2); W.add(lantern);
  var lanternL = new T3.PointLight(0xffb060, 0, 18); lanternL.position.copy(lantern.position); W.add(lanternL);
  function gun() { var g = new T3.Group(), olive = toon(0x6a6a44); var bs = inked(new T3.BoxGeometry(3, 1.6, 4), olive, .05); bs.position.y = 1.2; g.add(bs);
    var sh = inked(new T3.BoxGeometry(.3, 2.4, 3.4), olive, .05); sh.position.set(0, 2, 1); g.add(sh);
    g.barrel = new T3.Group(); g.barrel.position.set(0, 2, 0); g.barrel.rotation.x = .5; var br = inked(new T3.CylinderGeometry(.25, .3, 8, 10), toon(0x55553a), .05); br.rotation.x = Math.PI / 2; br.position.z = 4; g.barrel.add(br); g.add(g.barrel);
    [-1.4, 1.4].forEach(function (wx) { var wh = inked(new T3.CylinderGeometry(1, 1, .5, 14), toon(0x2a2a2a), .05); wh.rotation.z = Math.PI / 2; wh.position.set(wx, 1, -.6); g.add(wh); });
    g.flash = new T3.Mesh(new T3.SphereGeometry(1.4, 10, 8), basic(0xffd060)); g.flash.position.set(0, 2 + Math.sin(.5) * 8, Math.cos(.5) * 8); g.add(g.flash); return g; }
  var guns = []; for (var gi = 0; gi < 14; gi++) { var gg = gun(); gg.position.set(-240 - (gi % 2) * 30, 3, -260 + gi * 40); gg.rotation.y = Math.PI / 2; W.add(gg); guns.push(gg); }
  // smoke + fire puffs (a pool reused by the barrage)
  var puffs = []; var puffM = toon(0x6a625a, { transparent: true, opacity: .9 }), fireM = basic(0xffa040);
  for (var pp = 0; pp < 40; pp++) { var pf = new T3.Group(); var sm = inked(new T3.IcosahedronGeometry(4, 1), puffM, .03); pf.add(sm); var fi = new T3.Mesh(new T3.IcosahedronGeometry(2.6, 1), fireM); pf.add(fi); pf.fire = fi; pf.visible = false; W.add(pf); puffs.push(pf); }
  // rubber boats with soldiers and paddles
  function boat(n, k) { var g = new T3.Group(); var ring = inked(new T3.TorusGeometry(2.2, .55, 8, 22), toon(0x3a3e3a), .05); ring.rotation.x = Math.PI / 2; ring.scale.set(1.7, 1, 1); g.add(ring);
    var fl = new T3.Mesh(new T3.CircleGeometry(2.2, 18), toon(0x2a2c2a)); fl.rotation.x = -Math.PI / 2; fl.scale.set(1.7, 1, 1); fl.position.y = -.2; g.add(fl); g.men = [];
    for (var i = 0; i < n; i++) { var b = bean({ helmet: 0x7a7a50, body: 0xb8a274, k: k * 5 + i }); b.scale.setScalar(.5); b.pose("sit"); b.position.set(-2.2 + i * 1.5, .2, (i % 2 ? .7 : -.7)); b.rotation.y = Math.PI / 2; g.add(b); g.men.push(b);
      var pd = new T3.Mesh(new T3.BoxGeometry(.12, .12, 3), toon(0x8a6a44)); pd.position.set(-2.2 + i * 1.5, .9, (i % 2 ? 1.6 : -1.6)); pd.rotation.x = .5 * (i % 2 ? 1 : -1); g.add(pd); }
    if (k % 3 === 0) { var ld = ladder(9); ld.rotation.z = Math.PI / 2; ld.position.set(0, .9, 0); ld.scale.setScalar(.6); g.add(ld); }
    return g; }
  function ladder(h) { var g = new T3.Group(), wd = toon(0x9a7448); [-.6, .6].forEach(function (x) { var r = inked(new T3.BoxGeometry(.18, h, .18), wd, .06); r.position.set(x, h / 2, 0); g.add(r); }); for (var i = 1; i < h; i += 1.2) { var rr = new T3.Mesh(new T3.BoxGeometry(1.2, .12, .12), wd); rr.position.y = i; g.add(rr); } return g; }
  var boats = []; for (var bo = 0; bo < 22; bo++) { var bb = boat(4, bo); W.add(bb); boats.push(bb); }
  // pump boats: a small wooden boat, a grey pump on a frame, a fire hose and nozzle; the jet is a stream of water drops
  function pumpBoat(k) { var g = new T3.Group(); var hull = inked(new T3.BoxGeometry(7, 1.6, 3), toon(0x7a5a3a), .04); hull.position.y = .3; g.add(hull);
    var pump = inked(new T3.BoxGeometry(2.4, 1.8, 1.8), toon(0x9aa0a6), .05); pump.position.set(-1, 2, 0); g.add(pump); var fly = inked(new T3.CylinderGeometry(.7, .7, .4, 14), toon(0xc23a26), .06); fly.rotation.x = Math.PI / 2; fly.position.set(-1, 2, 1.1); g.add(fly); g.fly = fly;
    var noz = inked(new T3.CylinderGeometry(.18, .3, 2.4, 8), toon(0xc9a860), .06); noz.rotation.z = -1.1; noz.position.set(2.4, 2.4, 0); g.add(noz);
    for (var i = 0; i < 2; i++) { var b = bean({ helmet: 0x7a7a50, body: 0xb8a274, k: 80 + k * 2 + i }); b.scale.setScalar(.5); b.position.set(1.4 + i * 1.4, 1.1, i ? .9 : -.9); b.rotation.y = Math.PI / 2; g.add(b); }
    return g; }
  var pumps = []; for (var pb = 0; pb < 8; pb++) { var pbb = pumpBoat(pb); W.add(pbb); pumps.push(pbb); }
  var DROPS = 120, jets = new T3.InstancedMesh(new T3.SphereGeometry(.5, 6, 5), basic(0xe6f6ff), 8 * DROPS); jets.frustumCulled = false; W.add(jets);
  var mud = new T3.InstancedMesh(new T3.SphereGeometry(.7, 6, 5), toon(0x8a6a44), 8 * 40); mud.frustumCulled = false; W.add(mud);
  var ladders = []; for (var li = 0; li < 8; li++) { var ll = ladder(22); ll.rotation.z = .78; W.add(ll); ladders.push(ll); }
  // jets of the opening strike: swept-wing fighters, sand camouflage
  function fighter() { var g = new T3.Group(), cam0 = toon(0xc9b98a); var f = inked(new T3.CylinderGeometry(.6, .9, 14, 10), cam0, .05); f.rotation.x = Math.PI / 2; g.add(f);
    var n = inked(new T3.ConeGeometry(.6, 3, 10), cam0, .05); n.rotation.x = Math.PI / 2; n.position.z = 8.5; g.add(n);
    var sh = new T3.Shape(); sh.moveTo(0, 3); sh.lineTo(6.5, -2.5); sh.lineTo(6.5, -3.5); sh.lineTo(0, -2); sh.lineTo(-6.5, -3.5); sh.lineTo(-6.5, -2.5); sh.closePath();
    var wg = inked(new T3.ExtrudeGeometry(sh, { depth: .25, bevelEnabled: false }), toon(0xb8a874), .05); wg.rotation.x = -Math.PI / 2; wg.position.y = -.2; g.add(wg);
    var fin = inked(new T3.BoxGeometry(.2, 2.6, 2.4), cam0, .06); fin.position.set(0, 1.4, -5.6); fin.rotation.x = -.4; g.add(fin);
    var ck = new T3.Mesh(new T3.SphereGeometry(.55, 10, 8), toon(0x6aa0c0)); ck.scale.set(1, .8, 2.2); ck.position.set(0, .55, 4); g.add(ck);
    var fl = new T3.Mesh(new T3.ConeGeometry(.5, 3, 8), basic(0xffb050)); fl.rotation.x = -Math.PI / 2; fl.position.z = -8.5; g.add(fl); return g; }
  var fighters = []; for (var fj = 0; fj < 18; fj++) { var fgt = fighter(); W.add(fgt); fighters.push(fgt); }
  var runway = new T3.Mesh(new T3.PlaneGeometry(40, 900), toon(0x4a4844)); runway.rotation.x = -Math.PI / 2; runway.position.set(-1600, 3.1, 0); W.add(runway);
  // pontoon bridge + tanks
  var bridge = new T3.Group(); W.add(bridge); for (var bs = 0; bs < 20; bs++) { var sg = inked(new T3.BoxGeometry(9.6, 1.6, 12), toon(0x5a6048), .03); sg.position.set(-91 + bs * 9.8, .5, 300); bridge.add(sg); }
  bridge.add((function () { var r = new T3.Mesh(new T3.BoxGeometry(196, .3, 9), toon(0x4a4a3a)); r.position.set(2, 1.4, 300); return r; })());
  function tank() { var g = new T3.Group(), ol = toon(0x8a7a50); var h = inked(new T3.BoxGeometry(7, 2, 3.6), ol, .04); h.position.y = 1.6; g.add(h); var tu = inked(new T3.CylinderGeometry(1.4, 1.6, 1.2, 12), ol, .05); tu.position.set(-.4, 3.2, 0); g.add(tu);
    var gb = inked(new T3.CylinderGeometry(.16, .16, 5, 8), ol, .08); gb.rotation.z = Math.PI / 2; gb.position.set(3, 3.2, 0); g.add(gb);
    [-1.9, 1.9].forEach(function (z) { var tr = inked(new T3.BoxGeometry(7.4, 1.4, .9), toon(0x2a2a26), .04); tr.position.set(0, .7, z); g.add(tr); });
    var hl = new T3.Mesh(new T3.SphereGeometry(.3, 8, 6), basic(0xfff0b0)); hl.position.set(3.6, 2, 1); g.add(hl); return g; }
  var tanks = []; for (var tk = 0; tk < 6; tk++) { var tt = tank(); W.add(tt); tanks.push(tt); }
  // ships of 1975
  function ship(c) { var g = new T3.Group(); var h = inked(new T3.BoxGeometry(70, 9, 13), toon(c), .02); h.position.y = 3; g.add(h); var bw = inked(new T3.ConeGeometry(6.5, 14, 4), toon(c), .03); bw.rotation.z = -Math.PI / 2; bw.rotation.x = Math.PI / 4; bw.position.set(42, 3, 0); g.add(bw);
    var sp = inked(new T3.BoxGeometry(12, 10, 10), toon(0xf0ece2), .03); sp.position.set(-26, 12, 0); g.add(sp); var fu = inked(new T3.CylinderGeometry(2, 2, 6, 10), toon(0x2a2a2a), .05); fu.position.set(-30, 20, 0); g.add(fu);
    var fl = new T3.Mesh(new T3.BoxGeometry(.2, 2.4, 3.6), [basic(0xc22a2a), basic(0xc22a2a), basic(0xc22a2a), basic(0xc22a2a), basic(0xffffff), basic(0xffffff)]); fl.position.set(-36, 22, 0); g.add(fl);
    return g; }
  var ships = [ship(0x2f4a6a), ship(0x7a2a24), ship(0x2f5a3a)]; ships.forEach(function (s) { s.rotation.y = Math.PI / 2; W.add(s); });
  // people on the west bank: sugarcane, swimmers, laundry, the trench crew; the officer Baqi
  var crew = []; for (var cr = 0; cr < 8; cr++) { var cb = bean({ helmet: cr % 3 ? 0x7a7a50 : null, body: 0xb8a274, k: 40 + cr, mood: cr % 2 ? "smile" : "flat" }); W.add(cb); crew.push(cb); }
  var cane = new T3.Mesh(new T3.CylinderGeometry(.12, .12, 3.6, 6), toon(0x9a7a3a)); W.add(cane);
  var swim = []; for (var sw = 0; sw < 4; sw++) { var hd = bean({ k: 60 + sw, mood: "smile" }); hd.scale.setScalar(.7); W.add(hd); swim.push(hd); }
  var line = new T3.Group(); W.add(line); var rope = new T3.Mesh(new T3.CylinderGeometry(.04, .04, 10, 4), toon(0x2a2a2a)); rope.rotation.z = Math.PI / 2; rope.position.y = 3.2; line.add(rope);
  for (var sh2 = 0; sh2 < 4; sh2++) { var cl = inked(new T3.BoxGeometry(1.6, 1.8, .1), toon([0xb8a274, 0xf0ece2, 0x8a9a6a, 0xd8c8a8][sh2]), .05); cl.position.set(-3.6 + sh2 * 2.4, 2.2, 0); line.add(cl); line["c" + sh2] = cl; }
  [-5, 5].forEach(function (x) { var p = new T3.Mesh(new T3.CylinderGeometry(.1, .1, 3.4, 5), toon(0x6a4a2a)); p.position.set(x, 1.7, 0); line.add(p); });
  var baqi = bean({ cap: 0x6a6a44, body: 0xa89a6a, mustache: true, k: 7, mood: "flat" }); W.add(baqi);
  var iftar = []; for (var ifr = 0; ifr < 6; ifr++) { var ib = bean({ helmet: ifr % 2 ? 0x7a7a50 : null, body: 0xb8a274, k: 90 + ifr, mood: "smile" }); W.add(ib); iftar.push(ib); }

  // ═════════ ROOM: a bedroom in Tel Aviv before dawn, the phone ringing ═════════
  var RM = mkScene(); setTOD(RM, "night"); RM.fog = null;
  var room = new T3.Mesh(new T3.BoxGeometry(30, 14, 30), toon(0x5a6a7a, { side: T3.BackSide })); room.position.y = 7; RM.add(room);
  var bedM = inked(new T3.BoxGeometry(10, 2, 7), toon(0xe8e2d4), .02); bedM.position.set(-4, 1.5, -6); RM.add(bedM);
  var blank = inked(new T3.BoxGeometry(7, .6, 7.2), toon(0x5a7aa8), .02); blank.position.set(-2.6, 2.8, -6); RM.add(blank);
  var tabl = inked(new T3.BoxGeometry(2.6, 3, 2.6), toon(0x7a5a3a), .03); tabl.position.set(3, 1.5, -8); RM.add(tabl);
  var phone = inked(new T3.BoxGeometry(1.4, .6, 1.2), toon(0x1e1e1e), .05); phone.position.set(3, 3.3, -8); RM.add(phone);
  var hand = inked(new T3.CapsuleGeometry(.18, 1.1, 4, 8), toon(0x1e1e1e), .06); hand.rotation.z = Math.PI / 2; hand.position.set(3, 3.8, -8); RM.add(hand);
  var lamp = new T3.Mesh(new T3.SphereGeometry(.6, 12, 10), basic(0xffd890)); lamp.position.set(5.5, 4.6, -8.6); RM.add(lamp); var lampL = new T3.PointLight(0xffc070, 1.2, 30); lampL.position.copy(lamp.position); RM.add(lampL);
  var win = new T3.Mesh(new T3.PlaneGeometry(6, 5), basic(0x1a2a50)); win.position.set(-6, 8, -14.9); RM.add(win); var winF = new T3.Mesh(new T3.BoxGeometry(6.4, .3, .3), toon(0xe8e2d4)); winF.position.set(-6, 8, -14.8); RM.add(winF);
  var wclock = new T3.Group(); wclock.position.set(6, 9, -14.8); RM.add(wclock); var rimc = inked(new T3.CylinderGeometry(2, 2, .3, 32), toon(0x6a4a2a), .04); rimc.rotation.x = Math.PI / 2; wclock.add(rimc);
  var cfc = document.createElement("canvas"); cfc.width = cfc.height = 256; var cf = cfc.getContext("2d"); cf.fillStyle = "#f6f0e0"; cf.beginPath(); cf.arc(128, 128, 126, 0, 7); cf.fill(); cf.fillStyle = "#1b1d22"; cf.font = "bold 34px serif"; cf.textAlign = "center"; cf.textBaseline = "middle";
  for (var cn = 1; cn <= 12; cn++) { var ca = cn / 12 * Math.PI * 2; cf.fillText(String(cn), 128 + Math.sin(ca) * 98, 128 - Math.cos(ca) * 98); }
  var face = new T3.Mesh(new T3.CircleGeometry(1.8, 40), basic(0xffffff, { map: new T3.CanvasTexture(cfc) })); face.position.z = .17; wclock.add(face);
  var hH = new T3.Mesh(new T3.BoxGeometry(.16, 1.0, .1), basic(0x15171c)), hM = new T3.Mesh(new T3.BoxGeometry(.1, 1.5, .1), basic(0x15171c)); hH.geometry.translate(0, .45, 0); hM.geometry.translate(0, .7, 0); hH.position.z = hM.position.z = .25; wclock.add(hH, hM);
  function setClock(h, m) { hH.rotation.z = -((h % 12) + m / 60) / 12 * Math.PI * 2; hM.rotation.z = -m / 60 * Math.PI * 2; }
  var golda = bean({ bun: true, hair: 0x9a9a9a, body: 0x34405a, k: 2, mood: "flat" }); golda.position.set(1, 0, -5); RM.add(golda);
  var aide = bean({ hair: 0x3a2a1a, body: 0x5a6a5a, k: 3 }); aide.position.set(7, 0, -2); aide.rotation.y = -.8; RM.add(aide);

  // ═════════ TENT: the 1969 meeting of the division's officers around a map ═════════
  var TN = mkScene(); setTOD(TN, "day"); TN.fog = null;
  var tent = new T3.Mesh(new T3.ConeGeometry(26, 16, 4, 1, true), toon(0x9a8a5a, { side: T3.BackSide })); tent.rotation.y = Math.PI / 4; tent.position.y = 8; TN.add(tent);
  var tfloor = new T3.Mesh(new T3.PlaneGeometry(60, 60), toon(0xc9a86c)); tfloor.rotation.x = -Math.PI / 2; TN.add(tfloor);
  var mapC = document.createElement("canvas"); mapC.width = 256; mapC.height = 160; var mc = mapC.getContext("2d"); mc.fillStyle = "#e8dcb8"; mc.fillRect(0, 0, 256, 160); mc.fillStyle = "#3a8ab8"; mc.fillRect(110, 0, 26, 160); mc.fillStyle = "#c9a060"; mc.fillRect(136, 0, 10, 160);
  mc.strokeStyle = "#b8322a"; mc.lineWidth = 3; for (var ar2 = 0; ar2 < 4; ar2++) { mc.beginPath(); mc.moveTo(60, 30 + ar2 * 35); mc.lineTo(150, 30 + ar2 * 35); mc.stroke(); mc.beginPath(); mc.moveTo(150, 30 + ar2 * 35); mc.lineTo(140, 24 + ar2 * 35); mc.lineTo(140, 36 + ar2 * 35); mc.fill(); }
  var table = inked(new T3.BoxGeometry(10, .5, 6.4), [toon(0x7a5a3a), toon(0x7a5a3a), toon(0xffffff, { map: new T3.CanvasTexture(mapC) }), toon(0x7a5a3a), toon(0x7a5a3a), toon(0x7a5a3a)], .02); table.position.y = 3; TN.add(table);
  [[-4.5, -2.8], [4.5, -2.8], [-4.5, 2.8], [4.5, 2.8]].forEach(function (p) { var lg = new T3.Mesh(new T3.BoxGeometry(.3, 3, .3), toon(0x5a3a22)); lg.position.set(p[0], 1.5, p[1]); TN.add(lg); });
  var officers = []; [[-7, -2, 1.2], [-7, 2, 1.6], [0, 5.6, 3.14], [7, 2, -1.6], [7, -2, -1.3], [0, -5.6, 0]].forEach(function (p, i) { var o = bean({ cap: 0x6a6a44, body: 0xa89a6a, mustache: i % 2 === 0, k: 20 + i }); o.position.set(p[0], 0, p[1]); o.rotation.y = p[2]; TN.add(o); officers.push(o); });
  var tbaqi = officers[2];   // the young engineer, facing the table from the far side
  var tlamp = new T3.PointLight(0xffe0a0, .6, 40); tlamp.position.set(0, 12, 0); TN.add(tlamp);

  // ═════════ DAM: the Aswan High Dam works, sand moved by water jets ═════════
  var DM = mkScene(); setTOD(DM, "day");
  var dg = new T3.Mesh(new T3.PlaneGeometry(4000, 4000), toon(0xc8a46a)); dg.rotation.x = -Math.PI / 2; DM.add(dg);
  var lake = new T3.Mesh(new T3.PlaneGeometry(4000, 1800), toon(0x2f8fb8)); lake.rotation.x = -Math.PI / 2; lake.position.set(0, 1, -1300); DM.add(lake);
  var dsh = new T3.Shape(); dsh.moveTo(-120, 0); dsh.lineTo(-20, 50); dsh.lineTo(20, 50); dsh.lineTo(120, 0); dsh.closePath();
  var dam = inked(new T3.ExtrudeGeometry(dsh, { depth: 1600, bevelEnabled: false }), toon(0xb8a070), .01); dam.rotation.y = Math.PI / 2; dam.position.set(-800, 0, -380); DM.add(dam);
  var lotus = new T3.Group(); lotus.position.set(150, 0, -330); DM.add(lotus); for (var lp = 0; lp < 5; lp++) { var pet = inked(new T3.BoxGeometry(3, 70, 8), toon(0xe8e2d4), .03); pet.position.y = 35; pet.rotation.y = lp / 5 * Math.PI * 2; pet.position.x = Math.cos(lp / 5 * Math.PI * 2) * 4; pet.position.z = Math.sin(lp / 5 * Math.PI * 2) * 4; pet.rotation.z = Math.cos(lp / 5 * Math.PI * 2) * .1; lotus.add(pet); }
  var mound = new T3.Mesh(new T3.SphereGeometry(30, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2), toon(0xd8b878)); mound.scale.set(1, .6, 1); mound.position.set(0, 0, 0); DM.add(mound);
  var monitors = []; for (var mo = 0; mo < 3; mo++) { var mn = new T3.Group(); var pipe = inked(new T3.CylinderGeometry(.6, .6, 10, 10), toon(0x6a7078), .05); pipe.rotation.z = Math.PI / 2; mn.add(pipe); var nz = inked(new T3.CylinderGeometry(.4, .8, 4, 10), toon(0xc23a26), .05); nz.rotation.z = -1.2; nz.position.set(5.5, 1.6, 0); mn.add(nz); mn.position.set(-60, 2, -30 + mo * 30); DM.add(mn); monitors.push(mn); }
  var dw = []; [0, 1, 2].forEach(function (i) { var b = bean({ helmet: 0xf2c230, body: 0x3a5a8a, k: 30 + i, mood: "smile" }); b.position.set(-66, 0, -26 + i * 30); b.rotation.y = Math.PI / 2; DM.add(b); dw.push(b); });
  var djets = new T3.InstancedMesh(new T3.SphereGeometry(.9, 6, 5), basic(0xe6f6ff), 3 * DROPS); djets.frustumCulled = false; DM.add(djets);
  var dyoung = bean({ cap: 0x6a6a44, body: 0xa89a6a, mustache: true, k: 7 }); dyoung.position.set(-74, 0, 12); dyoung.rotation.y = 1.2; DM.add(dyoung);

  // ── animated pieces ──
  var dm = new T3.Matrix4(), dv = new T3.Vector3(), ds = new T3.Vector3(), dq = new T3.Quaternion();
  function stream(inst, base, n, from, to, arc, t, sp, sz) { for (var i = 0; i < n; i++) { var u = ((t * (sp || 1.2) + i / n) % 1); dv.set(lerp(from.x, to.x, u), lerp(from.y, to.y, u) + Math.sin(u * Math.PI) * arc + Math.sin(i * 3.3) * u * .8, lerp(from.z, to.z, u) + Math.sin(i * 7.1) * (.2 + u * 1.4)); ds.setScalar((sz || 1) * (.35 + .9 * u * u)); dm.compose(dv, dq, ds); inst.setMatrixAt(base + i, dm); } inst.instanceMatrix.needsUpdate = true; }
  function hideInst(inst, a, b) { ds.setScalar(0); dm.compose(dv.set(0, -999, 0), dq, ds); for (var i = a; i < b; i++) inst.setMatrixAt(i, dm); inst.instanceMatrix.needsUpdate = true; }
  function foamAnim(t) { for (var i = 0; i < 160; i++) { dv.set(-80 + hash(i) * 170, .1, ((hash(i + 3) * 3000 + t * (4 + hash(i) * 3)) % 3000) - 1500); ds.set(1, 1, 1); dm.compose(dv, dq, ds); foam.setMatrixAt(i, dm); } foam.instanceMatrix.needsUpdate = true; }
  function hideAll() {
    boats.forEach(function (b) { b.visible = false; }); if (typeof gulls !== "undefined") gulls.forEach(function (g) { g.visible = false; }); pumps.forEach(function (b) { b.visible = false; }); ladders.forEach(function (b) { b.visible = false; });
    fighters.forEach(function (b) { b.visible = false; }); tanks.forEach(function (b) { b.visible = false; }); ships.forEach(function (b) { b.visible = false; }); puffs.forEach(function (b) { b.visible = false; });
    crew.forEach(function (b) { b.visible = false; }); swim.forEach(function (b) { b.visible = false; }); iftar.forEach(function (b) { b.visible = false; });
    guns.forEach(function (g) { g.flash.visible = false; }); bridge.visible = false; cane.visible = false; line.visible = false; baqi.visible = false; lantern.visible = false; lanternL.intensity = 0;
    hideInst(jets, 0, 8 * DROPS); hideInst(mud, 0, 320);
  }
  function setOne(ids, p) { BREACH.forEach(function (b, i) { b.p = ids.indexOf(i) >= 0 ? clamp(p) : 0; }); cutRampart(); }
  function setBreach(p, n) { BREACH.forEach(function (b, i) { b.p = i < (n == null ? 64 : n) ? clamp(p * (1 + hash(i) * .3) - hash(i + 9) * .25) : 0; }); cutRampart(); }
  var TGT = new T3.Vector3(), V1 = new T3.Vector3(), V2 = new T3.Vector3(), UP = new T3.Vector3(0, 1, 0);
  function camLook(px, py, pz, lx, ly, lz) { cam.position.set(px, py, pz); TGT.set(lx, ly, lz); cam.lookAt(TGT); }
  function groundAt(x, z) { if (x < -95) return 3; if (x < PX[0]) return 0; if (x > PX[PX.length - 1]) return 3; var j = 0; while (j < PX.length - 2 && PX[j + 1] < x) j++;
    var h = lerp(PH[j], PH[j + 1], (x - PX[j]) / (PX[j + 1] - PX[j])), cut = 0; for (var q = 0; q < BREACH.length; q++) { var b = BREACH[q]; if (b.p > 0) { var dz = (z - b.z) / b.w; cut = Math.max(cut, b.p * Math.exp(-dz * dz * .7)); } } return lerp(h, 1.5, cut); }
  function clampCam() { var g = groundAt(cam.position.x, cam.position.z) + 1.4; if (cam.position.y < g) { cam.position.y = g; cam.lookAt(TGT); } }
  // a slow handheld float + push-in applied after every shot, scaled to the distance, so no frame ever settles
  function breathe(t, u) { V1.subVectors(TGT, cam.position); var dist = V1.length(); V1.normalize(); V2.crossVectors(V1, UP).normalize();
    var a = dist * .09; cam.position.addScaledVector(V2, Math.sin(t * .85) * a + Math.sin(t * 1.9) * a * .3).addScaledVector(UP, Math.cos(t * .7) * a * .6).addScaledVector(V1, Math.min(u, 8) * dist * (dist < 25 ? .008 : .018)); TGT.addScaledVector(V2, Math.sin(t * .6 + 1) * dist * .07).addScaledVector(UP, Math.sin(t * .45) * dist * .035); cam.lookAt(TGT); }
  function drift(t, a) { a = a || 1; cam.position.x += Math.sin(t * .7) * .6 * a; cam.position.y += Math.cos(t * .5) * .4 * a; }
  function barrage(t, k, onWall) { puffs.forEach(function (pf, i) { var ph = ((t * .8 + hash(i)) % 1); pf.visible = k > 0; var z = -260 + hash(i + 4) * 520 + Math.floor(t * .8 + hash(i)) * 37 % 200; pf.position.set(onWall ? 118 + hash(i + 8) * 20 : 140 + hash(i) * 60, 22 + ph * 18, z); pf.scale.setScalar(.4 + ph * 1.4); pf.fire.visible = ph < .3; pf.children[0].main && (pf.children[0].main.material.opacity = 1 - ph * .6); }); }
  function gunsFire(t) { guns.forEach(function (g, i) { var ph = (t * 1.3 + hash(i) * 3) % 1; g.flash.visible = ph < .12; g.barrel.rotation.x = .5 - (ph < .12 ? .05 : 0); }); }
  function flyFighters(t, k, n, x0, x1, alt) { for (var i = 0; i < 18; i++) { var f = fighters[i]; f.visible = i < n; if (!f.visible) continue; var row = i % 6, col = Math.floor(i / 6); f.position.set(lerp(x0, x1, k) - col * 40 - row * 8, alt + row * 6 + Math.sin(t * 2 + i) * .5, -120 + row * 50 + col * 18); f.rotation.set(0, Math.PI / 2, Math.sin(t + i) * .05); } }
  function boatsCross(t, k, n, z0) { for (var i = 0; i < boats.length; i++) { var b = boats[i]; b.visible = i < n; if (!b.visible) continue; var lag = hash(i) * .25, kk = clamp((k - lag) / (1 - lag)); b.position.set(lerp(-85, 78, kk), .3 + Math.sin(t * 2 + i) * .15, z0 + (i - n / 2) * 16 + hash(i + 2) * 6); b.rotation.y = Math.sin(t + i) * .05; b.men.forEach(function (m, j) { live(m, t + j); m.pose(kk < 1 ? "paddle" : "sit", t + j * .4); m.position.y = .2 + Math.abs(Math.sin(t * 3 + j)) * .03; }); } }
  function pumpsWork(t, k, n, base) { for (var i = 0; i < 8; i++) { var pb = pumps[i]; pb.visible = i < n; if (!pb.visible) { hideInst(jets, i * DROPS, (i + 1) * DROPS); hideInst(mud, i * 40, (i + 1) * 40); continue; } var z = BREACH[base + i].z; pb.position.set(60, .2 + Math.sin(t * 1.6 + i) * .15, z); pb.fly.rotation.y = t * 20;
      if (k > 0) { var bz2 = z; stream(jets, i * DROPS, DROPS, { x: 63.5, y: 3.8, z: z }, { x: 100, y: lerp(14, 4, k), z: bz2 }, 6, t + i * .3, 1.6, 1.4); stream(mud, i * 40, 40, { x: 100, y: lerp(12, 3, k), z: z }, { x: 86, y: -.5, z: z + 2 }, 1.5, t + i, .5, 1.1); }
      else { hideInst(jets, i * DROPS, (i + 1) * DROPS); hideInst(mud, i * 40, (i + 1) * 40); } } }

  // ═════════ shots: one per line ═════════
  var SH = {}; function shot(i, f) { SH[i] = f; }
  var OV = document.getElementById("ov"), OVS = document.getElementById("ovs"), OVB = document.getElementById("ovbox");
  var ovSet = { txt: "", sub: "" }, BINO = document.getElementById("bino");
  function over(u, txt, sub, at, col) { var k = clamp((u - (at || .3)) / .5); OVB.style.opacity = k; if (ovSet.txt !== txt) { OV.textContent = txt; ovSet.txt = txt; } if (ovSet.sub !== (sub || "")) { OVS.textContent = sub || ""; ovSet.sub = sub || ""; } OV.style.color = col || "#fff"; }
  function W0(tod) { setTOD(W, tod); hideAll(); setBreach(0); return W; }

  // 0 — 6 October 1973, 10 Ramadan: the canal from high up, noon
  shot(0, function (u, d, t) { var k = ease(u / d); W0("noon"); setBreach(0); camLook(lerp(-420, -260, k), lerp(260, 170, k), lerp(380, 200, k), 40, 0, -200); drift(t); over(u, "6 أكتوبر 1973", "10 رمضان", .4); return W; });
  // 1 — hot sun, still water, fasting soldiers (in the shade of the palms)
  shot(1, function (u, d, t) { var k = ease(u / d); W0("noon"); crew.slice(0, 4).forEach(function (c, i) { c.visible = true; c.position.set(-128 - i * 3.2, 3, 10 + i * 2); c.rotation.y = 1.2; c.mood("flat"); live(c, t); });
    camLook(lerp(-110, -115, k), 6, lerp(26, 22, k), -130, 5, 10); drift(t, .3); over(u, "صايمين", "", 9); return W; });
  // 2 — on the other bank, a sand mountain more than 20 m high along the canal
  shot(2, function (u, d, t) { var k = ease(u / d); W0("noon"); camLook(lerp(-60, 10, k), lerp(8, 14, k), lerp(60, 40, k), 110, lerp(12, 18, k), -60); flyGulls(t, 40, 30, -20); drift(t, .5); over(u, "أكتر من 20 متر", "الساتر الترابي", 1.2, "#f2c230"); return W; });
  // 3 — it was said it would take an atomic bomb to open it
  shot(3, function (u, d, t) { var k = ease(u / d); W0("noon"); camLook(lerp(40, 70, k), lerp(10, 16, k), 30, 120, 20, 0); flyGulls(t, 90, 34, -10); drift(t, .4); over(u, "قنبلة ذرية؟", "", .6); return W; });
  // 4 — so how did it open in hours… with the canal's own water?
  shot(4, function (u, d, t) { var k = ease(u / d); W0("noon"); setOne([32, 33], .15 + .55 * k); pumpsWork(t, .3 + .6 * k, 2, 32); camLook(40, 9, BREACH[32].z + 40, 96, 9, BREACH[32].z + 20); drift(t, .4); over(u, "بالمية؟", "", .8); return W; });
  // 5 — and why did it start at 2 in the afternoon, not at dawn?
  shot(5, function (u, d, t) { var k = ease(u / d); W0("noon"); setBreach(0); camLook(lerp(-200, -150, k), 40, 120, 0, 60, -400); flyGulls(t, -120, 60, 20); drift(t); over(u, "14:00", "مش مع الفجر؟", .3, "#f2c230"); return W; });
  // 6 — the story of that day, hour by hour; we start before dawn
  shot(6, function (u, d, t) { var k = ease(u / d); W0("night"); camLook(lerp(-300, -200, k), 80, 300, 40, 0, -100); drift(t); over(u, "قبل الفجر", "", .6); return W; });
  // 7 — 3 a.m., soldiers eat suhoor in the trenches; nobody knows today is the day
  shot(7, function (u, d, t) { var k = ease(u / d); W0("night"); lantern.visible = true; lanternL.intensity = 1.6 + Math.sin(t * 9) * .2;
    crew.slice(0, 4).forEach(function (c, i) { c.visible = true; c.position.set(-108 + (i % 2 ? 1.6 : -1.6), 3, -1 + i * 1.6); c.rotation.y = i % 2 ? -Math.PI / 2 : Math.PI / 2; c.mood(i === 1 ? "smile" : "flat"); live(c, t + i); c.pose("stand", t); c.position.y = 3; c.scale.setScalar(.85); c.armR.rotation.x = -.4 - Math.max(0, Math.sin(t * 2 + i)) * .9; c.armR.elbow.rotation.x = -1.5; });
    camLook(lerp(-99, -100, k), 10.5, lerp(12, 10, k), -108, 5, 1.5); over(u, "3:00", "السحور", .3, "#f2c230"); return W; });
  // 8 — most learned only hours before, so the secret wouldn't leak
  shot(8, function (u, d, t) { W0("night"); lantern.visible = true; lanternL.intensity = 1.5; var a = crew[0], b = crew[1]; [a, b].forEach(function (c, i) { c.visible = true; c.position.set(-108 + (i ? .9 : -.9), 3, 2); c.rotation.y = i ? -1.2 : 1.2; c.mood("flat"); live(c, t); c.head.rotation.z = (i ? -1 : 1) * .25; });
    camLook(-101 + Math.sin(t * .4) * .5, 9.5, 8, -108, 6, 2); over(u, "سرّ", "", .5); return W; });
  // 9 — after dawn, on the bank, a strange scene
  shot(9, function (u, d, t) { var k = ease(u / d); W0("dawn"); camLook(lerp(-40, -20, k), 30, 160, -130, 4, 0); drift(t); return W; });
  // 10 — soldiers sucking sugarcane, swimming in the canal, washing clothes
  shot(10, function (u, d, t) { var k = ease(u / d); W0("day"); var a = crew[0]; a.visible = true; a.position.set(-118, 3, 4); a.rotation.y = 1.4; a.mood("smile"); live(a, t); a.armR.rotation.z = 2.2; cane.visible = true; cane.position.set(-117.2, 6.2, 4.6); cane.rotation.z = -.3;
    swim.forEach(function (s, i) { s.visible = true; s.position.set(-70 + i * 6, -2.1 + Math.sin(t * 2 + i) * .2, 14 + (i % 2) * 6); s.rotation.y = 1.6; live(s, t + i); s.mood("smile"); });
    line.visible = true; line.position.set(-126, 3, 20); line.rotation.y = 1.4; for (var j = 0; j < 4; j++) line["c" + j].rotation.x = Math.sin(t * 2 + j) * .2; var c2 = crew[1]; c2.visible = true; c2.position.set(-124, 3, 15); c2.rotation.y = 1.4; live(c2, t); c2.armL.rotation.z = -2.4;
    camLook(lerp(-100, -102, k), 10, lerp(-8, -5, k), -118, 4, 8); drift(t, .2); return W; });
  // 11 — on purpose: the other bank had to see a perfectly ordinary day (seen from a bunker slit)
  shot(11, function (u, d, t) { var k = ease(u / d); W0("day"); crew.slice(0, 3).forEach(function (c, i) { c.visible = true; c.position.set(-120 - i * 4, 3, 4 + i * 5); c.rotation.y = 1.4; c.mood("smile"); live(c, t); }); swim.forEach(function (s, i) { s.visible = true; s.position.set(-70 + i * 6, -2.1 + Math.sin(t * 2 + i) * .2, 14); });
    camLook(118, 27, 0, -116, 4, 8); cam.fov = lerp(5, 4, k); cam.updateProjectionMatrix(); BINO.style.opacity = 1; over(u, "يوم عادي", "", 1.2); return W; });
  // 12 — meanwhile in Tel Aviv, about 4 a.m., the prime minister is woken with news
  shot(12, function (u, d, t) { var k = ease(u / d); setClock(4, 2 + u * .3); var ring = (u % 1.2) < .6; phone.position.y = 3.3 + (ring ? Math.sin(t * 60) * .05 : 0); golda.position.set(-3, 2.6, -6); golda.rotation.set(0, 0, lerp(-Math.PI / 2, 0, ease((u - 1.5) / 1.5))); golda.position.y = lerp(2.6, 0, ease((u - 1.5) / 1.5)); live(golda, t); golda.mood("flat");
    camLook(lerp(10, 8, k), 7, lerp(8, 5, k), 0, 3, -7); return RM; });
  // 13 — war will break out today… at 6 in the evening
  shot(13, function (u, d, t) { var k = ease(u / d); setClock(4, 6 + u * .3); golda.position.set(2.2, 0, -6.4); golda.rotation.set(0, -.4, 0); golda.mood("sad"); live(golda, t); golda.armR.rotation.z = 2.6; hand.position.set(2.9, 4.1, -6.1);
    camLook(lerp(6, 4.6, k), 4.6, lerp(2, 0, k), 2.2, 3.4, -6.4); over(u, "18:00", "الساعة ستة المغرب", .4, "#f2c230"); return RM; });
  // 14 — six in the evening. remember that number.
  shot(14, function (u, d, t) { setClock(18, 0); golda.mood("flat"); camLook(6, 9, -7 + Math.sin(t * .3) * .3, 6, 9, -14.8); over(u, "6 المغرب", "افتكروا الرقم ده", .2, "#f2c230"); return RM; });
  // 15 — to understand the sand mountain we go back four years
  shot(15, function (u, d, t) { var k = ease(u / d); W0("day"); camLook(lerp(-100, -260, k), lerp(60, 140, k), lerp(140, 300, k), 100, 10, 0); var y = Math.round(lerp(1973, 1969, clamp(u / (d * .7)))); over(u, String(y), "", .1, "#f2c230"); return W; });
  // 16 — 1969: a division commander gathers his officers; one question: how do we open it?
  shot(16, function (u, d, t) { var k = ease(u / d); officers.forEach(function (o, i) { live(o, t + i); o.mood("flat"); o.head.rotation.x = .25; }); camLook(Math.cos(t * .08) * 16, lerp(14, 11, k), Math.sin(t * .08) * 16, 0, 3, 0); over(u, "1969", "نفتحه إزاي؟", .3, "#f2c230"); return TN; });
  // 17 — bombs? the sand falls back into place. digging? a whole day under fire.
  shot(17, function (u, d, t) { var k = ease(u / d); W0("day"); setBreach(0); var ph = (u % 2.2) / 2.2; puffs.slice(0, 6).forEach(function (pf, i) { pf.visible = true; pf.position.set(108 + i * 2, 18 + ph * 10, -20 + i * 8); pf.scale.setScalar(.3 + ph * 1.6); pf.fire.visible = ph < .25; });
    camLook(50, 14, 40, 110, 16, -10); drift(t, .4); over(u, u < d * .5 ? "قنابل؟" : "حفر؟", u < d * .5 ? "الرملة بترجع مكانها" : "يوم كامل تحت النار", .3); return W; });
  // 18 — in the end a lieutenant-colonel engineer named Baqi Zaki Youssef raised his hand
  shot(18, function (u, d, t) { var k = ease(u / d); officers.forEach(function (o, i) { live(o, t + i); o.head.rotation.x = 0; }); tbaqi.armR.rotation.z = lerp(.5, 2.9, ease((u - .4) / .6)); tbaqi.mood("flat"); officers[0].head.rotation.y = .5; officers[4].head.rotation.y = -.5;
    camLook(lerp(-3, -1.5, k), 4.6, lerp(-4, -1.4, k), 0, 3.6, 5.6); over(u, "باقي زكي يوسف", "مقدم مهندس", 1.0, "#f2c230"); return TN; });
  // 19 — before that he worked at the High Dam, and saw something very simple there
  shot(19, function (u, d, t) { var k = ease(u / d); setTOD(DM, "day"); camLook(lerp(-300, -200, k), lerp(120, 80, k), lerp(260, 180, k), 0, 30, -200); stream(djets, 0, DROPS * 3, { x: 0, y: -999, z: 0 }, { x: 0, y: -999, z: 0 }, 0, t); over(u, "السد العالي", "", .5); return DM; });
  // 20 — they moved mountains of sand… with high-pressure water jets
  shot(20, function (u, d, t) { var k = ease(u / d); mound.scale.set(1 - k * .25, .6 - k * .25, 1 - k * .25); monitors.forEach(function (m, i) { stream(djets, i * DROPS, DROPS, { x: -52, y: 4, z: m.position.z }, { x: -18, y: 10 - k * 4, z: m.position.z * .6 }, 7, t + i * .3, 1.3, 1.2); }); dw.forEach(function (b, i) { live(b, t + i); });
    camLook(lerp(-90, -84, k), 14, 50, -20, 6, -4); drift(t, .4); over(u, "مية بضغط عالي", "", .6); return DM; });
  // 21 — he said: the wall is sand, the canal is full of water. hit the sand with the water.
  shot(21, function (u, d, t) { var k = ease(u / d); W0("day"); setOne([32], .6 * k); pumpsWork(t, .3 + .5 * k, 1, 32); camLook(lerp(30, 40, k), 10, BREACH[32].z + 30, 96, 10, BREACH[32].z); drift(t, .3); over(u, "رملة + مية", "", .8, "#7ad0f0"); return W; });
  // 22 — the idea was so simple that many didn't believe it
  shot(22, function (u, d, t) { officers.forEach(function (o, i) { live(o, t + i); o.mood(i === 2 ? "smile" : "flat"); o.head.rotation.y = i === 2 ? 0 : Math.sin(t * 3 + i) * .35; }); tbaqi.armR.rotation.z = .5; camLook(9 + Math.sin(t * .2), 6, 7, 0, 3.5, 0); return TN; });
  // 23 — tests on al-Ballah island, more than 300, on a sand wall built like the real one
  shot(23, function (u, d, t) { var k = ease(u / d); W0("day"); var n = Math.round(lerp(1, 300, clamp(u / (d * .85)))); setOne([33], (u * .6) % 1); pumpsWork(t, (u * .6) % 1, 1, 33); camLook(lerp(20, 30, k), 30, BREACH[33].z + 60, 100, 6, BREACH[33].z); over(u, "تجربة " + n, "جزيرة البلاح", .1, "#f2c230"); return W; });
  // 24 — the army bought water pumps abroad, without anyone knowing where they were going
  shot(24, function (u, d, t) { var k = ease(u / d); W0("day"); setBreach(0); pumps.forEach(function (pb, i) { pb.visible = i < 4; pb.position.set(-130 + i * 9, 3.2, -40); pb.rotation.y = 0; pb.fly.rotation.y = t * 3; }); camLook(-113 + Math.cos(t * .3) * 18, 12, -40 + Math.sin(t * .3) * 18, -116, 3, -40); over(u, "مضخات", "", .5); return W; });
  // 25 — back to 6 October: 1:30 p.m., the jets take off
  shot(25, function (u, d, t) { var k = ease(u / d); W0("noon"); setBreach(0); for (var i = 0; i < 18; i++) { var f = fighters[i]; f.visible = i < 6; if (!f.visible) continue; var kk = clamp(k * 1.4 - i * .08); f.position.set(-1600 + (i % 2) * 14, 4 + Math.max(0, kk - .4) * 60, -300 + kk * 700 + i * 30); f.rotation.set(-Math.max(0, kk - .4) * .4, 0, 0); }
    camLook(-1560, 10, lerp(-260, 60, k), -1600, 8, lerp(-200, 200, k)); over(u, "1:30", "", .3, "#f2c230"); return W; });
  // 26 — exactly 2:00, more than 200 jets cross the canal at the same moment
  shot(26, function (u, d, t) { var k = u / d; W0("noon"); setBreach(0); flyFighters(t, k, 18, -300, 500, 40); camLook(-30, 26, -60, 60, 40, 60); drift(t, .4); over(u, "14:00", "أكتر من 200 طيارة", .2, "#f2c230"); return W; });
  // 27 — five minutes later about 2,000 guns fire at once, for 53 minutes
  shot(27, function (u, d, t) { var k = ease(u / d); W0("smoke"); setBreach(0); gunsFire(t); barrage(t, 1, true); camLook(lerp(-300, -280, k), 30, lerp(-120, -60, k), 120, 20, 0); drift(t, 1.5); over(u, "2000 مدفع", "53 دقيقة", .3, "#f2c230"); return W; });
  // 28 — the answer: at 2 the sun is behind the Egyptian soldiers… and in the eyes of those facing them
  shot(28, function (u, d, t) { var k = ease(u / d); W0("noon"); W.sun.position.set(-500, 260, 0); W.sun.intensity = 1.0; barrage(t, 1, false); gunsFire(t); flyFighters(t, (u / d) * 1.2, 12, 300, -500, 70); fighters.forEach(function (f) { f.rotation.y = -Math.PI / 2; }); camLook(124, 28, 20, -400, 120, -40); drift(t, .3); over(u, "☀", "الشمس في عينهم", .3, "#ffd060"); return W; });
  // 29 — Tel Aviv was waiting for 6 p.m.; the war began four hours early
  shot(29, function (u, d, t) { setClock(14, Math.min(59, u * 4)); camLook(6, 9, -7 + Math.sin(t * .3) * .3, 6, 9, -14.8); over(u, "\u206618:00 ≠ 14:00\u2069", "قبل ميعادهم بـ4 ساعات", .4, "#f2c230"); return RM; });
  // 30 — 2:20, the first rubber boats go into the water
  shot(30, function (u, d, t) { var k = u / d; W0("smoke"); setBreach(0); boatsCross(t, k * .55, 16, 0); camLook(lerp(-150, -130, k), 28, 120, 0, 0, 0); drift(t, .5); over(u, "14:20", "", .3, "#f2c230"); return W; });
  // 31 — imagine you're sitting in that boat, fasting, holding your rifle and a wooden ladder…
  shot(31, function (u, d, t) { var k = u / d; W0("smoke"); var b = boats[4]; b.visible = true; b.position.set(lerp(-40, 0, k), .3 + Math.sin(t * 2) * .15, 0); b.rotation.y = 0; b.men.forEach(function (m, j) { live(m, t + j); m.mood("flat"); }); boatsCross(t, .3 + k * .4, 10, 60); b.visible = true; b.position.set(lerp(-40, 0, k), .3, 0); b.men.forEach(function (m, j) { m.pose("paddle", t + j * .4); });
    camLook(b.position.x - 6.5, 3.6 + Math.sin(t * 2) * .15, .3, 100, 10, 0); return W; });
  // 32 — and ahead of you a mountain of sand taller than a seven-storey building
  shot(32, function (u, d, t) { var k = ease(u / d); W0("smoke"); boatsCross(t, .88, 10, 0); camLook(30, 3, 40, 100, lerp(8, 24, k), 0); over(u, "7 أدوار", "", .8, "#f2c230"); return W; });
  // 33 — and you hear the thousands around you say together: Allahu Akbar
  shot(33, function (u, d, t) { var k = ease(u / d); W0("smoke"); boatsCross(t, .95, 14, 0); boats.forEach(function (b) { b.men.forEach(function (m, j) { live(m, t + j, { cheer: true }); m.mood("smile"); }); }); camLook(lerp(50, 44, k), 9, 40, 80, 3, 0); drift(t, .4); over(u, "الله أكبر", "", 1.2, "#fff"); return W; });
  // 34 — they climb the wall on ladders, and behind them the engineers lower the pumps into the water
  shot(34, function (u, d, t) { var k = u / d; W0("smoke");
    ladders.forEach(function (l, i) { l.visible = i < 4; l.position.set(90, 0, BREACH[30 + i].z + 28); });
    boats.forEach(function (b, i) { b.visible = i < 4; if (!b.visible) return; b.position.set(84, .3 + Math.sin(t * 2 + i) * .1, BREACH[30 + i].z + 22); b.rotation.y = 0; b.men.forEach(function (m, j) { m.visible = j > 1; m.pose("sit", t); live(m, t + j); }); });
    crew.forEach(function (c, i) { c.visible = i < 8; var li = i % 4, kk = clamp(k * 1.25 - Math.floor(i / 4) * .35); c.position.set(lerp(91.5, 111, kk), lerp(1.2, 23.5, kk), BREACH[30 + li].z + 28 + .9); c.rotation.y = Math.PI / 2; c.scale.setScalar(.55); c.pose(kk < 1 ? "climb" : "stand", t + i); live(c, t + i); });
    pumpsWork(t, 0, 4, 30); pumps.forEach(function (pb, i) { if (i < 4) pb.position.x = lerp(-60, 60, ease(clamp(k * 1.3 - i * .1))); });
    camLook(20, 22, BREACH[31].z + 120, 96, 12, BREACH[31].z + 30); return W; });
  // 35 — the hoses turn on the sand… and the mountain begins to melt
  shot(35, function (u, d, t) { var k = u / d; W0("smoke"); setBreach(.15 * k, 64); pumpsWork(t, .1 + .2 * k, 3, 31); camLook(36, 12, BREACH[32].z + 48, 84, 8, BREACH[32].z); return W; });
  // 36 — the sand turns to mud, the mud slides into the canal, the gap widens minute by minute
  shot(36, function (u, d, t) { var k = u / d; W0("smoke"); setBreach(.15 + .5 * k, 64); pumpsWork(t, .3 + .5 * k, 3, 31); camLook(lerp(40, 46, k), 14, BREACH[32].z - 46, 88, 7, BREACH[32].z); over(u, "رملة ← طين", "", .6, "#d8b070"); return W; });
  // 37 — in about four hours, more than sixty breaches were open in the wall
  shot(37, function (u, d, t) { var k = ease(u / d); W0("day"); setBreach(.6 + .4 * k, Math.round(lerp(6, 64, k))); camLook(lerp(-60, -140, k), lerp(140, 320, k), lerp(-300, -500, k), 100, 0, 300); flyGulls(t * 1.6, cam.position.x + 40, cam.position.y - 30, cam.position.z + 80); drift(t); over(u, "أكتر من 60 ثغرة", "في حوالي 4 ساعات", .4, "#f2c230"); return W; });
  // 38 — the mountain they said needed an atomic bomb… the canal's water opened it
  shot(38, function (u, d, t) { var k = ease(u / d); W0("day"); setBreach(1, 64); tanks.forEach(function (tt, i) { tt.visible = i < 2; tt.position.set(lerp(80, 160, clamp(k * 1.2 - i * .3)), 1.5, BREACH[32].z + (i ? 2 : -2)); }); camLook(lerp(60, 84, k), 8, BREACH[32].z + 4, 160, 8, BREACH[32].z); over(u, "مية القناة", "", 1.4, "#7ad0f0"); return W; });
  // 39 — at sunset many soldiers broke their fast on the other bank
  shot(39, function (u, d, t) { var k = ease(u / d); W0("sunset"); setBreach(1, 64); iftar.forEach(function (b, i) { b.visible = true; b.position.set(128 + (i % 3) * 3, 26, BREACH[30].z + 30 + Math.floor(i / 3) * 3); b.rotation.y = -Math.PI / 2 + (i % 2 ? .4 : -.4); b.scale.setScalar(.6); live(b, t + i); b.mood("smile"); b.armR.rotation.z = .5 + Math.max(0, Math.sin(t * 1.5 + i)) * 1.4; });
    camLook(lerp(150, 146, k), 31, BREACH[30].z + 40, 128, 27, BREACH[30].z + 31); drift(t, .2); over(u, "الإفطار", "على الضفة التانية", .6, "#f2c230"); return W; });
  // 40 — by night the bridges are laid across the canal and the tanks start to cross
  shot(40, function (u, d, t) { var k = u / d; W0("night"); setBreach(1, 64); bridge.visible = true; tanks.forEach(function (tt, i) { tt.visible = true; var kk = ((k * .6 + i / 6) % 1); tt.position.set(lerp(-110, 130, kk), 2.4 + (kk > .9 ? 2 : 0), 300); tt.rotation.y = 0; }); camLook(lerp(-60, -40, k), 30, 380, 40, 0, 300); drift(t, .4); return W; });
  // 41 — Baqi was there with his division, watching his idea happen before his eyes
  shot(41, function (u, d, t) { var k = ease(u / d); W0("night"); setBreach(1, 64); bridge.visible = true; tanks.forEach(function (tt, i) { tt.visible = true; var kk = ((t * .04 + i / 6) % 1); tt.position.set(lerp(-110, 130, kk), 2.4, 300); }); baqi.visible = true; baqi.position.set(-104, 3, 268); baqi.rotation.y = .5; baqi.mood("smile"); live(baqi, t);
    camLook(lerp(-113, -112, k), 7.6, lerp(257, 258, k), -104, 5.6, 268); over(u, "باقي زكي يوسف", "", .8, "#f2c230"); return W; });
  // 42 — an idea that came from an ordinary workday at the High Dam
  shot(42, function (u, d, t) { var k = ease(u / d); setTOD(DM, "sunset"); dyoung.visible = true; live(dyoung, t); dyoung.mood("smile"); monitors.forEach(function (m, i) { stream(djets, i * DROPS, DROPS, { x: -52, y: 4, z: m.position.z }, { x: -18, y: 7, z: m.position.z * .6 }, 7, t + i * .3, 1.3, 1.2); }); camLook(lerp(-82, -80, k), 6, lerp(20, 22, k), -74, 3.6, 12); return DM; });
  // 43 — two years after the war, the Suez Canal reopened to ships
  shot(43, function (u, d, t) { var k = u / d; W0("day"); setBreach(1, 64); ships.forEach(function (s, i) { s.visible = true; s.position.set(0, 0, lerp(-600, 400, (k * .5 + i * .33) % 1)); }); camLook(-220, 60, lerp(-80, 40, k), 0, 6, 0); drift(t); over(u, "1975", "القناة اتفتحت من تاني", .4, "#f2c230"); return W; });
  // 44 — General Baqi kept telling the story until he died in 2018
  shot(44, function (u, d, t) { var k = ease(u / d); W0("sunset"); baqi.visible = true; baqi.position.set(-100, 3, 100); baqi.rotation.y = -1.0; baqi.mood("smile"); live(baqi, t); ships[0].visible = true; ships[0].position.set(0, 0, -100 + u * 30); flyGulls(t * 1.5, -110, 14, 90); baqi.head.rotation.y = Math.sin(t * .8) * .3;
    camLook(-110 + u * 1.0, 6 + u * .1, 109 - u * .7, -100, 5, 100); over(u, "2018", "", 1.2, "#f2c230"); return W; });
  // gulls over the water for the ending
  var gulls = []; for (var gq = 0; gq < 14; gq++) { var gw = new T3.Group(); var gb2 = new T3.Mesh(new T3.SphereGeometry(.5, 8, 6), toon(0xf4f0e8)); gb2.scale.set(1.6, .7, .7); gw.add(gb2);
    [-1, 1].forEach(function (sd) { var wg2 = new T3.Mesh(new T3.BoxGeometry(.3, .08, 2.6), toon(0xe8e4dc)); wg2.position.z = sd * 1.3; gw.add(wg2); gw["w" + sd] = wg2; }); gw.visible = false; W.add(gw); gulls.push(gw); }
  function flyGulls(t, cx, cy, cz) { gulls.forEach(function (g, i) { g.visible = true; var a = t * .25 + i * .45; g.position.set(cx + Math.cos(a) * (30 + i * 3), cy + Math.sin(t * .8 + i) * 4 + i, cz + Math.sin(a) * (30 + i * 3)); g.rotation.y = -a; var f = Math.sin(t * 7 + i) * .5; g.w1.rotation.x = f; g["w-1"].rotation.x = -f; }); }
  // 45 — sometimes the solution is simple… it just needs someone to look at it differently
  shot(45, function (u, d, t) { W0("sunset"); setBreach(1, 64); gulls.forEach(function (g) { g.visible = false; }); flyGulls(t, -30, 40, 40); ships[0].visible = true; ships[0].position.set(0, 0, -120 + u * 16);
    var an2 = 2.0 + u * .06; camLook(Math.cos(an2) * (90 + u * 14), 40 + u * 14, -60 + Math.sin(an2) * (90 + u * 14), 40, 0, -60); return W; });
  // 46 — tell us: which story next time?
  shot(46, function (u, d, t) { W0("sunset"); setBreach(1, 64); flyGulls(t, -20, 60, -120); ships.forEach(function (s, i) { s.visible = i === 0; }); ships[0].position.set(0, 0, -260 + u * 18); var an = 2.3 + u * .07; camLook(Math.cos(an) * 240, 70 + u * 4, -100 + Math.sin(an) * 240, 0, 0, -100); over(u, "قولولنا!", "", .3); return W; });

  window.VIDEO_END = END;
  var cur = -1;
  window.renderAt = function (t) {
    var i = 0; while (i < LN.length - 1 && LN[i + 1].start - .25 <= t) i++;
    var u = t - (L(i) - .25), d = Math.max(.6, L(i + 1) - L(i));
    cam.fov = 42; OVB.style.opacity = 0; BINO.style.opacity = 0;
    foamAnim(t); driftClouds(t); clouds.visible = true;
    var sc = SH[i](u, d, t);
    breathe(t, u); if (sc === W) clampCam(); cam.updateProjectionMatrix();
    R.render(sc, cam);
    var fd = document.getElementById("fade"); fd.style.opacity = (u < .3 && i > 0) ? (1 - u / .3) * .85 : 0;
    window.__cap && window.__cap(t);
  };
  window.__parts = { W: W, setBreach: setBreach, pumpsWork: pumpsWork, boatsCross: boatsCross, cam: cam, R: R, setTOD: setTOD, fighters: fighters };
})();
