// ── المشاهد والكاميرا ────────────────────────────────────
// shot(line, cam, draw): مشهد واحد لكل سطر من السكريبت.
//   cam(u, d)  → [x, y, zoom]: مكان الكاميرا في عالم 640×360 (u = الثواني من بداية المشهد، d = طول المشهد)
//   draw(u, d, t) → نص SVG للمشهد (t = الوقت من أول الفيديو، استخدمه للحركة المستمرة)
var SH = [];
function shot(line, cam, draw) { SH.push({ line: line, a: L(line), cam: cam, draw: draw }); SH.sort(function (p, q) { return p.a - q.a; }); }
function at(t) { var i = 0; while (i < SH.length - 1 && SH[i + 1].a <= t) i++; return i; }
// كاميرات جاهزة
function camPush(x, y, z0, z1) { return function (u, d) { return [x, y, lerp(z0 || 1, z1 || 1.12, clamp(u / d))]; }; }          // زووم بطيء
function camPan(x0, x1, y, z) { return function (u, d) { var k = ease(u / d); return [lerp(x0, x1, k), y == null ? 180 : y, z || 1.05]; }; }   // حركة جنب
function camMove(a, b) { return function (u, d) { var k = ease(u / d); return [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)]; }; }  // من [x,y,z] لـ[x,y,z]

window.__panel = function (svg, t) {
  if (!SH.length) { svg.innerHTML = '<rect width="640" height="360" fill="#333"/>'; return 0; }
  var i = at(t), sh = SH[i], next = i + 1 < SH.length ? SH[i + 1].a : L(LN.length), u = Math.max(0, t - sh.a), d = Math.max(0.5, next - sh.a);
  var c = sh.cam(u, d), cx = c[0] + 16 * Math.sin(t * 1.2), cy = c[1] + 12 * Math.cos(t * 1.2), z = c[2] * (1 + 0.03 * Math.sin(t * 1.1));   // الكاميرا عمرها ما بتقف
  svg.innerHTML = '<g transform="translate(320 180) rotate(' + f(0.9 * Math.sin(t * 0.83)) + ') scale(' + z.toFixed(4) + ') translate(' + f(-cx) + ' ' + f(-cy) + ')">' + sh.draw(u, d, t) + '</g><rect width="640" height="360" filter="url(#grain)"/>';
  return i;
};
