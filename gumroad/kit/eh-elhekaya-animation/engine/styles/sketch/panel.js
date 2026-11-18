// ── المشاهد والكاميرا (ستايل السكتش: اللوحة 640×800) ────────
// shot(line, cam, draw): مشهد لكل سطر. أول سطر بيظهر عليه "كارت البداية" وآخر سطر "كارت الملخص"، فمشاهد shot من السطر 1 لقبل الأخير.
// intro(function (t) {...}): الرسمة اللي في كارت البداية (مقاسها 580×320). outro(function (u, t) {...}): رسمة كارت الملخص (580×300).
var SH = [], INTRO = null, OUTRO = null;
function shot(line, cam, draw) { SH.push({ line: line, a: L(line), cam: cam, draw: draw }); SH.sort(function (p, q) { return p.a - q.a; }); }
function intro(fn) { INTRO = fn; }
function outro(fn) { OUTRO = fn; }
function at(t) { var i = 0; while (i < SH.length - 1 && SH[i + 1].a <= t) i++; return i; }
function camPush(x, y, z0, z1) { return function (u, d) { return [x, y, lerp(z0 || 1, z1 || 1.1, clamp(u / d))]; }; }
function camPan(x0, x1, y, z) { return function (u, d) { var k = ease(u / d); return [lerp(x0, x1, k), y == null ? 400 : y, z || 1.05]; }; }
function camMove(a, b) { return function (u, d) { var k = ease(u / d); return [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)]; }; }

window.__panel = function (svg, t) {
  CLIPN = 0;
  if (!SH.length) { svg.innerHTML = paper(); return 0; }
  var i = at(t), sh = SH[i], next = i + 1 < SH.length ? SH[i + 1].a : L(LN.length), u = Math.max(0, t - sh.a), d = Math.max(0.5, next - sh.a);
  var c = sh.cam(u, d), cx = c[0] + 10 * Math.sin(t * 1.1), cy = c[1] + 8 * Math.cos(t * 1.1), z = c[2] * (1 + 0.02 * Math.sin(t * 0.9));   // الكاميرا عمرها ما بتقف
  svg.innerHTML = '<g transform="translate(320 400) scale(' + z.toFixed(4) + ') translate(' + f(-cx) + ' ' + f(-cy) + ')">' + sh.draw(u, d, t) + '</g><rect width="640" height="800" filter="url(#paperN)"/>';
  return i;
};
window.__intro = function (svg, t) {
  CLIPN = 0;
  svg.innerHTML = INTRO ? INTRO(t) : dark() + '<g transform="translate(290 160)">' + ring(0, 0, 70, t, ease(t / 1.2)) + T("؟", 0, 30, 90, ORANGE, 900) + '</g>';
};
window.__outro = function (svg, u, t) {
  CLIPN = 0;
  if (svg && OUTRO) svg.innerHTML = OUTRO(u, t);
};
