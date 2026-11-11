/* «أوعى تاخد الموبايل الحمام» — isometric, full screen. An Egyptian bathroom drawn as a cut-open isometric room
   (two walls and the floor) at real measurements: 1 px = 1 cm before the camera (toilet seat 42 cm, cistern 80 cm,
   door 85 × 210 cm, sink 85 cm, a 175 cm man). P(x, y, z): x along the right wall, y along the left wall, z up, in cm.
   The man (side profile at real proportions), the phone, the germs and the anatomy come from ../cartoon/shots.js. */
(function () {
  var LN = window.TIMING.lines;
  function L(i) { return i >= LN.length ? window.TIMING.duration : LN[i].start; }
  function E(i) { return i >= LN.length ? window.TIMING.duration : LN[i].end; }
  function clamp(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function ease(x) { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
  function lerp(a, b, k) { return a + (b - a) * k; }
  function pop(u) { if (u <= 0) return 0; if (u < 0.18) return 1.18 * ease(u / 0.18); if (u < 0.32) return lerp(1.18, 1, (u - 0.18) / 0.14); return 1; }
  function after(t, t0, d) { return clamp((t - t0) / (d || 0.6)); }
  function hash(i) { var x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
  function f(n) { return (+n).toFixed(1); }
  function rad(a) { return a * Math.PI / 180; }
  var INK = "#1c1c1c", CM = 1.0, FLOOR = 0;
  var SKIN = "#d29a6e", SKIN2 = "#b67d55", SHIRT = "#3a78b8", SHIRT2 = "#2c5f94", PANTS = "#4a4f5a", PANTS2 = "#3a3e47", HAIR = "#2a1d14";
  function limb(x1, y1, x2, y2, w, col, edge) { return '<path d="M' + f(x1) + ' ' + f(y1) + ' L' + f(x2) + ' ' + f(y2) + '" stroke="' + (edge || INK) + '" stroke-width="' + f(w + 2.4) + '" stroke-linecap="round"/><path d="M' + f(x1) + ' ' + f(y1) + ' L' + f(x2) + ' ' + f(y2) + '" stroke="' + col + '" stroke-width="' + f(w) + '" stroke-linecap="round"/>'; }
  function seg(p, len, ang) { return [p[0] + Math.sin(rad(ang)) * len, p[1] + Math.cos(rad(ang)) * len]; }
