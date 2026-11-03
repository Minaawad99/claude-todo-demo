// «أوعى تشحن الموبايل تحت المخدة» — real-3D bedroom at night (three.js, software WebGL), redrawn every frame by renderAt(t).
// World units are metres, y up. The bed's head is against the back wall (z = -2); the phone charges under the pillow, its
// cable running to a socket by the nightstand. The pillow and then the phone turn into a blue x-ray hologram; a big
// hologram of the battery's layers floats above the bed to show what happens inside. Every shot returns a state.
(function () {
  var T3 = window.THREE, LN = TIMING.lines, END = TIMING.duration;
  window.VIDEO_END = END;
  function L(i) { return i >= LN.length ? END + 3 : LN[i].start; }
  function clamp(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function ease(x) { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
  function lerp(a, b, k) { return a + (b - a) * k; }
  function hash(i) { var x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
  function K(u, a, b) { return clamp((u - a) / (b || 0.8)); }

  // ── renderer, scene, camera
  var cv = document.getElementById("gl"), r = new T3.WebGLRenderer({ canvas: cv, antialias: true, preserveDrawingBuffer: true });
  var GW = window.GL_W || 360, GH = window.GL_H || 640; r.setPixelRatio(window.devicePixelRatio || 1); r.setSize(GW, GH, false);
  r.toneMapping = T3.ACESFilmicToneMapping; r.toneMappingExposure = 0.6; r.shadowMap.enabled = true; r.shadowMap.type = T3.PCFSoftShadowMap; r.outputColorSpace = T3.SRGBColorSpace;
  var scene = new T3.Scene(); scene.background = new T3.Color("#0b0d12");
  scene.environment = new T3.PMREMGenerator(r).fromScene(new window.RoomEnvironment(), 0.04).texture; scene.environmentIntensity = 0.2;
  var cam = new T3.PerspectiveCamera(45, GW / GH, 0.01, 60);
  function tex(w, h, draw, rep) { var c = document.createElement("canvas"); c.width = w; c.height = h; draw(c.getContext("2d"), w, h); var t = new T3.CanvasTexture(c); t.colorSpace = T3.SRGBColorSpace; t.anisotropy = 4; if (rep) { t.wrapS = t.wrapT = T3.RepeatWrapping; t.repeat.set(rep[0], rep[1]); } return t; }
  function std(color, o) { return new T3.MeshStandardMaterial(Object.assign({ color: color, roughness: 0.8 }, o || {})); }
  function mesh(geo, mat, x, y, z, parent) { var m = new T3.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; (parent || scene).add(m); return m; }
  var RB = T3.RoundedBoxGeometry || window.RoundedBoxGeometry;
  function rbox(w, h, d, rad, seg) { return RB ? new RB(w, h, d, seg || 4, rad) : new T3.BoxGeometry(w, h, d); }
  var rnd = (function () { var s = 7; return function () { s = (s * 16807) % 2147483647; return s / 2147483647; }; })();

  // ── textures
  var wood = tex(512, 512, function (g, w, h) { g.fillStyle = "#5a3a22"; g.fillRect(0, 0, w, h); for (var i = 0; i < 160; i++) { g.strokeStyle = "rgba(" + (30 + rnd() * 50 | 0) + "," + (18 + rnd() * 30 | 0) + ",8," + (0.15 + rnd() * 0.25) + ")"; g.lineWidth = 1 + rnd() * 3; g.beginPath(); var x = rnd() * w; g.moveTo(x, 0); g.bezierCurveTo(x + rnd() * 20 - 10, h * 0.3, x + rnd() * 20 - 10, h * 0.7, x + rnd() * 12 - 6, h); g.stroke(); } });
  var parquet = tex(512, 512, function (g, w, h) { for (var y = 0; y < h; y += 32) for (var x = -((y / 32) % 2) * 64; x < w; x += 128) { var v = 90 + rnd() * 40 | 0; g.fillStyle = "rgb(" + v + "," + (v * 0.66 | 0) + "," + (v * 0.4 | 0) + ")"; g.fillRect(x, y, 127, 31); } }, [5, 5]);
  var wallT = tex(256, 256, function (g, w, h) { g.fillStyle = "#8a8070"; g.fillRect(0, 0, w, h); for (var i = 0; i < 2500; i++) { g.fillStyle = "rgba(60,50,40," + rnd() * 0.08 + ")"; g.fillRect(rnd() * w, rnd() * h, 2, 2); } }, [6, 3]);
  var linen = tex(256, 256, function (g, w, h) { g.fillStyle = "#e9e4da"; g.fillRect(0, 0, w, h); for (var i = 0; i < 1600; i++) { g.fillStyle = "rgba(120,110,100," + rnd() * 0.1 + ")"; g.fillRect(rnd() * w, rnd() * h, 3, 1); } }, [2, 2]);
  var duvet = tex(256, 256, function (g, w, h) { g.fillStyle = "#3d5a86"; g.fillRect(0, 0, w, h); g.strokeStyle = "rgba(255,255,255,.08)"; g.lineWidth = 3; for (var y = 0; y < h; y += 32) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); } }, [2, 3]);
  var city = tex(256, 256, function (g, w, h) { var gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#081020"); gr.addColorStop(1, "#22304a"); g.fillStyle = gr; g.fillRect(0, 0, w, h); for (var b = 0; b < 9; b++) { var bx = b * 30 - 5, bh = 70 + rnd() * 150; g.fillStyle = "#10141e"; g.fillRect(bx, h - bh, 26, bh); for (var y = h - bh + 6; y < h; y += 10) for (var x = bx + 3; x < bx + 24; x += 7) if (rnd() > 0.55) { g.fillStyle = rnd() > 0.5 ? "#ffd27a" : "#f6e7b0"; g.fillRect(x, y, 4, 5); } } g.fillStyle = "#f4f1e4"; g.beginPath(); g.arc(200, 40, 12, 0, 7); g.fill(); });
  var screenT = tex(128, 256, function (g, w, h) { var gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, "#1d3a6a"); gr.addColorStop(1, "#0a1428"); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.strokeStyle = "#7cf29a"; g.lineWidth = 5; g.strokeRect(44, 90, 40, 70); g.fillStyle = "#7cf29a"; g.fillRect(50, 120, 28, 34); g.fillStyle = "#fff"; g.beginPath(); g.moveTo(68, 98); g.lineTo(56, 126); g.lineTo(66, 126); g.lineTo(60, 150); g.lineTo(74, 118); g.lineTo(64, 118); g.closePath(); g.fill(); g.font = "bold 22px sans-serif"; g.textAlign = "center"; g.fillText("03:12", 64, 50); });
  var flameT = tex(128, 256, function (g) { var gr = g.createRadialGradient(64, 170, 4, 64, 150, 120); gr.addColorStop(0, "rgba(255,250,220,1)"); gr.addColorStop(0.18, "rgba(255,210,90,.95)"); gr.addColorStop(0.45, "rgba(255,120,30,.75)"); gr.addColorStop(0.75, "rgba(200,50,10,.25)"); gr.addColorStop(1, "rgba(120,20,0,0)"); g.fillStyle = gr; g.beginPath(); g.moveTo(64, 0); g.bezierCurveTo(120, 90, 128, 200, 64, 256); g.bezierCurveTo(0, 200, 8, 90, 64, 0); g.fill(); });
  var puffT = tex(128, 128, function (g) { var gr = g.createRadialGradient(64, 64, 2, 64, 64, 64); gr.addColorStop(0, "rgba(255,255,255,.9)"); gr.addColorStop(0.5, "rgba(255,255,255,.35)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); });
  var glowT = tex(128, 128, function (g) { var gr = g.createRadialGradient(64, 64, 2, 64, 64, 64); gr.addColorStop(0, "rgba(255,120,40,1)"); gr.addColorStop(0.4, "rgba(255,60,20,.55)"); gr.addColorStop(1, "rgba(255,30,0,0)"); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); });
  var sparkT = tex(64, 64, function (g) { var gr = g.createRadialGradient(32, 32, 1, 32, 32, 32); gr.addColorStop(0, "rgba(255,255,240,1)"); gr.addColorStop(0.3, "rgba(255,230,90,.9)"); gr.addColorStop(1, "rgba(255,160,0,0)"); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); });

  // ── the room
  var floor = mesh(new T3.PlaneGeometry(12, 12), std("#ffffff", { map: parquet, roughness: 0.55 }), 0, 0, 0); floor.rotation.x = -Math.PI / 2;
  var wallM = std("#ffffff", { map: wallT, roughness: 0.95 });
  mesh(new T3.PlaneGeometry(8, 3), wallM, 0, 1.5, -2.0);
  var side = mesh(new T3.PlaneGeometry(6, 3), wallM, -1.6, 1.5, 0.5); side.rotation.y = Math.PI / 2;
  var ceil = mesh(new T3.PlaneGeometry(8, 6), std("#6a655c"), 0, 2.7, 0); ceil.rotation.x = Math.PI / 2;
  mesh(new T3.BoxGeometry(8, 0.1, 0.02), std("#d9d3c6"), 0, 0.05, -1.99);
  // window with the night city and curtains, right of the bed
  mesh(new T3.PlaneGeometry(0.9, 0.9), std("#ffffff", { map: city, emissive: "#ffffff", emissiveMap: city, emissiveIntensity: 0.55 }), 1.85, 1.6, -1.99);
  [[1.85, 2.07, 0.98, 0.05], [1.85, 1.13, 0.98, 0.05], [1.38, 1.6, 0.05, 0.98], [2.32, 1.6, 0.05, 0.98], [1.85, 1.6, 0.03, 0.92]].forEach(function (q) { mesh(new T3.BoxGeometry(q[2], q[3], 0.05), std("#e9e6de"), q[0], q[1], -1.97); });
  var curG = new T3.PlaneGeometry(0.4, 1.9, 24, 4), cp = curG.attributes.position; for (var ci = 0; ci < cp.count; ci++) cp.setZ(ci, 0.035 * Math.sin(cp.getX(ci) * 55)); curG.computeVertexNormals();
  [1.22, 2.48].forEach(function (x) { mesh(curG, std("#6a3a3a", { side: T3.DoubleSide, roughness: 1 }), x, 1.3, -1.9); });
  // a framed picture over the bed
  mesh(new T3.BoxGeometry(0.7, 0.5, 0.03), std("#3a2a1a"), 0.2, 1.75, -1.98); mesh(new T3.PlaneGeometry(0.62, 0.42), std("#4a6a8a", { roughness: 0.6 }), 0.2, 1.75, -1.96);

  // ── the bed: headboard, frame, mattress, sheet, duvet folded back, the pillow (solid and x-ray)
  var woodM = std("#ffffff", { map: wood, roughness: 0.5 });
  mesh(new T3.BoxGeometry(1.6, 1.0, 0.08), woodM, 0.2, 0.75, -1.95);
  mesh(new T3.BoxGeometry(1.6, 0.25, 2.1), woodM, 0.2, 0.2, -0.9);
  mesh(rbox(1.5, 0.22, 2.0, 0.06), std("#ffffff", { map: linen, roughness: 0.9 }), 0.2, 0.43, -0.92);
  var duv = mesh(rbox(1.56, 0.08, 1.2, 0.04), std("#ffffff", { map: duvet, roughness: 0.85 }), 0.2, 0.57, -0.4); duv.rotation.x = 0.02;
  mesh(rbox(1.56, 0.06, 0.25, 0.03), std("#ffffff", { map: duvet, roughness: 0.85 }), 0.2, 0.63, -1.0);
  var PIL = new T3.Vector3(0.2, 0.6, -1.6);
  var pilGeo = rbox(0.66, 0.15, 0.42, 0.07, 6), pp = pilGeo.attributes.position; for (var pi = 0; pi < pp.count; pi++) { var px = pp.getX(pi), pz = pp.getZ(pi), py = pp.getY(pi); pp.setY(pi, py * (1 - 0.55 * Math.pow(Math.abs(px) / 0.33, 3)) * (1 - 0.4 * Math.pow(Math.abs(pz) / 0.21, 3))); } pilGeo.computeVertexNormals();
  var pilM = std("#ffffff", { map: linen, roughness: 0.95 }), pillow = mesh(pilGeo, pilM, PIL.x, PIL.y, PIL.z);
  var xm = new T3.MeshPhysicalMaterial({ color: "#8fd8ff", transparent: true, opacity: 0.3, roughness: 0.1, metalness: 0, emissive: "#3a90c0", emissiveIntensity: 0.35, side: T3.DoubleSide, depthWrite: false });
  var pilX = new T3.Mesh(pilGeo, xm); pilX.position.copy(PIL); scene.add(pilX);
  var pilE = new T3.LineSegments(new T3.EdgesGeometry(pilGeo, 30), new T3.LineBasicMaterial({ color: "#bfefff", transparent: true, opacity: 0.8 })); pilE.position.copy(PIL); scene.add(pilE);

  // ── the phone (solid / x-ray), its case, the battery inside, the cable, the charger in the socket
  var PH0 = new T3.Vector3(0.24, 0.555, -1.58), PHS = new T3.Vector3(1.26, 0.6, -1.66);   // under the pillow / on the nightstand
  var phG = new T3.Group(); scene.add(phG);
  var phGeo = rbox(0.075, 0.009, 0.155, 0.004, 3);
  var phBody = mesh(phGeo, std("#1d2026", { metalness: 0.6, roughness: 0.3 }), 0, 0, 0, phG);
  var phScreen = mesh(new T3.PlaneGeometry(0.069, 0.149), std("#ffffff", { map: screenT, emissive: "#ffffff", emissiveMap: screenT, emissiveIntensity: 0.9, roughness: 0.15 }), 0, 0.0047, 0, phG); phScreen.rotation.x = -Math.PI / 2;
  var phXm = xm.clone(), phX = new T3.Mesh(phGeo, phXm); phG.add(phX);
  var phE = new T3.LineSegments(new T3.EdgesGeometry(phGeo, 30), new T3.LineBasicMaterial({ color: "#bfefff", transparent: true, opacity: 0.9 })); phG.add(phE);
  var batt = mesh(new T3.BoxGeometry(0.058, 0.005, 0.1), std("#e2b035", { metalness: 0.3, roughness: 0.4, emissive: "#ff3a10", emissiveIntensity: 0 }), 0, -0.0005, 0.01, phG);
  var bulge = mesh(new T3.SphereGeometry(0.04, 24, 12), std("#1d2026", { metalness: 0.6, roughness: 0.3 }), 0, -0.004, 0.01, phG); bulge.scale.set(0.9, 0.01, 1.6);
  var caseM = mesh(rbox(0.082, 0.012, 0.162, 0.006, 3), std("#2f6f9f", { roughness: 0.55 }), 0, -0.0025, 0, phG); caseM.scale.y = 0.9;
  var plugP = new T3.Vector3(1.12, 0.78, -1.97);
  var cableM = std("#f4f1e8", { roughness: 0.6 }), cable = null;
  function setCable(a, unplug) { if (cable) { scene.remove(cable); cable.geometry.dispose(); } var b = plugP.clone().add(new T3.Vector3(0, -0.02 - 0.25 * unplug, 0.06 + 0.3 * unplug)); var c = new T3.CatmullRomCurve3([a, a.clone().add(new T3.Vector3(0.12, 0.0, 0.04)), new T3.Vector3((a.x + b.x) / 2 + 0.05, 0.6, (a.z + b.z) / 2 + 0.12), new T3.Vector3(b.x - 0.03, b.y - 0.12, b.z + 0.1), b]); cable = new T3.Mesh(new T3.TubeGeometry(c, 40, 0.003, 6), cableM); scene.add(cable); }
  mesh(new T3.BoxGeometry(0.08, 0.12, 0.01), std("#f2f0ea"), plugP.x, plugP.y, -1.995);
  var chg = new T3.Group(); scene.add(chg); var chgM = std("#f4f4f2", { roughness: 0.4 }); mesh(rbox(0.05, 0.05, 0.03, 0.006), chgM, 0, 0, 0, chg);
  var chgT = tex(64, 64, function (g) { g.fillStyle = "#d9d0b8"; g.fillRect(0, 0, 64, 64); g.fillStyle = "#8a3a2a"; g.font = "bold 14px sans-serif"; g.textAlign = "center"; g.fillText("FAST", 32, 36); });
  var fakeM = std("#ffffff", { map: chgT, roughness: 0.7 });

  // ── nightstand with a lamp and a clock
  mesh(new T3.BoxGeometry(0.5, 0.55, 0.42), woodM, 1.32, 0.275, -1.7);
  mesh(new T3.BoxGeometry(0.44, 0.18, 0.01), std("#4a301c"), 1.32, 0.36, -1.485); mesh(new T3.BoxGeometry(0.06, 0.015, 0.02), std("#c9ccd0", { metalness: 0.9, roughness: 0.3 }), 1.32, 0.36, -1.475);
  mesh(new T3.CylinderGeometry(0.05, 0.07, 0.03, 24), std("#2b2b2b"), 1.44, 0.565, -1.8); mesh(new T3.CylinderGeometry(0.01, 0.01, 0.22, 12), std("#c9a050", { metalness: 0.8, roughness: 0.3 }), 1.44, 0.69, -1.8);
  mesh(new T3.CylinderGeometry(0.08, 0.12, 0.14, 32, 1, true), std("#f2e2c0", { side: T3.DoubleSide, emissive: "#ffcc80", emissiveIntensity: 0.5, roughness: 1 }), 1.44, 0.84, -1.8);
  var lamp = new T3.PointLight("#ffc87a", 2.4, 4, 1.6); lamp.position.set(1.44, 0.8, -1.75); lamp.castShadow = true; lamp.shadow.mapSize.set(512, 512); scene.add(lamp);
  // wardrobe on the left wall
  mesh(new T3.BoxGeometry(0.6, 2.1, 1.3), woodM, -1.28, 1.05, 0.3);

  // ── the battery hologram floating above the bed (layers: cathode, separator, anode … soaked in electrolyte)
  var HB = new T3.Group(); HB.position.set(0.2, 0.92, -1.55); scene.add(HB);
  var layers = [], seps = [], LY = [0.075, 0.025, -0.025, -0.075];
  var catM = new T3.MeshPhysicalMaterial({ color: "#7a9ac0", metalness: 0.4, roughness: 0.35, emissive: "#2a4a70", emissiveIntensity: 0.3 }), anM = new T3.MeshPhysicalMaterial({ color: "#2b2b30", metalness: 0.3, roughness: 0.5, emissive: "#101018", emissiveIntensity: 0.3 });
  LY.forEach(function (y, n) { var m = mesh(new T3.BoxGeometry(0.42, 0.012, 0.26), n % 2 ? anM : catM, 0, y, 0, HB); layers.push(m); if (n < 3) { var sm = new T3.MeshPhysicalMaterial({ color: "#f4f6f8", transparent: true, opacity: 0.85, roughness: 0.3, emissive: "#ff5a1a", emissiveIntensity: 0 }); var s = mesh(new T3.BoxGeometry(0.42, 0.004, 0.26), sm, 0, y - 0.025, 0, HB); seps.push(s); } });
  var elM = new T3.MeshPhysicalMaterial({ color: "#5cc8ff", transparent: true, opacity: 0, roughness: 0.05, emissive: "#1a6aa0", emissiveIntensity: 0.3, depthWrite: false });
  var elBox = new T3.Mesh(new T3.BoxGeometry(0.46, 0.2, 0.3), elM); HB.add(elBox);
  var hbE = new T3.LineSegments(new T3.EdgesGeometry(new T3.BoxGeometry(0.46, 0.2, 0.3)), new T3.LineBasicMaterial({ color: "#bfefff", transparent: true, opacity: 0.9 })); HB.add(hbE);
  var ions = []; for (var ii = 0; ii < 24; ii++) { var io = mesh(new T3.SphereGeometry(0.006, 10, 8), std("#ffd23a", { emissive: "#c08a10", emissiveIntensity: 0.8 }), 0, 0, 0, HB); ions.push(io); }

  // ── effects: heat glow, heat shimmer, flames, smoke, sparks, boiling bubbles, the fire light
  function sprites(n, map, add, col, parent) { var a = []; for (var i = 0; i < n; i++) { var s = new T3.Sprite(new T3.SpriteMaterial({ map: map, transparent: true, depthWrite: false, blending: add ? T3.AdditiveBlending : T3.NormalBlending, color: col || "#ffffff", opacity: 0 })); (parent || scene).add(s); a.push(s); } return a; }
  var glow = sprites(1, glowT, true)[0], heatS = sprites(18, glowT, true, "#ff8a40"), flames = sprites(18, flameT, true, "#ffb070"), smokeS = sprites(18, puffT, false, "#5a5550"),
      sparks = sprites(10, sparkT, true, "#ffffff", HB), boilS = sprites(20, puffT, false, "#ffffff", HB), hbFire = sprites(10, flameT, true, "#ffb070", HB), outS = sprites(4, sparkT, true);
  var fireL = new T3.PointLight("#ff8a3a", 0, 5, 1.6); scene.add(fireL);

  // ── lights: dim moonlight + the lamp + a cool fill
  scene.add(new T3.HemisphereLight("#7a88a8", "#2a1e14", 0.3));
  var moonL = new T3.DirectionalLight("#9ab4e0", 0.5); moonL.position.set(2.5, 2.5, 1.5); moonL.target.position.set(0.2, 0.5, -1.5); scene.add(moonL.target); moonL.castShadow = true; moonL.shadow.mapSize.set(1024, 1024); Object.assign(moonL.shadow.camera, { left: -2.5, right: 2.5, top: 2.5, bottom: -2.5, near: 0.5, far: 9 }); moonL.shadow.bias = -0.0006; scene.add(moonL);
  var ceilL = new T3.PointLight("#ffd9a8", 0, 6, 1.6); ceilL.position.set(0.3, 2.5, -0.4); scene.add(ceilL);

  // ── camera keys
  function C(px, py, pz, tx, ty, tz, fov) { return { p: [px, py, pz], t: [tx, ty, tz], f: fov || 45 }; }
  var WIDE = C(1.55, 1.55, 1.3, 0.35, 0.6, -1.4, 50), MED = C(0.85, 1.05, -0.55, 0.24, 0.58, -1.6, 45), CLOSE = C(0.55, 0.85, -0.95, 0.24, 0.57, -1.6, 40), MACRO = C(0.4, 0.7, -1.28, 0.24, 0.56, -1.59, 34),
      HOLO = C(1.0, 1.25, -0.45, 0.2, 0.82, -1.55, 44), HOLOC = C(0.8, 1.15, -0.7, 0.2, 0.84, -1.55, 40), STAND = C(0.8, 0.95, -1.0, 1.26, 0.62, -1.7, 42), OUTLET = C(0.75, 0.9, -1.15, 1.14, 0.74, -1.95, 40),
      DOOR = C(0.6, 1.5, 1.9, 0.3, 0.7, -1.4, 52);

  // ── the shots: each returns the state for time u in the line (d = its length)
  function ST(o) { return Object.assign({ a: WIDE, b: WIDE, pil: 0, phX: 0, ph: 0, heat: 0, trap: 0, air: 0, swell: 0, lift: 0, holo: 0, elec: 0, ion: 0, melt: 0, short: 0, chain: 0, boil: 0, fire: 0, smoke: 0, caseOff: -1, fake: 0, unplug: 0, light: 0, x: false, check: 0, badge: "", chips: [], src: 0 }, o); }
  var S = [
    function (u, d) { return ST({ a: WIDE, b: MED, heat: 0.3 * K(u, 1.0, 2), pil: K(u, 2.4, 0.8), x: u > 3.2, src: 1, chips: [{ p: [0.24, 0.6, -1.58], dx: -70, dy: -40, t: "بيشحن تحت المخدة", k: K(u, 2.4) }] }); },
    function (u, d) { return ST({ a: MED, b: C(1.0, 1.3, 0.1, 0.24, 0.65, -1.55, 46), heat: 0.4 + 0.6 * K(u, 1.4, 2), fire: 0.6 * K(u, 2.6, 1.0), smoke: K(u, 2.4, 1), src: 1 }); },
    function (u, d) { return ST({ a: CLOSE, b: C(0.25, 0.95, -0.95, 0.24, 0.57, -1.6, 40), pil: K(u, 0.2, 0.6), src: 0 }); },
    function (u, d) { return ST({ a: CLOSE, b: MACRO, pil: 1, phX: K(u, 0.4, 0.6), src: 2, chips: [{ p: [0.24, 0.556, -1.57], dx: -80, dy: -50, t: "بطارية ليثيوم", k: K(u, 1.2) }] }); },
    function (u, d) { return ST({ a: MACRO, b: HOLO, pil: 1, phX: 1, holo: ease(K(u, 0.2, 1.0)), src: 2, chips: [{ p: [0.41, 1.095, -1.5], dx: 50, dy: -30, t: "موجب +", k: K(u, 1.0) }, { p: [0.41, 1.045, -1.5], dx: 55, dy: 0, t: "سالب −", k: K(u, 1.8) }, { p: [0.41, 1.075, -1.5], dx: -150, dy: -60, t: "الفاصل: أرفع من الشعرة", k: K(u, 2.6) }] }); },
    function (u, d) { return ST({ a: HOLO, b: HOLOC, pil: 1, phX: 1, holo: 1, elec: K(u, 0.3, 0.8), src: 2, chips: [{ p: [0.2, 0.93, -1.36], dx: -60, dy: 50, t: "سائل بيولّع", k: K(u, 1.0) }] }); },
    function (u, d) { return ST({ a: HOLOC, b: HOLO, pil: 1, phX: 1, holo: 1, elec: 1, ion: 1, heat: 0.3, src: 2, chips: [{ p: [0.2, 1.12, -1.5], dx: 60, dy: -40, t: "حرارة", k: K(u, 2.0) }] }); },
    function (u, d) { return ST({ a: STAND, b: C(0.85, 0.85, -1.2, 1.26, 0.62, -1.7, 36), ph: 1, heat: 0.4, air: 1, light: 0.3, src: 3, chips: [{ p: [1.26, 0.7, -1.66], dx: -70, dy: -50, t: "الحرارة بتطلع للهوا", k: K(u, 0.8) }] }); },
    function (u, d) { return ST({ a: MED, b: CLOSE, pil: K(u, 0.6, 0.6), heat: 0.5 + 0.4 * K(u, 0.8, 2), trap: 1, src: 3, chips: [{ p: [0.24, 0.62, -1.58], dx: -70, dy: -50, t: "الحرارة محبوسة", k: K(u, 1.4) }] }); },
    function (u, d) { var k = ease(K(u, 1.0, 2.6)); return ST({ a: CLOSE, b: MACRO, pil: 1, phX: 0.6, heat: 0.6 + 0.3 * k, trap: 1, src: 4, badge: "°م <b>" + Math.round(25 + 10 * k) + "</b> أقصى حد للجو" }); },
    function (u, d) { var k = ease(K(u, 0.8, 2.6)); return ST({ a: CLOSE, b: C(0.5, 0.78, -1.15, 0.24, 0.56, -1.59, 36), pil: 1, phX: 0.3, heat: 0.9, trap: 1, swell: k, lift: k, src: 3, chips: [{ p: [0.24, 0.545, -1.57], dx: -80, dy: 50, t: "بطارية منفوخة", k: K(u, 2.0) }] }); },
    function (u, d) { var k = ease(K(u, 0.3, 3.0)); return ST({ a: HOLO, b: HOLOC, pil: 1, phX: 1, holo: 1, elec: 1, ion: 0.5, heat: 0.8, melt: K(u, 1.8, 2.0), src: 5, badge: "°م <b>" + Math.round(40 + 90 * k) + "</b>" }); },
    function (u, d) { return ST({ a: HOLOC, b: C(0.65, 1.05, -0.95, 0.15, 0.88, -1.55, 34), pil: 1, phX: 1, holo: 1, elec: 1, melt: 1, short: K(u, 0.6, 0.3), heat: 1, src: 5, chips: [{ p: [0.1, 1.0, -1.5], dx: -60, dy: 60, t: "ماس!", k: K(u, 0.8) }] }); },
    function (u, d) { return ST({ a: C(0.65, 1.05, -0.95, 0.15, 0.88, -1.55, 34), b: HOLO, pil: 1, phX: 1, holo: 1, elec: 1, melt: 1, short: 1, chain: K(u, 0.4, 3.0), boil: 0.4 * K(u, 2.0), heat: 1, src: 5 }); },
    function (u, d) { return ST({ a: HOLO, b: C(0.95, 1.25, -0.5, 0.2, 0.95, -1.5, 44), pil: 1, phX: 1, holo: 1 - K(u, 3.2, 0.8), elec: 1, melt: 1, short: 1, chain: 1, boil: 1, heat: 1, src: 5, chips: [{ p: [0.2, 1.12, -1.5], dx: 70, dy: -50, t: "أكسجين من جواها", k: K(u, 2.4) }] }); },
    function (u, d) { return ST({ a: MED, b: C(1.2, 1.35, 0.2, 0.25, 0.75, -1.5, 48), heat: 1, fire: 0.3 + 0.7 * K(u, 0.3, 1.5), smoke: K(u, 0.3, 1.0), src: 1, chips: [{ p: [0.2, 0.75, -1.65], dx: -80, dy: -60, t: "جنب راسك", k: K(u, 1.6) }] }); },
    function (u, d) { var k = ease(K(u, 0.6, 2.5)); return ST({ a: C(1.0, 1.0, -0.6, 1.26, 0.6, -1.7, 44), b: STAND, ph: 1, heat: 0.7, light: 0.2, src: 6, badge: "مليون <b>" + (2.5 * k).toFixed(1) + "</b> نوت 7", x: false }); },
    function (u, d) { return ST({ a: WIDE, b: STAND, ph: 1, light: 0.3, check: K(u, 2.0, 0.1) > 0 ? 1 : 0, src: 7, chips: [{ p: [1.26, 0.58, -1.66], dx: -80, dy: -40, t: "سطح ناشف ومكشوف ✓", k: K(u, 2.4) }] }); },
    function (u, d) { return ST({ a: STAND, b: C(0.95, 0.85, -1.25, 1.26, 0.6, -1.7, 34), ph: 1, heat: 0.6 * (1 - K(u, 1.4, 1.6)), air: 1, caseOff: ease(K(u, 0.6, 1.0)), light: 0.3, check: K(u, 0.8, 0.1) > 0 ? 2 : 1, src: 7 }); },
    function (u, d) { return ST({ a: C(0.95, 0.85, -1.25, 1.26, 0.6, -1.7, 34), b: C(0.9, 0.8, -1.35, 1.26, 0.6, -1.7, 30), ph: 1, caseOff: 1, swell: 1, lift: 1, light: 0.3, x: u > 2.0, check: K(u, 2.4, 0.1) > 0 ? 3 : 2, src: 7 }); },
    function (u, d) { return ST({ a: OUTLET, b: C(0.75, 0.55, -1.45, 1.14, 0.74, -1.95, 34), ph: 1, caseOff: 1, fake: 1, light: 0.3, x: u > 1.4, check: 3, src: 8, chips: [{ p: [1.12, 0.8, -1.93], dx: -80, dy: -60, t: "شاحن مضروب", k: K(u, 0.6) }] }); },
    function (u, d) { return ST({ a: C(0.75, 0.55, -1.45, 1.14, 0.74, -1.95, 34), b: C(1.3, 1.2, -0.3, 1.2, 0.75, -1.7, 46), ph: 1, caseOff: 1, smoke: 0.6 * (1 - K(u, 2.0, 1.5)), heat: 0.8, unplug: ease(K(u, 1.0, 0.8)), light: 0.3, check: 3, src: 9, badge: "مطافي <b>180</b>" }); },
    function (u, d) { return ST({ a: C(1.3, 1.2, -0.3, 1.2, 0.75, -1.7, 46), b: C(1.25, 1.3, 0.2, 0.7, 0.6, -1.5, 46), ph: 1, caseOff: 1, light: 0.25, check: 3, src: 7, chips: [{ p: [1.26, 0.62, -1.66], dx: -90, dy: -50, t: "بعيد عن السرير", k: K(u, 1.0) }] }); },
    function (u, d) { return ST({ a: C(1.25, 1.3, 0.2, 0.7, 0.6, -1.5, 46), b: WIDE, ph: 1, caseOff: 1, light: 0.25, check: 3, src: 7 }); },
    function (u, d) { return ST({ a: WIDE, b: C(1.4, 1.5, 1.1, 0.4, 0.6, -1.4, 50), ph: 1, caseOff: 1, light: 0.25, card: 1 }); }
  ];
  var SRC = ["", "المصدر: تحذيرات المطافي من شحن الموبايل في السرير (Tucson Fire · Lincolnshire Fire & Rescue)", "المصدر: تركيب بطارية الليثيوم أيون — Battery University · Volta Foundation", "المصدر: الحرارة بتطلع بالتوصيل والحمل للهوا المحيط",
    "المصدر: Apple · About iPhone operating temperature (0–35°م)", "المصدر: فواصل البطاريات بتسيح ≈ 120–140°م — Volta Foundation · Battery Tech Online", "المصدر: Samsung · Galaxy Note 7 recall (2016)", "المصدر: نصايح الشحن الآمن — Apple · NFPA",
    "المصدر: NFPA — Lithium-ion battery safety", "المصدر: NFPA — رقم المطافي في مصر 180"];

  // ── apply a state
  var cap = document.getElementById("cap"), srcEl = document.getElementById("src"), badge = document.getElementById("badge"), chipsEl = document.getElementById("chips"), linesEl = document.getElementById("lines"),
      xEl = document.getElementById("x"), check = document.getElementById("check"), card = document.getElementById("card"), head = document.getElementById("head"), curLine = -1, lastCable = "";
  function vec(a) { return new T3.Vector3(a[0], a[1], a[2]); }
  function apply(s, t, i, u, d) {
    var k = ease(clamp(u / Math.max(0.5, d))), P = vec(s.a.p).lerp(vec(s.b.p), k), Tg = vec(s.a.t).lerp(vec(s.b.t), k);
    P.x += 0.008 * Math.sin(t * 0.9); P.y += 0.006 * Math.sin(t * 1.3 + 1); Tg.x += 0.004 * Math.sin(t * 1.1);
    if (s.short > 0 && s.short < 1) { P.x += 0.004 * Math.sin(t * 40); P.y += 0.003 * Math.cos(t * 37); }
    cam.position.copy(P); cam.fov = lerp(s.a.f, s.b.f, k); cam.updateProjectionMatrix(); cam.lookAt(Tg);
    // pillow: solid vs x-ray
    pillow.visible = s.pil < 0.5; pilX.visible = pilE.visible = s.pil > 0.01; xm.opacity = 0.28 * s.pil; pilE.material.opacity = 0.8 * s.pil;
    // phone: under the pillow (ph 0) or on the nightstand (ph 1); x-ray shows the battery inside
    var pos = s.ph ? PHS : PH0; phG.position.copy(pos); phG.rotation.set(0, s.ph ? 0.4 : -0.2, 0);
    var xr = s.phX; phBody.visible = phScreen.visible = xr < 0.5; phX.visible = phE.visible = xr > 0.01; phXm.opacity = 0.3 * xr; phE.material.opacity = 0.9 * xr;
    batt.visible = xr > 0.3; batt.material.emissiveIntensity = 0.9 * s.heat * (0.8 + 0.2 * Math.sin(t * 6));
    bulge.scale.set(0.9, 0.01 + 0.09 * s.swell, 1.6); phScreen.rotation.x = -Math.PI / 2 + 0.12 * s.lift; phScreen.position.y = 0.0047 + 0.004 * s.lift;
    caseM.visible = s.caseOff < 1; if (s.caseOff >= 0) caseM.position.set(0.18 * s.caseOff, -0.0025 + 0.05 * Math.sin(Math.PI * s.caseOff), 0.06 * s.caseOff); else caseM.position.set(0, -0.0025, 0);
    // cable and charger (rebuilt only when it changes)
    var a = pos.clone().add(new T3.Vector3(0.0, 0.0, 0.08).applyAxisAngle(new T3.Vector3(0, 1, 0), phG.rotation.y)), key = a.x.toFixed(3) + a.z.toFixed(3) + s.unplug.toFixed(2); if (key !== lastCable) { setCable(a, s.unplug); lastCable = key; }
    chg.position.set(plugP.x, plugP.y - 0.25 * s.unplug, plugP.z + 0.03 + 0.3 * s.unplug); chg.children[0].material = s.fake ? fakeM : chgM;
    outS.forEach(function (o, n) { o.material.opacity = s.fake && Math.sin(t * 17 + n * 2) > 0.4 ? 0.9 : 0; o.position.set(plugP.x + (hash(n) - 0.5) * 0.05, plugP.y + (hash(n + 2) - 0.5) * 0.05, plugP.z + 0.06); o.scale.setScalar(0.03); });
    // heat glow around the phone; trapped heat bounces inside the pillow, free heat rises into the air
    glow.position.copy(pos).add(new T3.Vector3(0, 0.02, 0)); glow.material.opacity = s.heat * (s.trap ? 0.9 : 0.5) * (0.85 + 0.15 * Math.sin(t * 5)); glow.scale.setScalar(0.18 + 0.14 * s.heat);
    heatS.forEach(function (h, n) { var q = (t * 0.6 + hash(n)) % 1; if (s.air) { h.material.opacity = 0.35 * s.heat * Math.sin(q * Math.PI); h.position.set(pos.x + (hash(n + 1) - 0.5) * 0.1, pos.y + 0.02 + q * 0.35, pos.z + (hash(n + 2) - 0.5) * 0.1); h.scale.setScalar(0.02 + 0.04 * q); }
      else if (s.trap) { var a2 = t * 1.4 + n * 2.1; h.material.opacity = 0.5 * s.heat; h.position.set(PIL.x + Math.sin(a2) * 0.26, PIL.y + 0.02 + Math.abs(Math.sin(a2 * 1.7)) * 0.05, PIL.z + Math.cos(a2 * 1.3) * 0.15); h.scale.setScalar(0.03); } else h.material.opacity = 0; });
    // the battery hologram
    var hv = s.holo; HB.visible = hv > 0.01; HB.scale.setScalar(Math.max(0.01, 0.75 * hv)); HB.rotation.y = -0.35 + 0.08 * Math.sin(t * 0.5); HB.rotation.x = 0.15;
    layers.forEach(function (m, n) { m.position.y = LY[n] * (1 + 0.6 * (1 - hv)); });
    seps.forEach(function (m, n) { var on = n === 1 || (s.chain && n < 1 + s.chain * 3); var mm = s.melt * (on ? 1 : 0); m.material.color.set(mm > 0.5 ? "#ff8a3a" : "#f4f6f8"); m.material.emissiveIntensity = 1.2 * mm; m.material.opacity = 0.85 - 0.5 * mm * (0.5 + 0.5 * Math.sin(t * 8 + n)); m.scale.set(1 - 0.15 * mm, 1, 1 - 0.15 * mm); });
    elM.opacity = 0.22 * s.elec; catM.emissiveIntensity = 0.3 + 1.2 * s.heat * hv * (s.melt > 0 ? 1 : 0.3);
    ions.forEach(function (io, n) { io.visible = s.ion > 0 && hash(n + 1) < s.ion; var q = (t * 0.5 + hash(n)) % 1, lay = (n % 2) * 2; io.position.set((hash(n + 5) - 0.5) * 0.38, lerp(LY[lay], LY[lay + 1], q), (hash(n + 8) - 0.5) * 0.22); });
    sparks.forEach(function (sp, n) { var on = (n === 0 && s.short > 0) || (s.chain > 0 && n < 1 + s.chain * 9); sp.material.opacity = on ? 0.6 + 0.4 * Math.sin(t * 30 + n) : 0; var ly = LY[1 + (n % 2)] - 0.025; sp.position.set(-0.12 + (n % 5) * 0.06 + 0.01 * Math.sin(t * 20 + n), n === 0 ? 0.0 : ly, (hash(n) - 0.5) * 0.2); sp.scale.setScalar(0.05 + 0.03 * Math.sin(t * 25 + n)); });
    boilS.forEach(function (b, n) { var q = (t * 0.7 + hash(n)) % 1; b.material.opacity = s.boil > hash(n + 4) ? 0.6 * Math.sin(q * Math.PI) : 0; b.position.set((hash(n + 1) - 0.5) * 0.4, -0.09 + q * 0.22, (hash(n + 2) - 0.5) * 0.26); b.scale.setScalar(0.015 + 0.025 * q); });
    hbFire.forEach(function (f, n) { var on = s.boil > 0.8; var h = 0.08 + 0.04 * Math.sin(t * 9 + n); f.material.opacity = on ? 0.6 : 0; f.position.set(-0.18 + n * 0.04, 0.1 + h * 0.4, (hash(n) - 0.5) * 0.2); f.scale.set(h * 0.6, h, 1); });
    // fire and smoke on the pillow
    var fp = PIL; flames.forEach(function (fl, n) { var a3 = n / flames.length * Math.PI * 2 + t * 0.5, rr = 0.04 + 0.16 * hash(n), h = (0.12 + 0.12 * hash(n + 4)) * s.fire * (0.8 + 0.3 * Math.sin(t * 9 + n * 2)); fl.material.opacity = s.fire > 0 ? 0.6 : 0; fl.position.set(fp.x + Math.cos(a3) * rr * 1.3, fp.y + 0.06 + h * 0.45, fp.z + Math.sin(a3) * rr * 0.7); fl.scale.set(h * 0.55, h, 1); });
    smokeS.forEach(function (sm, n) { var q = (t * 0.22 + hash(n + 10)) % 1, src2 = s.ph ? PHS : fp; sm.material.opacity = s.smoke * 0.45 * Math.sin(q * Math.PI); sm.position.set(src2.x + (hash(n) - 0.5) * 0.2 + 0.06 * Math.sin(t + n), src2.y + 0.08 + q * 1.4, src2.z + (hash(n + 3) - 0.5) * 0.15); var sc = 0.1 + 0.45 * q; sm.scale.set(sc, sc, 1); });
    fireL.position.set(fp.x, fp.y + 0.35, fp.z + 0.2); fireL.intensity = 2.2 * s.fire * (0.85 + 0.15 * Math.sin(t * 13)) + 0.8 * s.heat * (s.ph ? 0 : 1) * 0.3;
    ceilL.intensity = 2.0 * s.light;
    r.render(scene, cam);
    // ── HUD
    head.style.display = s.card ? "none" : "block";
    if (i !== curLine) { var c = CAPS[i]; cap.innerHTML = c.w.map(function (w, n) { return '<span class="' + (c.k[n] || '') + '">' + w + '</span>'; }).join(" "); srcEl.textContent = SRC[s.src] || ""; srcEl.style.display = s.src ? "block" : "none"; curLine = i; }
    var sp2 = cap.children, nw = sp2.length, shown = clamp(u / Math.max(0.6, d * 0.8)) * nw; for (var w = 0; w < nw; w++) sp2[w].style.opacity = clamp(shown - w + 1).toFixed(2);
    cap.style.display = s.card ? "none" : "block";
    badge.style.display = s.badge ? "block" : "none"; badge.innerHTML = s.badge;
    var html = "", svg = ""; s.chips.forEach(function (ch) { if (ch.k <= 0) return; var v = vec(ch.p).project(cam), x = (v.x + 1) / 2 * 360, y = (1 - v.y) / 2 * 640, cx = Math.max(60, Math.min(300, x + ch.dx)), cy = y + ch.dy;
      svg += '<path d="M' + x.toFixed(1) + ' ' + y.toFixed(1) + ' L' + cx.toFixed(1) + ' ' + cy.toFixed(1) + '" stroke="#fff" stroke-width="1" opacity="' + ch.k.toFixed(2) + '"/><circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="2.2" fill="#fff" opacity="' + ch.k.toFixed(2) + '"/>';
      html += '<div class="chip" style="left:' + cx.toFixed(1) + 'px;top:' + cy.toFixed(1) + 'px;opacity:' + ch.k.toFixed(2) + '">' + ch.t + '</div>'; });
    chipsEl.innerHTML = html; linesEl.innerHTML = svg;
    xEl.style.display = s.x ? "block" : "none";
    check.style.display = s.check ? "block" : "none"; ["c1", "c2", "c3"].forEach(function (id, n) { document.getElementById(id).className = s.check > n ? "on" : ""; });
    card.style.display = s.card ? "block" : "none";
    if (s.card) { var items = card.querySelectorAll(".p div, .bar, .srcs, .cta"); for (var q = 0; q < items.length; q++) items[q].style.opacity = clamp((u - 0.3 - q * 0.35) / 0.4).toFixed(2); }
  }
  window.renderAt = function (t) {
    var i = 0; while (i < LN.length - 1 && LN[i + 1].start - 0.05 <= t) i++;
    var u = t - LN[i].start, d = Math.max(0.5, L(i + 1) - LN[i].start); if (i === LN.length - 1) d = 4;
    var st = S[i](u, d); if (window.STATE_OVERRIDE) Object.assign(st, window.STATE_OVERRIDE(st));   // the cover page can mix a custom moment
    apply(st, t, i, u, d);
  };
  window.__cam = cam; window.__scene = scene; window.__r = r;
  if (!window.NO_AUTO) renderAt(0.5);
})();
