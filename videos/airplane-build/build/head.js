/* «ابنيها بنفسك» — الطيارة. One airliner built part by part, seen from the side and a little from above (2.5D,
   one-point perspective as in the pool episode). Real A320 measurements, 8 px = 1 m: length 37.6 m, span 35.8 m,
   height 11.8 m, fuselage Ø 3.95 m, CFM56-size nacelles Ø 2 m. Shapes from the photos the user sent (side view and
   line drawing, top and bottom views, two engine cutaways, landing photos, cabin, nav-light diagram, sharklet).
   The camera stays back (the user's note): the whole plane is in frame most of the time, parts are drawn big. */
(function () {
  var LN = window.TIMING.lines;
  function L(i) { return i >= LN.length ? window.TIMING.duration : LN[i].start; }
  function E(i) { return i >= LN.length ? window.TIMING.duration : LN[i].end; }
  function W(i, w) { var ws = LN[i].text.split(" "), tot = ws.join("").length, acc = 0; for (var k = 0; k < ws.length; k++) { if (ws[k].indexOf(w) === 0) return L(i) + (E(i) - L(i)) * acc / tot; acc += ws[k].length; } throw new Error("word " + i + " " + w); }
  function clamp(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function ease(x) { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
  function lerp(a, b, k) { return a + (b - a) * k; }
  function pop(u) { if (u <= 0) return 0; if (u < 0.18) return 1.18 * ease(u / 0.18); if (u < 0.32) return lerp(1.18, 1, (u - 0.18) / 0.14); return 1; }
  function after(t, t0, d) { return clamp((t - t0) / (d || 0.6)); }
  function hash(i) { var x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
  function f(n) { return (+n).toFixed(1); }
  var INK = "#1d1b19", CREAM = "#fbefd2", YEL = "#ffd23f", RED = "#ff5a4e", GRN = "#6ee07a";
  var CAM = [180, 340, 1];
  function proj(c, x, y) { return [180 + (x - c[0]) * c[2], 320 + (y - c[1]) * c[2]]; }
