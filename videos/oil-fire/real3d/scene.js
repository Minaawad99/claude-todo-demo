// «أوعى تطفي زيت مولّع بالمية» — real-3D kitchen (three.js, software WebGL), redrawn every frame by renderAt(t).
// World units are metres, y up. The pan sits on the front-right burner; the object of the story turns into a blue
// x-ray hologram when we look inside it. Every shot returns a state; apply() moves the scene to it.
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
  r.setPixelRatio(window.devicePixelRatio || 1); r.setSize(360, 640, false);
  r.toneMapping = T3.ACESFilmicToneMapping; r.toneMappingExposure = 0.62; r.shadowMap.enabled = true; r.shadowMap.type = T3.PCFSoftShadowMap; r.outputColorSpace = T3.SRGBColorSpace;
  var scene = new T3.Scene(); scene.background = new T3.Color("#0d0f13");
  scene.environment = new T3.PMREMGenerator(r).fromScene(new window.RoomEnvironment(), 0.04).texture; scene.environmentIntensity = 0.22;
  var cam = new T3.PerspectiveCamera(45, 360 / 640, 0.02, 60);
  function tex(w, h, draw, rep) { var c = document.createElement("canvas"); c.width = w; c.height = h; draw(c.getContext("2d"), w, h); var t = new T3.CanvasTexture(c); t.colorSpace = T3.SRGBColorSpace; t.anisotropy = 4; if (rep) { t.wrapS = t.wrapT = T3.RepeatWrapping; t.repeat.set(rep[0], rep[1]); } return t; }
  function std(color, o) { return new T3.MeshStandardMaterial(Object.assign({ color: color, roughness: 0.8 }, o || {})); }
  function mesh(geo, mat, x, y, z, parent) { var m = new T3.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; (parent || scene).add(m); return m; }
  var rnd = (function () { var s = 11; return function () { s = (s * 16807) % 2147483647; return s / 2147483647; }; })();

  // ── textures
  var wood = tex(512, 512, function (g, w, h) { g.fillStyle = "#6a4426"; g.fillRect(0, 0, w, h); for (var i = 0; i < 160; i++) { g.strokeStyle = "rgba(" + (40 + rnd() * 50 | 0) + "," + (22 + rnd() * 30 | 0) + ",10," + (0.15 + rnd() * 0.25) + ")"; g.lineWidth = 1 + rnd() * 3; g.beginPath(); var x = rnd() * w; g.moveTo(x, 0); g.bezierCurveTo(x + rnd() * 20 - 10, h * 0.3, x + rnd() * 20 - 10, h * 0.7, x + rnd() * 12 - 6, h); g.stroke(); } });
  var stone = tex(512, 512, function (g, w, h) { g.fillStyle = "#e6e1d8"; g.fillRect(0, 0, w, h); for (var i = 0; i < 4000; i++) { g.fillStyle = "rgba(120,110,100," + rnd() * 0.12 + ")"; g.fillRect(rnd() * w, rnd() * h, 2, 2); } }, [3, 1]);
  var tiles = tex(512, 512, function (g, w, h) { g.fillStyle = "#d9d6cf"; g.fillRect(0, 0, w, h); g.strokeStyle = "#b9b4aa"; g.lineWidth = 4; for (var y = 0; y <= h; y += 64) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); } for (y = 0; y < h; y += 64) for (var x = ((y / 64) % 2) * 64; x <= w; x += 128) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 64); g.stroke(); } }, [4, 2]);
  var floorT = tex(512, 512, function (g, w, h) { g.fillStyle = "#cfc8bb"; g.fillRect(0, 0, w, h); g.strokeStyle = "#a9a296"; g.lineWidth = 3; for (var i = 0; i <= w; i += 128) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, h); g.stroke(); g.beginPath(); g.moveTo(0, i); g.lineTo(w, i); g.stroke(); } for (var k = 0; k < 3000; k++) { g.fillStyle = "rgba(90,80,70," + rnd() * 0.08 + ")"; g.fillRect(rnd() * w, rnd() * h, 3, 3); } }, [6, 6]);
  var city = tex(256, 256, function (g, w, h) { var gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#0b1222"); gr.addColorStop(1, "#24304a"); g.fillStyle = gr; g.fillRect(0, 0, w, h); for (var b = 0; b < 9; b++) { var bx = b * 30 - 5, bh = 80 + rnd() * 140; g.fillStyle = "#121722"; g.fillRect(bx, h - bh, 26, bh); for (var y = h - bh + 6; y < h; y += 10) for (var x = bx + 3; x < bx + 24; x += 7) if (rnd() > 0.5) { g.fillStyle = rnd() > 0.5 ? "#ffd27a" : "#f6e7b0"; g.fillRect(x, y, 4, 5); } } });
  var flameT = tex(128, 256, function (g, w, h) { var gr = g.createRadialGradient(64, 170, 4, 64, 150, 120); gr.addColorStop(0, "rgba(255,250,220,1)"); gr.addColorStop(0.18, "rgba(255,210,90,.95)"); gr.addColorStop(0.45, "rgba(255,120,30,.75)"); gr.addColorStop(0.75, "rgba(200,50,10,.25)"); gr.addColorStop(1, "rgba(120,20,0,0)"); g.fillStyle = gr; g.beginPath(); g.moveTo(64, 0); g.bezierCurveTo(120, 90, 128, 200, 64, 256); g.bezierCurveTo(0, 200, 8, 90, 64, 0); g.fill(); });
  var puffT = tex(128, 128, function (g, w, h) { var gr = g.createRadialGradient(64, 64, 2, 64, 64, 64); gr.addColorStop(0, "rgba(255,255,255,.9)"); gr.addColorStop(0.5, "rgba(255,255,255,.35)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  var gasT = tex(64, 64, function (g) { var gr = g.createRadialGradient(32, 32, 1, 32, 32, 32); gr.addColorStop(0, "rgba(200,230,255,1)"); gr.addColorStop(0.4, "rgba(60,120,255,.8)"); gr.addColorStop(1, "rgba(20,40,200,0)"); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); });

  // ── the room
  var floor = mesh(new T3.PlaneGeometry(12, 12), std("#ffffff", { map: floorT, roughness: 0.6 }), 0, 0, 0); floor.rotation.x = -Math.PI / 2;
  var wallM = std("#b9b0a2", { roughness: 0.95 });
  mesh(new T3.PlaneGeometry(8, 3), wallM, 0, 1.5, -1.62);
  var side = mesh(new T3.PlaneGeometry(6, 3), wallM, -2.6, 1.5, 0.5); side.rotation.y = Math.PI / 2;
  mesh(new T3.PlaneGeometry(4.6, 0.68), std("#c9c4ba", { map: tiles, roughness: 0.4 }), 0, 1.26, -1.615);
  var ceil = mesh(new T3.PlaneGeometry(8, 6), std("#8a857c"), 0, 2.6, 0); ceil.rotation.x = Math.PI / 2;
  // window with the night city and a curtain on the left
  mesh(new T3.PlaneGeometry(0.9, 0.7), std("#ffffff", { map: city, emissive: "#ffffff", emissiveMap: city, emissiveIntensity: 0.6 }), -1.35, 1.9, -1.61);
  [[-1.35, 2.26, 0.98, 0.05], [-1.35, 1.54, 0.98, 0.05], [-1.82, 1.9, 0.05, 0.76], [-0.88, 1.9, 0.05, 0.76], [-1.35, 1.9, 0.03, 0.72]].forEach(function (q) { mesh(new T3.BoxGeometry(q[2], q[3], 0.05), std("#f2f0ea"), q[0], q[1], -1.59); });
  var curG = new T3.PlaneGeometry(0.42, 0.95, 24, 4), cp = curG.attributes.position; for (var i = 0; i < cp.count; i++) cp.setZ(i, 0.03 * Math.sin(cp.getX(i) * 60)); curG.computeVertexNormals();
  var curtain = mesh(curG, std("#c9b28a", { side: T3.DoubleSide, roughness: 1 }), -0.98, 1.82, -1.52);
  // lower cabinets, counter, upper cabinets, hood
  var woodM = std("#ffffff", { map: wood, roughness: 0.55 });
  [[-1.55, 1.5], [1.55, 1.5]].forEach(function (c) { mesh(new T3.BoxGeometry(c[1] * 1.0 + 0.3, 0.86, 0.6), woodM, c[0], 0.43, -1.3); });
  for (var d = -2.1; d <= 2.1; d += 0.55) if (Math.abs(d) > 0.5) { mesh(new T3.BoxGeometry(0.02, 0.18, 0.02), std("#c9ccd0", { metalness: 0.9, roughness: 0.3 }), d + 0.2, 0.7, -0.99); }
  [[-1.55], [1.55]].forEach(function (c) { mesh(new T3.BoxGeometry(1.8, 0.04, 0.64), std("#ffffff", { map: stone, roughness: 0.35 }), c[0], 0.9, -1.28); });
  [[-1.6], [1.6]].forEach(function (c) { mesh(new T3.BoxGeometry(1.6, 0.72, 0.36), woodM, c[0], 2.08, -1.43); });
  mesh(new T3.BoxGeometry(0.78, 0.22, 0.48), std("#b9bdc2", { metalness: 0.85, roughness: 0.35 }), 0, 2.0, -1.38);
  // the stove: stainless body, oven glass, knobs, black top with four burners and grates
  var steel = std("#c4c8cc", { metalness: 0.85, roughness: 0.32 });
  mesh(new T3.BoxGeometry(0.76, 0.88, 0.62), steel, 0, 0.44, -1.3);
  mesh(new T3.BoxGeometry(0.6, 0.38, 0.01), std("#15181c", { roughness: 0.1, metalness: 0.4 }), 0, 0.4, -0.985);
  mesh(new T3.BoxGeometry(0.5, 0.02, 0.03), steel, 0, 0.64, -0.97);
  var top = mesh(new T3.BoxGeometry(0.76, 0.02, 0.62), std("#1b1d20", { roughness: 0.3, metalness: 0.3 }), 0, 0.89, -1.3);
  var BURN = [[-0.18, -1.45], [0.18, -1.45], [-0.18, -1.14], [0.17, -1.12]];
  BURN.forEach(function (b) { mesh(new T3.CylinderGeometry(0.045, 0.05, 0.02, 24), std("#2a2c2f", { metalness: 0.6, roughness: 0.4 }), b[0], 0.91, b[1]); [0, 1].forEach(function (k) { var bar = mesh(new T3.BoxGeometry(0.22, 0.015, 0.015), std("#111"), b[0], 0.935, b[1]); bar.rotation.y = k * Math.PI / 2; }); });
  var knobs = []; for (var kn = 0; kn < 4; kn++) { var kb = mesh(new T3.CylinderGeometry(0.022, 0.022, 0.025, 20), std("#1a1a1a", { roughness: 0.4 }), -0.24 + kn * 0.16, 0.8, -0.98); kb.rotation.x = Math.PI / 2; var ind = mesh(new T3.BoxGeometry(0.004, 0.02, 0.004), std("#ddd"), 0, 0.006, -0.013, kb); knobs.push(kb); }
  // gas flame ring under the pan's burner
  var gas = []; for (var gi = 0; gi < 14; gi++) { var sp = new T3.Sprite(new T3.SpriteMaterial({ map: gasT, blending: T3.AdditiveBlending, depthWrite: false, transparent: true })); var a = gi / 14 * Math.PI * 2; sp.position.set(BURN[3][0] + Math.cos(a) * 0.05, 0.925, BURN[3][1] + Math.sin(a) * 0.05); sp.scale.set(0.02, 0.025, 1); scene.add(sp); gas.push(sp); }

  // ── the pan (solid and x-ray versions), the oil, the lid
  var PP = new T3.Vector3(0.17, 0.945, -1.12);
  var panG = new T3.Group(); panG.position.copy(PP); scene.add(panG);
  var prof = [new T3.Vector2(0, 0), new T3.Vector2(0.12, 0), new T3.Vector2(0.135, 0.01), new T3.Vector2(0.142, 0.055), new T3.Vector2(0.136, 0.055), new T3.Vector2(0.13, 0.012), new T3.Vector2(0.117, 0.006), new T3.Vector2(0, 0.006)];
  var panGeo = new T3.LatheGeometry(prof, 48);
  var panSolid = mesh(panGeo, std("#26282b", { metalness: 0.5, roughness: 0.35, side: T3.DoubleSide }), 0, 0, 0, panG);
  var handle = mesh(new T3.BoxGeometry(0.2, 0.018, 0.03), std("#1c1c1c", { roughness: 0.5 }), 0.24, 0.05, 0.03, panG); handle.rotation.y = -0.25; handle.rotation.z = 0.12;
  var xm = new T3.MeshPhysicalMaterial({ color: "#8fd8ff", transparent: true, opacity: 0.32, roughness: 0.1, metalness: 0, emissive: "#3a90c0", emissiveIntensity: 0.35, side: T3.DoubleSide, depthWrite: false });
  var panX = new T3.Mesh(panGeo, xm); panG.add(panX);
  var edges = new T3.LineSegments(new T3.EdgesGeometry(panGeo, 25), new T3.LineBasicMaterial({ color: "#bfefff", transparent: true, opacity: 0.8 })); panG.add(edges);
  var oil = mesh(new T3.CylinderGeometry(0.118, 0.116, 0.02, 48), new T3.MeshPhysicalMaterial({ color: "#d9a030", transparent: true, opacity: 0.85, roughness: 0.05, emissive: "#6a3a08", emissiveIntensity: 0.2 }), 0, 0.017, 0, panG);
  var drop = mesh(new T3.SphereGeometry(0.018, 20, 16), new T3.MeshPhysicalMaterial({ color: "#3ab0ff", transparent: true, opacity: 0.9, roughness: 0.05, emissive: "#1a70c0", emissiveIntensity: 0.5 }), 0, 0.05, 0, panG);
  var bubbles = []; for (var bi = 0; bi < 30; bi++) { var bs = new T3.Sprite(new T3.SpriteMaterial({ map: puffT, transparent: true, depthWrite: false, opacity: 0 })); panG.add(bs); bubbles.push(bs); }
  var lidG = new T3.Group(); scene.add(lidG);
  mesh(new T3.CylinderGeometry(0.15, 0.15, 0.006, 48), new T3.MeshPhysicalMaterial({ color: "#c9d6dc", transparent: true, opacity: 0.55, roughness: 0.05, metalness: 0.1 }), 0, 0.03, 0, lidG);
  mesh(new T3.TorusGeometry(0.15, 0.005, 8, 48), std("#b0b4b8", { metalness: 0.9, roughness: 0.3 }), 0, 0.03, 0, lidG).rotation.x = Math.PI / 2;
  mesh(new T3.CylinderGeometry(0.018, 0.022, 0.025, 20), std("#1c1c1c"), 0, 0.045, 0, lidG);

  // ── fire, smoke, steam, fireball (sprites), the fire light
  function sprites(n, map, add, col) { var a = []; for (var i = 0; i < n; i++) { var s = new T3.Sprite(new T3.SpriteMaterial({ map: map, transparent: true, depthWrite: false, blending: add ? T3.AdditiveBlending : T3.NormalBlending, color: col || "#ffffff", opacity: 0 })); scene.add(s); a.push(s); } return a; }
  var flames = sprites(14, flameT, true, "#ffb070"), balls = sprites(40, flameT, true, "#ffa060"), steamS = sprites(30, puffT, false, "#ffffff"), smokeS = sprites(16, puffT, false, "#8a8580"), sparks = sprites(12, flameT, true), soda = sprites(26, puffT, false, "#ffffff"), drips = sprites(10, flameT, true);
  var fireL = new T3.PointLight("#ff8a3a", 0, 6, 1.6); fireL.position.set(PP.x, PP.y + 0.25, PP.z + 0.1); fireL.castShadow = false; scene.add(fireL);
  // ── the water glass with its pour, the steam volume box, oxygen molecules, soda box, flour bag, door
  var glassG = new T3.Group(); scene.add(glassG);
  mesh(new T3.CylinderGeometry(0.04, 0.034, 0.11, 32, 1, true), new T3.MeshPhysicalMaterial({ color: "#e6f4ff", transparent: true, opacity: 0.35, roughness: 0.02, side: T3.DoubleSide, depthWrite: false }), 0, 0.055, 0, glassG);
  var water = mesh(new T3.CylinderGeometry(0.037, 0.032, 0.08, 32), new T3.MeshPhysicalMaterial({ color: "#4ab8ff", transparent: true, opacity: 0.75, roughness: 0.05, emissive: "#1a6aa0", emissiveIntensity: 0.3 }), 0, 0.042, 0, glassG);
  var pourG = new T3.Group(); scene.add(pourG); var pourM = new T3.MeshPhysicalMaterial({ color: "#5cc0ff", transparent: true, opacity: 0.7, emissive: "#1a6aa0", emissiveIntensity: 0.4, depthWrite: false });
  var pour = new T3.Mesh(new T3.TubeGeometry(new T3.QuadraticBezierCurve3(new T3.Vector3(0, 0, 0), new T3.Vector3(-0.05, 0.03, 0), new T3.Vector3(-0.1, -0.16, 0)), 24, 0.008, 8), pourM); pourG.add(pour);
  var volG = new T3.Group(); scene.add(volG); var vb = new T3.BoxGeometry(1, 1, 1);
  var volFill = new T3.Mesh(vb, new T3.MeshBasicMaterial({ color: "#ffffff", transparent: true, opacity: 0.12, depthWrite: false })); var volEdge = new T3.LineSegments(new T3.EdgesGeometry(vb), new T3.LineBasicMaterial({ color: "#ffffff", transparent: true, opacity: 0.9 })); volG.add(volFill); volG.add(volEdge);
  var o2 = []; for (var oi = 0; oi < 10; oi++) { var og = new T3.Group(); mesh(new T3.SphereGeometry(0.007, 12, 10), std("#e04a3a", { roughness: 0.3, emissive: "#601810" }), -0.005, 0, 0, og); mesh(new T3.SphereGeometry(0.007, 12, 10), std("#e04a3a", { roughness: 0.3, emissive: "#601810" }), 0.005, 0, 0, og); scene.add(og); o2.push(og); }
  var sodaBox = new T3.Group(); scene.add(sodaBox); var sodaT = tex(128, 128, function (g) { g.fillStyle = "#f4f0e6"; g.fillRect(0, 0, 128, 128); g.fillStyle = "#e06a20"; g.fillRect(0, 70, 128, 58); g.fillStyle = "#1b4a8a"; g.font = "bold 30px sans-serif"; g.textAlign = "center"; g.fillText("صودا", 64, 50); });
  mesh(new T3.BoxGeometry(0.07, 0.1, 0.04), std("#ffffff", { map: sodaT }), 0, 0, 0, sodaBox);
  var flourBag = new T3.Group(); scene.add(flourBag); var flourT = tex(128, 128, function (g) { g.fillStyle = "#e9dcc0"; g.fillRect(0, 0, 128, 128); g.fillStyle = "#8a6a3a"; g.font = "bold 28px sans-serif"; g.textAlign = "center"; g.fillText("دقيق", 64, 70); });
  mesh(new T3.BoxGeometry(0.09, 0.13, 0.05), std("#ffffff", { map: flourT, roughness: 1 }), 0, 0, 0, flourBag);
  var doorG = new T3.Group(); doorG.position.set(1.55, 0, 1.9); scene.add(doorG);
  mesh(new T3.BoxGeometry(0.86, 2.05, 0.04), std("#ffffff", { map: wood, roughness: 0.6 }), 0.43, 1.025, 0, doorG);
  mesh(new T3.BoxGeometry(0.03, 0.03, 0.08), std("#c9ccd0", { metalness: 0.9, roughness: 0.3 }), 0.78, 1.0, 0.04, doorG);
  var frameM = std("#f2f0ea"); [[1.5, 1.05, 0.08, 2.1], [2.48, 1.05, 0.08, 2.1], [1.99, 2.12, 1.06, 0.08]].forEach(function (q) { mesh(new T3.BoxGeometry(q[2], q[3], 0.12), frameM, q[0], q[1], 1.9); });
  [[0.7, 1.9, 1.6, 2.4], [3.3, 1.9, 1.6, 2.4]].forEach(function (q) { mesh(new T3.BoxGeometry(q[2], q[3] + 0.4, 0.1), wallM, q[0], 1.2, q[1]); });
  // small fires on the curtain and the cabinet (line 11)
  var cfl = sprites(14, flameT, true, "#ffb070");

  // ── lights
  scene.add(new T3.HemisphereLight("#9aa8c0", "#3a2a1a", 0.35));
  var key = new T3.DirectionalLight("#ffe9cc", 1.1); key.position.set(2, 3.2, 2.5); key.target.position.set(0, 0.9, -1.2); scene.add(key.target); key.castShadow = true; key.shadow.mapSize.set(1024, 1024); Object.assign(key.shadow.camera, { left: -2.5, right: 2.5, top: 2.5, bottom: -2.5, near: 0.5, far: 9 }); key.shadow.bias = -0.0006; scene.add(key);
  var ceilL = new T3.PointLight("#ffd9a8", 2.2, 5, 1.6); ceilL.position.set(0.3, 2.45, -0.4); scene.add(ceilL);

  // ── camera keys
  function C(px, py, pz, tx, ty, tz, fov) { return { p: [px, py, pz], t: [tx, ty, tz], f: fov || 45 }; }
  var WIDE = C(1.25, 1.6, 1.25, 0.05, 1.15, -1.2, 50), MED = C(0.62, 1.35, -0.15, 0.13, 1.0, -1.15, 45), CLOSE = C(0.55, 1.32, -0.3, 0.17, 0.98, -1.12, 40), MACRO = C(0.42, 1.18, -0.55, 0.17, 0.97, -1.12, 36),
      UP = C(0.95, 1.2, 0.35, 0.1, 1.65, -1.3, 52), CURT = C(0.35, 1.45, 0.35, -1.0, 1.45, -1.5, 46), DOOR = C(2.2, 1.55, 3.2, 0.1, 1.15, -1.1, 46), COUNTER = C(0.75, 1.3, -0.25, 0.35, 0.98, -1.2, 44);

  // ── the shots: each returns the state for time u in the line (d = its length)
  function ST(o) { return Object.assign({ a: WIDE, b: WIDE, fire: 0, fs: 1, xray: 0, oilHot: 0, drop: -1, boil: 0, steam: 0, ball: 0, smoke: 0, glass: 0, glassTilt: 0, pour: 0, box: 0, lid: 0, o2: 0, knob: 0, gas: 1, soda: 0, flour: 0, carry: 0, door: 0, curtain: 0, x: false, check: 0, badge: "", chips: [], src: 0 }, o); }
  var S = [
    function (u, d) { return ST({ a: WIDE, b: MED, fire: 1, glass: 1, x: u > 2.2, src: 1 }); },
    function (u, d) { var p = K(u, 0.6, 0.6); return ST({ a: MED, b: C(0.9, 1.25, 0.3, 0.1, 1.5, -1.3, 52), fire: 1 - K(u, 1.3, 0.3), glass: 1, glassTilt: p, pour: K(u, 1.0, 0.4) * (1 - K(u, 1.6, 0.3)), ball: K(u, 1.25, 2.4), src: 1 }); },
    function (u, d) { return ST({ a: CLOSE, b: C(0.0, 1.32, -0.4, 0.17, 0.98, -1.12, 40), fire: 0, src: 1 }); },
    function (u, d) { return ST({ a: CLOSE, b: MACRO, xray: K(u, 0.3, 0.6), oilHot: 0.4, boil: 0.15, src: 2, badge: "°م <b>180</b>", chips: [{ p: [0.17, 0.965, -1.12], dx: -70, dy: -50, t: "زيت", k: K(u, 1.0) }] }); },
    function (u, d) { var k = K(u, 0.3, 2.4); return ST({ a: MACRO, b: CLOSE, xray: 1 - K(u, 2.4, 0.5), oilHot: 0.4 + 0.6 * k, smoke: K(u, 0.4, 1.0), fire: K(u, 2.4, 0.4), src: 2, badge: "°م <b>" + Math.round(180 + 140 * k) + "</b>" }); },
    function (u, d) { return ST({ a: CLOSE, b: MACRO, xray: 1, fire: 0.5, fs: 0.7, oilHot: 1, drop: ease(K(u, 0.4, 1.8)), src: 3, chips: [{ p: [0.17, 0.958, -1.12], dx: 70, dy: 40, t: "مية تحت الزيت", k: K(u, 2.0) }] }); },
    function (u, d) { return ST({ a: MACRO, b: C(0.45, 1.2, -0.5, 0.17, 0.98, -1.12, 38), xray: 1, fire: 0.5, fs: 0.7, oilHot: 1, drop: 1, boil: 0.3 + 0.7 * K(u, 0.5, 1.2), src: 3, badge: "°م <b>100</b> بتغلي عند" }); },
    function (u, d) { var k = ease(K(u, 0.3, 2.6)); return ST({ a: C(0.45, 1.2, -0.5, 0.17, 0.98, -1.12, 38), b: CLOSE, xray: 1 - K(u, 2.6, 0.5), fire: 0.5, fs: 0.7, oilHot: 1, drop: 1, boil: 1, steam: k, src: 3, badge: "مرة <b>" + Math.round(1 + 1699 * k) + "×</b>" }); },
    function (u, d) { var k = ease(K(u, 0.4, 2.4)); return ST({ a: COUNTER, b: C(1.3, 1.5, 0.7, 0.45, 1.15, -1.0, 48), glass: 2, box: k, src: 3, badge: "لتر بخار <b>" + Math.round(0.25 + 424.75 * k) + "</b>", chips: [{ p: [0.55, 0.93, -0.95], dx: 60, dy: 30, t: "كوباية ربع لتر", k: K(u, 0.2) }, { p: [0.55, 1.55, -1.15], dx: -60, dy: -30, t: "≈ 40 جردل", k: K(u, 2.4) }] }); },
    function (u, d) { return ST({ a: CLOSE, b: UP, fire: 0.6, steam: 1, ball: 0.25 * K(u, 0.6, 1.6), src: 1, chips: [{ p: [0.17, 1.3, -1.12], dx: -60, dy: -20, t: "نقط زيت مولّع", k: K(u, 1.0) }] }); },
    function (u, d) { return ST({ a: UP, b: C(1.1, 1.3, 0.6, 0.1, 1.8, -1.3, 56), ball: 0.25 + 0.75 * K(u, 0.2, 1.8), src: 1, chips: [{ p: [0.1, 2.35, -1.3], dx: -40, dy: 30, t: "للسقف", k: K(u, 1.6) }] }); },
    function (u, d) { return ST({ a: CURT, b: C(0.5, 1.35, 0.6, -0.6, 1.3, -1.4, 50), ball: 0.6, fire: 1, curtain: K(u, 0.3, 1.0), src: 1 }); },
    function (u, d) { return ST({ a: C(0.55, 1.05, -0.35, 0.17, 0.85, -1.05, 42), b: MED, fire: 1 - 0.2 * K(u, 1.2), knob: K(u, 0.8, 0.6), gas: 1 - K(u, 0.8, 0.6), check: K(u, 1.0, 0.1) > 0 ? 1 : 0, src: 4 }); },
    function (u, d) { var k = ease(K(u, 0.4, 1.2)); return ST({ a: MED, b: CLOSE, fire: 1 - K(u, 1.4, 1.4), gas: 0, lid: k, check: K(u, 1.4, 0.1) > 0 ? 2 : 1, src: 4 }); },
    function (u, d) { return ST({ a: CLOSE, b: MACRO, xray: K(u, 0.2, 0.5), fire: 0.35 * (1 - K(u, 0.6, 2.0)), gas: 0, lid: 1, o2: 1, oilHot: 1, check: 2, src: 4, chips: [{ p: [0.17, 1.06, -1.0], dx: -70, dy: -50, t: "أكسجين ✕", k: K(u, 0.8) }] }); },
    function (u, d) { var k = ease(K(u, 0.3, 2.6)); return ST({ a: MACRO, b: CLOSE, xray: 1 - K(u, 2.8, 0.6), gas: 0, lid: 1, oilHot: 1 - k, check: 2, src: 4, badge: "دقيقة <b>" + Math.round(30 * k) + "</b>" }); },
    function (u, d) { return ST({ a: CLOSE, b: C(0.6, 1.35, -0.3, 0.17, 1.0, -1.12, 42), fire: 0.5 * (1 - K(u, 1.6, 1.0)), fs: 0.6, gas: 0, soda: K(u, 0.4, 0.2) * (1 - K(u, 2.8, 0.4)), check: 2, src: 4, chips: [{ p: [0.25, 1.2, -1.1], dx: 70, dy: -40, t: "بيكربونات صودا ✓", k: K(u, 0.6) }] }); },
    function (u, d) { return ST({ a: CLOSE, b: C(0.55, 1.35, -0.25, 0.17, 1.05, -1.12, 44), fire: 0.5, fs: 0.6, gas: 0, flour: K(u, 0.4, 0.2), ball: 0.18 * K(u, 1.2, 0.8), x: u > 1.6, check: 3, src: 4 }); },
    function (u, d) { return ST({ a: MED, b: C(1.25, 1.45, 0.75, 0.75, 0.85, -0.45, 50), fire: 0.8, gas: 0, carry: ease(K(u, 0.3, 2.0)), x: u > 2.2, check: 3, src: 4 }); },
    function (u, d) { return ST({ a: DOOR, b: C(2.05, 1.5, 3.6, 0.1, 1.15, -1.1, 44), fire: 1, fs: 1.6, ball: 0.35, gas: 0, door: ease(K(u, 1.2, 1.6)), check: 3, src: 5, badge: "مطافي <b>180</b>" }); },
    function (u, d) { return ST({ a: WIDE, b: C(1.1, 1.5, 0.9, 0.1, 1.05, -1.2, 46), fire: 0, gas: 1, oilHot: 0.5, smoke: 0.2, check: 3, src: 6 }); },
    function (u, d) { return ST({ a: MED, b: C(0.55, 1.05, -0.35, 0.17, 0.85, -1.05, 42), smoke: 1 - K(u, 1.6, 1.0), gas: 1 - K(u, 1.4, 0.5), knob: K(u, 1.4, 0.5), check: 3, src: 6 }); },
    function (u, d) { return ST({ a: CLOSE, b: COUNTER, gas: 1, lid: -1, check: 3, src: 6, chips: [{ p: [0.45, 0.95, -1.05], dx: 60, dy: 40, t: "الغطا جنبك", k: K(u, 0.6) }] }); },
    function (u, d) { return ST({ a: COUNTER, b: WIDE, gas: 0, lid: -1, check: 3, src: 6 }); },
    function (u, d) { return ST({ a: WIDE, b: C(1.15, 1.55, 1.1, 0.05, 1.15, -1.2, 50), gas: 0, lid: -1, card: 1 }); }
  ];
  var SRC = ["", "المصدر: NFPA · Cooking fire safety — London Fire Brigade · Chip pan fires", "المصدر: درجة حرارة القلي ≈ 175–190°م · USDA FSIS — نقطة الدخان والاشتعال لزيوت الطبخ", "محسوب: كثافة المية والزيت — تمدد المية لبخار عند 100°م ≈ 1700 مرة",
    "المصدر: NFPA · Cooking fire safety — London Fire Brigade · Chip pan fires", "المصدر: NFPA — رقم المطافي في مصر 180", "المصدر: NFPA · Cooking fire safety"];

  // ── apply a state
  var cap = document.getElementById("cap"), srcEl = document.getElementById("src"), badge = document.getElementById("badge"), chipsEl = document.getElementById("chips"), linesEl = document.getElementById("lines"),
      xEl = document.getElementById("x"), check = document.getElementById("check"), card = document.getElementById("card"), head = document.getElementById("head"), curLine = -1;
  function vec(a) { return new T3.Vector3(a[0], a[1], a[2]); }
  function apply(s, t, i, u, d) {
    var k = ease(clamp(u / Math.max(0.5, d))), P = vec(s.a.p).lerp(vec(s.b.p), k), Tg = vec(s.a.t).lerp(vec(s.b.t), k);
    P.x += 0.012 * Math.sin(t * 0.9); P.y += 0.008 * Math.sin(t * 1.3 + 1); Tg.x += 0.006 * Math.sin(t * 1.1);
    if (s.ball > 0.2 && s.ball < 0.9) { P.x += 0.01 * Math.sin(t * 40); P.y += 0.008 * Math.cos(t * 37); }
    cam.position.copy(P); cam.fov = lerp(s.a.f, s.b.f, k); cam.updateProjectionMatrix(); cam.lookAt(Tg);
    // pan: solid vs x-ray
    panSolid.visible = s.xray < 0.5; panX.visible = edges.visible = s.xray > 0.01; xm.opacity = 0.32 * s.xray; edges.material.opacity = 0.8 * s.xray; handle.visible = s.xray < 0.5;
    oil.material.color.set(s.xray > 0.5 ? "#e8a838" : "#c98a28"); oil.material.emissiveIntensity = 0.15 + 0.6 * s.oilHot; oil.material.opacity = s.xray > 0.5 ? 0.8 : 0.95;
    // carrying the pan away
    panG.position.set(PP.x + 0.9 * s.carry, PP.y + 0.18 * Math.sin(Math.PI * Math.min(1, s.carry * 1.4)), PP.z + 1.1 * s.carry); panG.rotation.z = -0.25 * s.carry * Math.sin(t * 6);
    // water drop sinking under the oil, boiling
    drop.visible = s.drop >= 0 && s.boil < 0.6; if (s.drop >= 0) drop.position.set(0.0, lerp(0.08, 0.012, s.drop), 0); drop.scale.setScalar(1 + 0.6 * s.boil);
    bubbles.forEach(function (b, n) { var q = (t * (1 + 2 * s.boil) + hash(n)) % 1, on = s.boil > 0 && hash(n + 3) < s.boil; b.material.opacity = on ? 0.7 * Math.sin(q * Math.PI) : 0; b.position.set((hash(n + 7) - 0.5) * (0.04 + 0.16 * s.boil), 0.012 + q * (0.02 + 0.06 * s.boil), (hash(n + 9) - 0.5) * (0.04 + 0.16 * s.boil)); b.scale.setScalar(0.006 + 0.02 * s.boil * hash(n + 2)); });
    // gas ring, knob
    gas.forEach(function (g, n) { g.material.opacity = s.gas * (0.7 + 0.3 * Math.sin(t * 20 + n)); });
    knobs[3].rotation.y = -1.6 * s.knob;
    // fire on the pan
    var fp = panG.position, fsz = s.fs * s.fire;
    flames.forEach(function (fl, n) { var a = n / flames.length * Math.PI * 2 + t * 0.5, rr = 0.02 + 0.08 * hash(n), h = (0.07 + 0.06 * hash(n + 4)) * fsz * (0.8 + 0.3 * Math.sin(t * 9 + n * 2)); fl.material.opacity = s.fire > 0 ? 0.6 : 0; fl.position.set(fp.x + Math.cos(a) * rr, fp.y + 0.03 + h * 0.45, fp.z + Math.sin(a) * rr); fl.scale.set(h * 0.55, h, 1); });
    // fireball: sprites flying up from the pan to the ceiling
    var bk = s.ball; balls.forEach(function (b, n) { var q = clamp(bk * 1.3 - hash(n) * 0.3), up = q * (1.3 + 0.3 * hash(n + 1)), spread = 0.1 + 0.6 * q * hash(n + 2); b.material.opacity = bk > 0 ? 0.55 * (1 - 0.5 * clamp(bk - 0.8) * 5 / 1) * (q > 0 ? 1 : 0) : 0;
      var a = hash(n + 5) * Math.PI * 2; b.position.set(fp.x + Math.cos(a) * spread, Math.min(2.5, fp.y + 0.05 + up), fp.z + Math.sin(a) * spread * 0.7); var sc = 0.06 + 0.45 * q * (0.6 + 0.4 * hash(n + 6)); b.scale.set(sc, sc * 1.3, 1); });
    fireL.position.set(fp.x, fp.y + 0.25 + bk * 0.8, fp.z + 0.1); fireL.intensity = 1.6 * s.fire * s.fs * (0.85 + 0.15 * Math.sin(t * 13)) + 9 * Math.sin(Math.PI * clamp(bk)) + 2 * s.curtain;
    // steam and smoke
    steamS.forEach(function (st, n) { var q = (t * 0.35 + hash(n)) % 1, sp = s.steam; st.material.opacity = sp > 0 ? 0.55 * Math.sin(q * Math.PI) * clamp(sp * 2) : 0; st.position.set(fp.x + (hash(n + 1) - 0.5) * 0.5 * sp, fp.y + 0.05 + q * (0.2 + 1.0 * sp), fp.z + (hash(n + 2) - 0.5) * 0.4 * sp); var sc = 0.05 + 0.4 * sp * (0.3 + q); st.scale.set(sc, sc, 1); });
    smokeS.forEach(function (sm, n) { var q = (t * 0.25 + hash(n + 10)) % 1; sm.material.opacity = s.smoke * 0.45 * Math.sin(q * Math.PI); sm.position.set(fp.x + (hash(n) - 0.5) * 0.12 + 0.05 * Math.sin(t + n), fp.y + 0.05 + q * 0.8, fp.z + (hash(n + 3) - 0.5) * 0.1); var sc = 0.06 + 0.25 * q; sm.scale.set(sc, sc, 1); });
    // the water glass: next to the pan (1, tipping over it) or on the counter (2)
    glassG.visible = s.glass > 0; if (s.glass === 1) { glassG.position.set(fp.x + 0.16 - 0.02 * s.glassTilt, fp.y + 0.12 + 0.03 * s.glassTilt, fp.z + 0.05); glassG.rotation.z = 1.9 * s.glassTilt; water.scale.y = 1 - 0.8 * clamp(s.pour * 2 + (s.glassTilt > 0.95 ? 1 : 0)); } else if (s.glass === 2) { glassG.position.set(0.55, 0.92, -0.95); glassG.rotation.z = 0; water.scale.y = 1; }
    pourG.visible = s.pour > 0; if (s.pour > 0) { pourG.position.copy(glassG.position).add(new T3.Vector3(-0.05, 0.08, 0)); pour.scale.set(1, s.pour, 1); }
    // the steam volume next to the glass: from a glass of water to 425 litres
    volG.visible = s.box > 0; if (s.box > 0) { var e = lerp(0.07, 0.75, s.box); volG.scale.set(e, e, e); volG.position.set(0.55 - e / 2 + 0.04, 0.92 + e / 2, -0.95 - e / 2 + 0.04); }
    // the lid: on the pan (0..1 sliding in), or beside it on the counter (-1)
    lidG.visible = s.lid !== 0; if (s.lid > 0) { lidG.position.set(fp.x + 0.35 * (1 - s.lid), fp.y + 0.03 + 0.12 * (1 - s.lid), fp.z + 0.2 * (1 - s.lid)); lidG.rotation.x = -0.6 * (1 - s.lid); } else if (s.lid < 0) { lidG.position.set(0.45, 0.905, -1.05); lidG.rotation.x = 0; }
    // oxygen molecules bouncing off the lid
    o2.forEach(function (o, n) { o.visible = s.o2 > 0; var a = n / o2.length * Math.PI * 2 + t * 0.4, rr = 0.2 + 0.03 * Math.sin(t * 3 + n); o.position.set(fp.x + Math.cos(a) * rr, fp.y + 0.12 + 0.05 * Math.sin(t * 2 + n), fp.z + Math.sin(a) * rr * 0.7); o.rotation.set(t + n, t * 1.3, 0); });
    // soda box and its powder; flour bag and its flash
    sodaBox.visible = s.soda > 0; sodaBox.position.set(fp.x + 0.12, fp.y + 0.22, fp.z + 0.02); sodaBox.rotation.z = 1.9 * s.soda;
    soda.forEach(function (p, n) { var q = (t * 0.9 + hash(n)) % 1; p.material.opacity = s.soda > 0 ? 0.8 : 0; p.position.set(fp.x + 0.06 + (hash(n + 1) - 0.5) * 0.08, fp.y + 0.2 - q * 0.17, fp.z + (hash(n + 2) - 0.5) * 0.08); p.scale.setScalar(0.012); });
    flourBag.visible = s.flour > 0; flourBag.position.set(fp.x + 0.12, fp.y + 0.24, fp.z + 0.02); flourBag.rotation.z = 1.9 * s.flour;
    // dripping burning oil while the pan is carried
    drips.forEach(function (dp, n) { var q = (t * 0.8 + hash(n)) % 1; dp.material.opacity = s.carry > 0.05 ? 0.9 : 0; dp.position.set(fp.x + 0.13 - 0.3 * q * hash(n + 3), fp.y - q * fp.y, fp.z - 0.3 * q * hash(n + 4)); dp.scale.set(0.03, 0.05, 1); });
    // the kitchen door closing
    doorG.rotation.y = -Math.PI / 2 * (1 - s.door) - 0.05;
    // flames on the curtain and the cabinet
    cfl.forEach(function (c, n) { var on = s.curtain > hash(n) * 0.8; c.material.opacity = on ? 0.6 : 0; var cx = n < 9 ? -0.98 + (hash(n + 2) - 0.5) * 0.35 : 0.6 + (hash(n + 2) - 0.5) * 0.4, cy = n < 9 ? 1.4 + hash(n + 3) * 0.3 : 1.78, h = 0.16 + 0.1 * Math.sin(t * 8 + n); c.position.set(cx, cy + h * 0.4, n < 9 ? -1.48 : -1.22); c.scale.set(h * 0.6, h, 1); });
    curtain.material.color.set(s.curtain > 0.6 ? "#7a6448" : "#c9b28a");
    r.render(scene, cam);
    // ── HUD
    head.style.display = s.card ? "none" : "block";
    if (i !== curLine) { var c = CAPS[i]; cap.innerHTML = c.w.map(function (w, n) { return '<span class="' + (c.k[n] || '') + '">' + w + '</span>'; }).join(" "); srcEl.textContent = SRC[s.src] || ""; srcEl.style.display = s.src ? "block" : "none"; curLine = i; }
    var sp2 = cap.children, nw = sp2.length, shown = clamp(u / Math.max(0.6, d * 0.8)) * nw; for (var w = 0; w < nw; w++) sp2[w].style.opacity = clamp(shown - w + 1).toFixed(2);
    cap.style.display = s.card ? "none" : "block";
    badge.style.display = s.badge ? "block" : "none"; badge.innerHTML = s.badge;
    var html = "", svg = ""; s.chips.forEach(function (ch) { if (ch.k <= 0) return; var v = vec(ch.p).project(cam), x = (v.x + 1) / 2 * 360, y = (1 - v.y) / 2 * 640, cx = x + ch.dx, cy = y + ch.dy;
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
    apply(S[i](u, d), t, i, u, d);
  };
  renderAt(0.5);
})();
