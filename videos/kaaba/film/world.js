/* «الكعبة من جوة» — detailed 3D interior (three.js r149), a pure function of time. Units = metres.
   Modelled on photos of the interior: white marble dado with framed green inscription plaques, dark green marble skirting
   with a white pattern, green silk curtain (floral arabesque) on the upper walls and ceiling with gold calligraphy friezes,
   white marble floor with dark green inlaid borders, three dark wooden pillars with engraved gold bands, gold rods carrying
   a dense row of gold, silver and copper lamps and incense burners, the gold door, Bab al-Tawba in the corner. */
(function () {
  var T = THREE, FONT = "700 {s}px AmiriK, serif";
  var W = 12, D = 10, H = 9, LOW = 3.0, SK = .34, ROD = 5.6;
  var canvas = document.getElementById("gl");
  var R = new T.WebGLRenderer({ canvas: canvas, antialias: true, preserveDrawingBuffer: true });
  R.setPixelRatio(Math.min(window.devicePixelRatio || 1, window.GL_RATIO || 9)); R.setSize(360, 640, false);
  R.outputEncoding = T.sRGBEncoding; R.shadowMap.enabled = true; R.shadowMap.type = T.PCFSoftShadowMap;
  R.toneMapping = T.ACESFilmicToneMapping; R.toneMappingExposure = .82;
  R.physicallyCorrectLights = false;
  var scene = new T.Scene(); scene.background = new T.Color(0x14261c);
  var cam = new T.PerspectiveCamera(50, 360 / 640, .05, 100);
  var lamps = [], flames = [];

  // ── helpers ──────────────────────────────────────────────
  function rnd(s) { return function () { s = (s * 16807) % 2147483647; return s / 2147483647; }; }
  function tex(w, h, f, rx, ry) { var c = document.createElement("canvas"); c.width = w; c.height = h; f(c.getContext("2d"), w, h);
    var t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding; t.anisotropy = 8; t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(rx || 1, ry || 1); return t; }
  function font(s) { return FONT.replace("{s}", s); }
  function M(o) { return new T.MeshStandardMaterial(o); }
  function P(o) { return new T.MeshPhysicalMaterial(o); }
  function add(m, x, y, z, parent) { m.position.set(x, y, z); (parent || scene).add(m); return m; }
  function lathe(pts, seg) { return new T.LatheGeometry(pts.map(function (p) { return new T.Vector2(p[0], p[1]); }), seg || 48); }
  function veins(x, w, h, seed, col, n) { var r = rnd(seed); x.strokeStyle = col;
    for (var i = 0; i < n; i++) { x.globalAlpha = .05 + r() * .2; x.lineWidth = .5 + r() * 2.2; x.beginPath(); var px = r() * w, py = r() * h; x.moveTo(px, py);
      for (var k = 0; k < 10; k++) { px += (r() - .35) * w * .12; py += (r() - .5) * h * .1; x.quadraticCurveTo(px + (r() - .5) * 30, py + (r() - .5) * 30, px, py); } x.stroke(); } x.globalAlpha = 1; }
  function flower(x, cx, cy, r, petal, heart) { x.fillStyle = petal; for (var i = 0; i < 5; i++) { var a = i * Math.PI * 2 / 5; x.beginPath(); x.ellipse(cx + Math.cos(a) * r * .55, cy + Math.sin(a) * r * .55, r * .5, r * .28, a, 0, Math.PI * 2); x.fill(); }
    x.fillStyle = heart; x.beginPath(); x.arc(cx, cy, r * .22, 0, Math.PI * 2); x.fill(); }
  function leaf(x, cx, cy, r, a, col) { x.save(); x.translate(cx, cy); x.rotate(a); x.fillStyle = col; x.beginPath(); x.moveTo(0, 0); x.quadraticCurveTo(r * .5, -r * .35, r, 0); x.quadraticCurveTo(r * .5, r * .35, 0, 0); x.fill(); x.restore(); }
  function arabesque(x, w, h, bg, vine, pet, heart, gold, seed) {   // a seamless floral repeat
    x.fillStyle = bg; x.fillRect(0, 0, w, h); var r = rnd(seed), n = 4, s = w / n;
    for (var dy = 0; dy < h; dy += s / 2) for (var dx = 0; dx < w; dx += s / 2) flower(x, dx + s / 4, dy, s * .035, gold, bg);
    for (var j = 0; j < n; j++) for (var i = 0; i < n; i++) {
      var cx = i * s + (j % 2 ? s / 2 : 0), cy = j * s + s / 2;
      x.strokeStyle = vine; x.lineWidth = s * .025; x.beginPath();
      x.moveTo(cx - s / 2, cy); x.bezierCurveTo(cx - s * .25, cy - s * .45, cx + s * .25, cy + s * .45, cx + s / 2, cy); x.stroke();
      x.beginPath(); x.arc(cx, cy, s * .3, 0, Math.PI * 2); x.stroke();
      for (var k = 0; k < 6; k++) leaf(x, cx + Math.cos(k) * s * .3, cy + Math.sin(k) * s * .3, s * .12, k + .8, vine);
      flower(x, cx, cy, s * .16, pet, heart);
      for (var q = 0; q < 4; q++) { var a = q * Math.PI / 2 + .78; flower(x, cx + Math.cos(a) * s * .42, cy + Math.sin(a) * s * .42, s * .06, gold, bg); }
    }
    x.globalAlpha = .07; x.fillStyle = "#000"; for (var y = 0; y < h; y += 3) x.fillRect(0, y, w, 1); x.globalAlpha = 1;   // silk weave
  }
  function textRow(x, w, h, txt, col, size, sep) {   // a row of calligraphy with medallions between
    x.font = font(size); x.fillStyle = col; x.textAlign = "center"; x.textBaseline = "middle"; x.direction = "rtl";
    var tw = x.measureText(txt).width + size * 2.2, n = Math.max(1, Math.floor(w / tw)), step = w / n;
    for (var i = 0; i < n; i++) { x.fillText(txt, step * (i + .5), h / 2 + size * .08);
      if (sep) { x.save(); x.translate(step * i, h / 2); x.rotate(Math.PI / 4); x.strokeStyle = col; x.lineWidth = 2; x.strokeRect(-size * .22, -size * .22, size * .44, size * .44); x.restore(); } }
  }

  // ── textures ──────────────────────────────────────────────
  var T_SILK = tex(1024, 1024, function (x, w, h) { arabesque(x, w, h, "#0d4a31", "#2c7c55", "#e9efe2", "#c99f45", "#d6b25a", 5); }, 11, 6);
  var T_SILK_C = tex(1024, 1024, function (x, w, h) { arabesque(x, w, h, "#0b4029", "#2a7450", "#e2ead9", "#c99f45", "#d6b25a", 9); }, 9, 7);
  var T_FRIEZE = tex(2048, 160, function (x, w, h) { x.fillStyle = "#0a3a26"; x.fillRect(0, 0, w, h);
    x.fillStyle = "#c9a34e"; x.fillRect(0, 8, w, 5); x.fillRect(0, h - 13, w, 5); x.fillRect(0, 18, w, 2); x.fillRect(0, h - 20, w, 2);
    textRow(x, w, h, "لا إله إلا الله محمد رسول الله", "#e2c06a", 74, true); }, 2, 1);
  var T_FRIEZE2 = tex(2048, 96, function (x, w, h) { x.fillStyle = "#0a3a26"; x.fillRect(0, 0, w, h);
    x.fillStyle = "#c9a34e"; x.fillRect(0, 5, w, 3); x.fillRect(0, h - 8, w, 3);
    textRow(x, w, h, "سبحان الله والحمد لله ولا إله إلا الله والله أكبر", "#e8d9a8", 44, true); }, 2, 1);
  var T_MARBLE = tex(1024, 1024, function (x, w, h) { x.fillStyle = "#f3f0ea"; x.fillRect(0, 0, w, h); veins(x, w, h, 11, "#6f6a60", 70);
    x.strokeStyle = "rgba(140,130,115,.45)"; x.lineWidth = 2; x.strokeRect(1, 1, w - 2, h - 2); x.beginPath(); x.moveTo(w / 2, 0); x.lineTo(w / 2, h); x.stroke(); }, 5, 1);
  var T_FLOOR = tex(1024, 1024, function (x, w, h) { x.fillStyle = "#f1eee7"; x.fillRect(0, 0, w, h); veins(x, w, h, 21, "#8f8a80", 50);
    x.strokeStyle = "rgba(120,112,100,.5)"; x.lineWidth = 2.5; for (var i = 0; i <= 2; i++) { x.beginPath(); x.moveTo(i * w / 2, 0); x.lineTo(i * w / 2, h); x.stroke(); x.beginPath(); x.moveTo(0, i * h / 2); x.lineTo(w, i * h / 2); x.stroke(); } }, 5, 4);
  var T_GREENM = tex(512, 512, function (x, w, h) { x.fillStyle = "#123b2b"; x.fillRect(0, 0, w, h); veins(x, w, h, 31, "#5f9a7e", 30); veins(x, w, h, 32, "#061c13", 20); }, 4, 1);
  var T_SKIRT = tex(1024, 128, function (x, w, h) { x.fillStyle = "#103827"; x.fillRect(0, 0, w, h); veins(x, w, h, 41, "#4f8a6e", 14);
    x.fillStyle = "#eae4d6"; x.fillRect(0, 10, w, 4); x.fillRect(0, h - 14, w, 4);
    for (var i = 0; i < w; i += 64) { x.save(); x.translate(i + 32, h / 2); x.rotate(Math.PI / 4); x.strokeStyle = "#eae4d6"; x.lineWidth = 5; x.strokeRect(-17, -17, 34, 34); x.restore();
      x.fillStyle = "#eae4d6"; x.beginPath(); x.arc(i + 32, h / 2, 6, 0, Math.PI * 2); x.fill(); } }, 6, 1);
  var T_DIAM = tex(1024, 256, function (x, w, h) { x.fillStyle = "#f2efe8"; x.fillRect(0, 0, w, h); veins(x, w, h, 71, "#8a8478", 16);
    x.strokeStyle = "rgba(140,130,115,.45)"; x.lineWidth = 2; for (var j = 0; j <= w; j += w / 4) { x.beginPath(); x.moveTo(j, 0); x.lineTo(j, h); x.stroke(); }
    x.fillStyle = "#1c1b19"; for (var i = 0; i < 8; i++) { var cx = i * w / 8 + w / 16, cy = h / 2;
      [[0, -26], [0, 26], [-26, 0], [26, 0]].forEach(function (d) { x.save(); x.translate(cx + d[0], cy + d[1]); x.rotate(Math.PI / 4); x.fillRect(-11, -11, 22, 22); x.restore(); });
      x.save(); x.translate(cx, cy); x.rotate(Math.PI / 4); x.fillRect(-6, -6, 12, 12); x.restore(); } }, 3, 1);
  var T_WOOD = tex(512, 1024, function (x, w, h) { var r = rnd(3); var g = x.createLinearGradient(0, 0, w, 0); g.addColorStop(0, "#4a2312"); g.addColorStop(.5, "#6a3519"); g.addColorStop(1, "#4a2312");
    x.fillStyle = g; x.fillRect(0, 0, w, h);
    for (var i = 0; i < 160; i++) { x.strokeStyle = r() < .55 ? "rgba(30,12,4,.35)" : "rgba(160,95,55,.22)"; x.lineWidth = .8 + r() * 3; var px = r() * w; x.beginPath(); x.moveTo(px, 0);
      x.bezierCurveTo(px + (r() - .5) * 14, h * .33, px + (r() - .5) * 14, h * .66, px + (r() - .5) * 8, h); x.stroke(); } }, 2, 3);
  function goldEngrave(seed) { return tex(1024, 256, function (x, w, h) { var g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#a77a22"); g.addColorStop(.5, "#e8c56a"); g.addColorStop(1, "#a77a22");
      x.fillStyle = g; x.fillRect(0, 0, w, h); x.strokeStyle = "#6f4c10"; x.lineWidth = 5; x.strokeRect(0, 8, w, h - 16); x.lineWidth = 2; x.strokeRect(0, 22, w, h - 44);
      for (var i = 0; i < 8; i++) { var cx = i * w / 8 + w / 16; x.save(); x.translate(cx, h / 2); x.rotate(Math.PI / 4); x.lineWidth = 4; x.strokeRect(-h * .22, -h * .22, h * .44, h * .44); x.restore();
        x.beginPath(); x.arc(cx, h / 2, h * .12, 0, Math.PI * 2); x.stroke(); flower(x, cx, h / 2, h * .1, "#7a5414", "#f0d27a");
        x.beginPath(); x.moveTo(cx + w / 16 - 40, h / 2); x.bezierCurveTo(cx + w / 16 - 20, h * .2, cx + w / 16 + 20, h * .8, cx + w / 16 + 40, h / 2); x.stroke(); } }, 1, 1); }
  var T_GOLDBAND = goldEngrave(1);
  var T_DOOR = tex(384, 1464, function (x, w, h) { var g = x.createLinearGradient(0, 0, w, h); g.addColorStop(0, "#c08f2c"); g.addColorStop(.5, "#f2cd6e"); g.addColorStop(1, "#b07f22");
    x.fillStyle = g; x.fillRect(0, 0, w, h); x.strokeStyle = "#6f4c10"; x.lineWidth = 8; x.strokeRect(10, 10, w - 20, h - 20);
    for (var r = 0; r < 4; r++) { var y0 = 34 + r * 352; x.lineWidth = 5; x.strokeRect(30, y0, w - 60, 330);
      x.fillStyle = "#7a5414"; for (var k = 0; k < 8; k++) { x.beginPath(); x.arc(42 + k * (w - 84) / 7, y0 + 12, 5, 0, 7); x.fill(); x.beginPath(); x.arc(42 + k * (w - 84) / 7, y0 + 318, 5, 0, 7); x.fill(); }
      var cy = y0 + 165;
      if (r === 1 || r === 2) { x.beginPath(); x.arc(w / 2, cy, 132, 0, 7); x.lineWidth = 7; x.stroke(); x.beginPath(); x.arc(w / 2, cy, 116, 0, 7); x.lineWidth = 2; x.stroke();
        for (var q = 0; q < 16; q++) { var a = q * Math.PI / 8; flower(x, w / 2 + Math.cos(a) * 124, cy + Math.sin(a) * 124, 8, "#7a5414", "#f0d27a"); }
        x.fillStyle = "#5f400c"; x.textAlign = "center"; x.textBaseline = "middle";
        if (r === 1) { x.font = font(52); x.fillText("لا إله", w / 2, cy - 34); x.fillText("إلا الله", w / 2, cy + 38); }
        else { x.font = font(52); x.fillText("محمد", w / 2, cy - 34); x.fillText("رسول الله", w / 2, cy + 38); } }
      else { x.save(); x.translate(w / 2, cy); x.rotate(Math.PI / 4); x.lineWidth = 6; x.strokeRect(-90, -90, 180, 180); x.lineWidth = 2; x.strokeRect(-72, -72, 144, 144); x.restore();
        flower(x, w / 2, cy, 50, "#7a5414", "#f0d27a"); for (var q2 = 0; q2 < 4; q2++) flower(x, w / 2 + [-1, 1, 0, 0][q2] * 120, cy + [0, 0, -120, 120][q2], 16, "#7a5414", "#f0d27a"); } } });
  var T_TAWBA = tex(384, 1024, function (x, w, h) { var g = x.createLinearGradient(0, 0, w, h); g.addColorStop(0, "#b68a30"); g.addColorStop(.5, "#e6c26a"); g.addColorStop(1, "#9c7322");
    x.fillStyle = g; x.fillRect(0, 0, w, h); x.fillStyle = "#6f4c10";
    for (var y = 20; y < h; y += 34) { x.beginPath(); x.arc(20, y, 7, 0, 7); x.fill(); x.beginPath(); x.arc(w - 20, y, 7, 0, 7); x.fill(); }
    x.strokeStyle = "#6f4c10"; x.lineWidth = 5; x.strokeRect(40, 40, w - 80, 120); x.font = font(40); x.textAlign = "center"; x.textBaseline = "middle"; x.fillText("باب التوبة", w / 2, 102);
    for (var r = 0; r < 3; r++) { var cy = 270 + r * 255; x.strokeRect(48, cy - 105, w - 96, 210); x.save(); x.translate(w / 2, cy); x.rotate(Math.PI / 4); x.lineWidth = 6; x.strokeRect(-62, -62, 124, 124); x.lineWidth = 2; x.strokeRect(-46, -46, 92, 92); x.restore();
      flower(x, w / 2, cy, 34, "#6f4c10", "#f2d684"); } });
  function plaqueTex(lines, tint) { return tex(512, 720, function (x, w, h) { x.fillStyle = tint; x.fillRect(0, 0, w, h); veins(x, w, h, 51, "#6f7a70", 20);
      x.strokeStyle = "rgba(60,70,60,.6)"; x.lineWidth = 6; x.strokeRect(8, 8, w - 16, h - 16);
      x.fillStyle = "#1f3a2c"; x.textAlign = "center"; x.textBaseline = "middle";
      x.font = font(30); x.fillText(lines[0], w / 2, 60); x.font = font(64); x.fillText(lines[1], w / 2, 140);
      x.font = font(30); for (var i = 2; i < lines.length; i++) x.fillText(lines[i], w / 2, 230 + (i - 2) * 58); }); }
  var T_SPOT = tex(256, 256, function (x, w, h) { x.fillStyle = "#c2ab86"; x.fillRect(0, 0, w, h); veins(x, w, h, 61, "#6d5a3e", 24); x.strokeStyle = "#b08a3a"; x.lineWidth = 8; x.strokeRect(4, 4, w - 8, h - 8); });

  // ── environment (for metals) ─────────────────────────────
  (function () { var es = new T.Scene(), bx = new T.Mesh(new T.BoxGeometry(20, 12, 20), new T.MeshBasicMaterial({ color: 0x3a2c1c, side: T.BackSide })); es.add(bx);
    [[0, 5.5, 0, 8, 8, 0xfff2d8, 3], [-9.5, 2, 0, 6, 3, 0xfff6e8, 1.6], [0, 0, 9.5, 6, 3, 0xffe8c8, 1.2], [0, -5.8, 0, 14, 14, 0xe8e2d4, .8]].forEach(function (p) {
      var m = new T.Mesh(new T.PlaneGeometry(p[3], p[4]), new T.MeshBasicMaterial({ color: new T.Color(p[5]).multiplyScalar(p[6]), side: T.DoubleSide })); m.position.set(p[0], p[1], p[2]); m.lookAt(0, 0, 0); es.add(m); });
    var pm = new T.PMREMGenerator(R); scene.environment = pm.fromScene(es, .04).texture; })();

  // ── materials ────────────────────────────────────────────
  var mGold = M({ color: 0xf0b847, metalness: 1, roughness: .28 });
  var mGoldDk = M({ color: 0xc8902e, metalness: 1, roughness: .35 });
  var mSilver = M({ color: 0xdfe2e4, metalness: 1, roughness: .2 });
  var mCopper = M({ color: 0xc8804f, metalness: 1, roughness: .3 });
  var mBand = M({ map: T_GOLDBAND, bumpMap: T_GOLDBAND, bumpScale: .012, metalness: 1, roughness: .3, color: 0xffffff });
  var mWood = P({ map: T_WOOD, roughness: .5, clearcoat: .3, clearcoatRoughness: .4 });
  var mGreenM = P({ map: T_GREENM, roughness: .2, clearcoat: .5 });
  var mGlass = M({ color: 0xffc46a, emissive: 0xffa53a, emissiveIntensity: 1.3, roughness: .2, transparent: true, opacity: .9 });

  // ── the room ─────────────────────────────────────────────
  var room = new T.Group(); scene.add(room);
  function plane(w, h, m, x, y, z, ry, rx) { var p = new T.Mesh(new T.PlaneGeometry(w, h), m); p.position.set(x, y, z); p.rotation.set(rx || 0, ry || 0, 0); p.receiveShadow = true; room.add(p); return p; }
  function bar(len, h, d, m, x, y, z, ry) { var b = new T.Mesh(new T.BoxGeometry(len, h, d), m); b.position.set(x, y, z); b.rotation.y = ry || 0; b.receiveShadow = true; room.add(b); return b; }
  // floor + inlaid green borders
  plane(W, D, P({ map: T_FLOOR, roughness: .18, clearcoat: .6, clearcoatRoughness: .1 }), 0, 0, 0, 0, -Math.PI / 2);
  function inlay(x0, z0, x1, z1, wdt) { [[x0, z0, x1, z0], [x0, z1, x1, z1], [x0, z0, x0, z1], [x1, z0, x1, z1]].forEach(function (s) {
      var lx = Math.abs(s[2] - s[0]) || wdt, lz = Math.abs(s[3] - s[1]) || wdt, b = new T.Mesh(new T.BoxGeometry(lx + (lz === wdt ? wdt : 0), .006, lz), mGreenM);
      b.position.set((s[0] + s[2]) / 2, .003, (s[1] + s[3]) / 2); b.receiveShadow = true; room.add(b); }); }
  inlay(-W / 2 + .35, -D / 2 + .35, W / 2 - .35, D / 2 - .35, .42); inlay(-W / 2 + 1.0, -D / 2 + 1.0, W / 2 - 1.0, D / 2 - 1.0, .08);
  var diamM = P({ map: T_DIAM, roughness: .25, clearcoat: .3 }), dadoM = P({ map: T_MARBLE, roughness: .25, clearcoat: .3 });
  var silkM = M({ map: T_SILK, roughness: .55 }), friezeM = M({ map: T_FRIEZE, roughness: .4, metalness: .2 }), frieze2M = M({ map: T_FRIEZE2, roughness: .4, metalness: .2 });
  var walls = [[W, 0, -D / 2, 0], [W, 0, D / 2, Math.PI], [D, -W / 2, 0, Math.PI / 2], [D, W / 2, 0, -Math.PI / 2]];
  walls.forEach(function (s, i) {
    var len = s[0], nx = Math.sin(s[3]), nz = Math.cos(s[3]), o = function (d) { return [s[1] + nx * d, s[2] + nz * d]; };
    var a = o(.0), b = o(.05);
    bar(len, SK, .12, mGreenM, b[0], SK / 2, b[1], s[3]); bar(len, .14, .16, mGreenM, b[0], .07, b[1], s[3]);   // stepped dark green skirting
    plane(len, LOW - SK, dadoM, a[0], SK + (LOW - SK) / 2, a[1], s[3]);
    bar(len, .24, .14, mGreenM, b[0], LOW + .12, b[1], s[3]); bar(len, .05, .18, mGreenM, b[0], LOW + .02, b[1], s[3]);
    plane(len, .9, diamM, a[0], LOW + .24 + .45, a[1], s[3]);
    var c2 = LOW + 1.14; bar(len, .26, .16, mGreenM, b[0], c2 + .13, b[1], s[3]); bar(len, .04, .19, mGold, b[0], c2 + .27, b[1], s[3]);
    var top = H - .75, s0 = c2 + .29; plane(len, top - s0, silkM, a[0], s0 + (top - s0) / 2, a[1], s[3]);
    bar(len, .06, .1, mGold, b[0], top, b[1], s[3]);
    plane(len, .75, friezeM, a[0] + nx * .001, top + .375, a[1] + nz * .001, s[3]);
    // marble inscription plaques (as in the photos: pale marble, dark lettering)
    var texts = [["بسم الله الرحمن الرحيم", "الحمد لله رب العالمين", "إن أول بيت وضع للناس", "للذي ببكة مباركا", "وهدى للعالمين", "فيه آيات بينات"],
                 ["بسم الله الرحمن الرحيم", "والصلاة والسلام", "على سيدنا محمد", "وعلى آله وصحبه أجمعين", "وإذ يرفع إبراهيم القواعد", "من البيت وإسماعيل"]];
    var n = len > 11 ? 3 : 2;
    for (var k = 0; k < n; k++) { var along = (k - (n - 1) / 2) * (len / n); if (i === 1 && k === 0) continue; if (i === 3 && k === 0) continue;
      var pq = new T.Mesh(new T.BoxGeometry(.78, 1.1, .03), M({ color: 0xbfc8bd, roughness: .3 }));
      pq.material = [pq.material, pq.material, pq.material, pq.material, M({ map: plaqueTex(texts[(i + k) % 2], (i + k) % 2 ? "#e9ece6" : "#c9d6cb"), roughness: .25 }), pq.material];
      var px = s[1] + Math.cos(s[3]) * along + nx * .02, pz = s[2] - Math.sin(s[3]) * along + nz * .02;
      pq.position.set(px, 1.95, pz); pq.rotation.y = s[3]; room.add(pq); }
  });
  // ceiling: silk with a gold frame and beams
  plane(W, D, M({ map: T_SILK_C, roughness: .6 }), 0, H, 0, 0, Math.PI / 2);
  [[-3.6], [0], [3.6]].forEach(function (p) { var bm = new T.Mesh(new T.BoxGeometry(.32, .3, D), mWood); bm.position.set(p[0], H - .15, 0); room.add(bm);
    [-.17, .17].forEach(function (dx) { var g = new T.Mesh(new T.BoxGeometry(.02, .04, D), mGold); g.position.set(p[0] + dx, H - .28, 0); room.add(g); }); });

  // ── three wooden pillars ─────────────────────────────────
  var PX = [-3.6, 0, 3.6], RC = .27;
  PX.forEach(function (px) {
    var g = new T.Group(); g.position.set(px, 0, 0); room.add(g);
    var plinth = new T.Mesh(new T.BoxGeometry(1.0, .42, 1.0), mGreenM); plinth.position.y = .21; plinth.castShadow = plinth.receiveShadow = true; g.add(plinth);
    var pt = new T.Mesh(new T.BoxGeometry(1.06, .05, 1.06), mGold); pt.position.y = .445; g.add(pt);
    var pb = new T.Mesh(new T.BoxGeometry(1.06, .04, 1.06), mGold); pb.position.y = .02; g.add(pb);
    var base = new T.Mesh(lathe([[0, 0], [.42, 0], [.42, .06], [.36, .1], [.34, .2], [.3, .26], [.29, .34], [RC + .01, .38], [0, .38]]), mGold); base.position.y = .47; base.castShadow = true; g.add(base);
    var col = new T.Mesh(new T.CylinderGeometry(RC, RC + .02, H - 1.25, 64), mWood); col.position.y = .85 + (H - 1.25) / 2; col.castShadow = true; g.add(col);
    [[1.45, .42], [4.55, .36], [7.4, .3]].forEach(function (b) {
      var band = new T.Mesh(new T.CylinderGeometry(RC + .025, RC + .025, b[1], 64, 1, true), mBand); band.position.y = b[0]; g.add(band);
      [-1, 1].forEach(function (sg) { var r = new T.Mesh(new T.TorusGeometry(RC + .03, .028, 12, 64), mGold); r.rotation.x = Math.PI / 2; r.position.y = b[0] + sg * b[1] / 2; g.add(r); });
      [-1, 1].forEach(function (sg) { var r = new T.Mesh(new T.TorusGeometry(RC + .015, .012, 8, 64), mGold); r.rotation.x = Math.PI / 2; r.position.y = b[0] + sg * (b[1] / 2 + .09); g.add(r); });
    });
    var cap = new T.Mesh(lathe([[RC, 0], [RC + .03, .06], [RC + .02, .12], [.36, .26], [.44, .38], [.46, .44], [0, .44]]), mGold); cap.position.y = H - .4 - .44 + .02; g.add(cap);
    var ab = new T.Mesh(new T.BoxGeometry(.8, .12, .8), mWood); ab.position.y = H - .36; g.add(ab);
  });

  // ── gold rods with a dense row of lamps and incense burners ──
  var RODS = [[-W / 2, -3.6], [-3.6, 0], [0, 3.6], [3.6, W / 2]];
  RODS.forEach(function (s) { var len = s[1] - s[0] - .3, rod = new T.Mesh(new T.CylinderGeometry(.035, .035, len, 12), mGold);
    rod.rotation.z = Math.PI / 2; rod.position.set((s[0] + s[1]) / 2, ROD, 0); rod.castShadow = true; room.add(rod);
    var n = Math.floor(len / .4);
    for (var i = 0; i < n; i++) { var x = s[0] + .15 + (i + .5) * len / n, seed = Math.abs(Math.round(x * 7)) + i;
      lamps.push(lamp(x, .35 + ((seed * 37) % 7) * .1, seed % 6, seed)); } });
  function chainMesh(len) { var g = new T.Group(), n = Math.round(len / .05);
    for (var i = 0; i < n; i++) { var l = new T.Mesh(new T.TorusGeometry(.012, .004, 4, 8), mGold); l.position.y = -i * .05 - .025; l.rotation.y = i % 2 ? Math.PI / 2 : 0; g.add(l); } return g; }
  function lamp(x, drop, kind, seed) {
    var g = new T.Group(); g.position.set(x, ROD, 0); room.add(g);
    var hook = new T.Mesh(new T.TorusGeometry(.04, .008, 6, 16), mGold); hook.position.y = -.03; g.add(hook);
    g.add(chainMesh(drop)); var y = -drop - .05, mat = [mGold, mSilver, mCopper][seed % 3], trim = seed % 3 === 1 ? mGold : mSilver;
    function L(pts, m, yy) { var b = new T.Mesh(lathe(pts), m); b.position.y = yy; b.castShadow = true; g.add(b); return b; }
    if (kind === 0) {           // lantern: domed top, glowing glass, pointed foot
      L([[0, .3], [.06, .29], [.12, .24], [.14, .2], [0, .2]], mat, y - .3);
      var gl = new T.Mesh(new T.CylinderGeometry(.11, .11, .2, 8), mGlass); gl.position.y = y - .4; g.add(gl); flames.push(gl);
      var fr = new T.Mesh(new T.CylinderGeometry(.118, .118, .2, 8, 1, true), M({ color: 0xc9a043, metalness: 1, roughness: .3, wireframe: true })); fr.position.y = y - .4; g.add(fr);
      L([[0, 0], [.02, .02], [.13, .08], [.14, .1], [0, .1]], mat, y - .6);
    } else if (kind === 1) {    // ewer / vase
      L([[0, 0], [.07, 0], [.09, .03], [.16, .14], [.17, .24], [.12, .34], [.05, .4], [.045, .5], [.07, .53], [0, .53]], mat, y - .53);
      var h = new T.Mesh(new T.TorusGeometry(.08, .012, 8, 20, Math.PI), trim); h.rotation.z = -Math.PI / 2; h.position.set(.13, y - .2, 0); g.add(h);
    } else if (kind === 2) {    // incense burner (mibkhara)
      L([[0, 0], [.08, 0], [.06, .05], [.06, .1], [.16, .14], [.18, .2], [0, .2]], mat, y - .44);
      L([[.18, 0], [.15, .08], [.09, .16], [.04, .22], [.02, .26], [0, .27]], trim, y - .24);
      for (var k = 0; k < 6; k++) { var hole = new T.Mesh(new T.CircleGeometry(.012, 8), M({ color: 0x2a1a08 })); var a = k * Math.PI / 3; hole.position.set(Math.cos(a) * .125, y - .19, Math.sin(a) * .125); hole.lookAt(Math.cos(a), y - .19, Math.sin(a)); g.add(hole); }
    } else if (kind === 3) {    // ball lamp with band
      L([[0, 0], [.08, .02], [.15, .1], [.17, .2], [.15, .3], [.08, .38], [0, .4]], mat, y - .4);
      var bd = new T.Mesh(new T.TorusGeometry(.17, .012, 8, 32), trim); bd.rotation.x = Math.PI / 2; bd.position.y = y - .2; g.add(bd);
    } else if (kind === 4) {    // mosque lamp: flared glass, gold rim
      L([[0, 0], [.05, 0], [.06, .04], [.15, .12], [.16, .2], [.1, .26], [.15, .38], [0, .38]], M({ color: 0xf3e2b0, emissive: 0xffb14a, emissiveIntensity: .7, roughness: .15, transparent: true, opacity: .85 }), y - .38);
      var rim = new T.Mesh(new T.TorusGeometry(.15, .01, 6, 32), mGold); rim.rotation.x = Math.PI / 2; rim.position.y = y; g.add(rim);
    } else {                    // tall pot
      L([[0, 0], [.06, 0], [.1, .06], [.13, .2], [.12, .34], [.08, .42], [.09, .46], [0, .46]], mat, y - .46);
      var bd2 = new T.Mesh(new T.TorusGeometry(.13, .01, 8, 32), trim); bd2.rotation.x = Math.PI / 2; bd2.position.y = y - .26; g.add(bd2);
    }
    var fin = new T.Mesh(new T.SphereGeometry(.025, 10, 8), mGold); fin.position.y = y - .66; if (kind === 0) g.add(fin);
    return g;
  }

  // ── the door (inside face) and Bab al-Tawba ──────────────
  var door = new T.Group(); door.position.set(-3.0, 0, D / 2 - .02); door.rotation.y = Math.PI; room.add(door);
  var frame = new T.Mesh(new T.BoxGeometry(2.0, 2.95, .1), mWood); frame.position.y = 1.475; door.add(frame);
  var leafM = M({ map: T_DOOR, bumpMap: T_DOOR, bumpScale: .01, metalness: 1, roughness: .28 });
  [-.43, .43].forEach(function (dx) { var lf = new T.Mesh(new T.BoxGeometry(.84, 2.8, .06), [mGold, mGold, mGold, mGold, leafM, mGold]); lf.position.set(dx, 1.48, .06); door.add(lf); });
  var lock = new T.Mesh(new T.BoxGeometry(.12, .3, .06), mGoldDk); lock.position.set(0, 1.5, .11); door.add(lock);
  var tawba = new T.Group(); tawba.position.set(W / 2 - .02, 0, D / 2 - .9); tawba.rotation.y = -Math.PI / 2; room.add(tawba);
  var TW = .95, TH2 = 2.55, TY = SK;   // leaf stands on the skirting step
  var mG2 = M({ color: 0xf2c25a, metalness: 1, roughness: .18 });
  function tb(w, h, d, x, y, z, m) { var b = new T.Mesh(new T.BoxGeometry(w, h, d), m || mG2); b.position.set(x, TY + y, z); b.castShadow = true; tawba.add(b); return b; }
  tb(TW + .1, TH2 + .08, .05, 0, TH2 / 2, .02, mGoldDk);                 // frame
  var tframe = tawba, tleafPivot = new T.Group(); tleafPivot.position.set(-TW / 2, 0, 0); tframe.add(tleafPivot); tawba = new T.Group(); tawba.position.set(TW / 2, 0, 0); tleafPivot.add(tawba);
  tb(TW, TH2, .05, 0, TH2 / 2, .05);                                     // leaf
  tb(TW - .1, .05, .04, 0, TH2 - .06, .09); tb(TW - .1, .05, .04, 0, .06, .09);
  [.05, -.05].forEach(function (dz) {});
  [-TW / 2 + .06, TW / 2 - .06].forEach(function (x) { tb(.05, TH2 - .1, .04, x, TH2 / 2, .09); });
  // top: three raised horizontal bars with a small boss at each end
  [TH2 - .2, TH2 - .36, TH2 - .52].forEach(function (y) { var c = new T.Mesh(new T.CylinderGeometry(.045, .045, TW - .3, 24), mG2); c.rotation.z = Math.PI / 2; c.position.set(0, TY + y, .1); tawba.add(c); });
  [-TW / 2 + .16, TW / 2 - .16].forEach(function (x) { var h = new T.Mesh(new T.SphereGeometry(.07, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), mG2); h.rotation.x = Math.PI / 2; h.position.set(x, TY + TH2 - .2, .08); tawba.add(h); });
  tb(TW - .14, .03, .03, 0, TH2 - .66, .09);
  // middle boss and the big lower boss, each in a raised frame
  function boss(y, r) { var f = new T.Mesh(new T.TorusGeometry(r + .04, .018, 10, 48), mGoldDk); f.position.set(0, TY + y, .09); tawba.add(f);
    var h = new T.Mesh(new T.SphereGeometry(r, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2), mG2); h.rotation.x = Math.PI / 2; h.scale.set(1, .45, 1); h.position.set(0, TY + y, .075); h.castShadow = true; tawba.add(h); }
  tb(TW - .14, .5, .02, 0, TH2 - 1.0, .085, mGoldDk); boss(TH2 - 1.0, .16);
  tb(.42, .06, .06, -.08, TH2 - 1.36, .11, mGoldDk); tb(.06, .14, .07, .16, TH2 - 1.36, .12, mGoldDk);   // the latch
  tb(TW - .14, .7, .02, 0, .78, .085, mGoldDk); boss(.78, .25);
  [.25, .34].forEach(function (y) { var c = new T.Mesh(new T.CylinderGeometry(.03, .03, TW - .3, 20), mG2); c.rotation.z = Math.PI / 2; c.position.set(0, TY + y, .1); tawba.add(c); });
  // the marked prayer spot
  var spot = new T.Mesh(new T.BoxGeometry(.9, .01, .6), [mGold, mGold, M({ map: T_SPOT, roughness: .2 }), mGold, mGold, mGold]); spot.position.set(-1.8, .005, -D / 2 + 1.7); room.add(spot);

  // ── light ────────────────────────────────────────────────
  scene.add(new T.HemisphereLight(0xfff6e6, 0x4a3c2a, .45));
  var key = new T.SpotLight(0xfff0d8, 1.3, 40, Math.PI / 2.6, .7, 1); key.position.set(-3, 8.6, 3); key.target.position.set(1, 0, -2);
  key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.radius = 6; key.shadow.bias = -.0004; scene.add(key, key.target);
  [[-1.8, 4.3, 0], [1.8, 4.3, 0], [-4.8, 4.3, 0], [4.8, 4.3, 0]].forEach(function (p) { var l = new T.PointLight(0xffc27a, .35, 7, 2); l.position.set(p[0], p[1], p[2]); scene.add(l); });
  var bounce = new T.DirectionalLight(0xfff4e2, .35); bounce.position.set(4, 3, 6); scene.add(bounce);

  var VIEWS = {
    wide:   { p: [-5.7, 1.65, 3.8], l: [3.0, 3.6, -2.2], f: 72 },   // corner view like the real photos
    pillar: { p: [-.9, 1.0, 1.5], l: [0, 4.2, 0], f: 58 },          // up a pillar to the lamps
    lamps:  { p: [-1.6, 4.9, 1.9], l: [-.4, 4.6, 0], f: 46 },
    band:   { p: [-.85, 1.45, .75], l: [0, 1.45, 0], f: 40 },
    tawba:  { p: [3.2, 1.75, 2.2], l: [6, 1.6, 4.1], f: 60 },
    door:   { p: [-3.0, 1.7, 1.2], l: [-3.0, 1.9, 5], f: 60 },
    floor:  { p: [-.8, 2.4, -2.0], l: [-1.8, 0, -3.3], f: 50 }
  };
  var ready = (document.fonts && document.fonts.load ? document.fonts.load(font(40), "لا إله") : Promise.resolve()).then(function () {
    [T_FRIEZE, T_FRIEZE2, T_DOOR, T_TAWBA].forEach(function (t) { t.needsUpdate = true; }); });
  window.W3 = { T: T, scene: scene, cam: cam, R: R, room: room, tawba: tframe, tawbaLeaf: tleafPivot, door: door, lamps: lamps, flames: flames, W: W, D: D, H: H, SK: SK, LOW: LOW,
    mats: { gold: mGold, goldDk: mGoldDk, silver: mSilver, copper: mCopper, wood: mWood, greenM: mGreenM, glass: mGlass, dado: dadoM }, tex: tex, veins: veins, flower: flower, font: font, lathe: lathe, M: M, P: P };
  window.WORLD = { ready: ready, VIEWS: VIEWS, camera: cam,
    draw: function (t, v) { var V = typeof v === "string" ? VIEWS[v] || VIEWS.wide : v; cam.fov = V.f; cam.updateProjectionMatrix();
      cam.position.set(V.p[0], V.p[1], V.p[2]); cam.lookAt(V.l[0], V.l[1], V.l[2]);
      lamps.forEach(function (g, i) { g.rotation.z = Math.sin(t * 1.1 + i * .7) * .012; });
      flames.forEach(function (f, i) { f.material.emissiveIntensity = 1.2 + .15 * Math.sin(t * 5 + i * 1.7); });
      R.render(scene, cam); } };
})();
