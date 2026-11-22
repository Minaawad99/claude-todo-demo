  // the "link in bio" pill on the bio line, the chip on the opening lines, the real-footage cards
  window.__chip = function (t) { var i = 0; while (i < LN.length - 1 && LN[i + 1].start - .05 <= t) i++; return (i >= 2 && i <= 8) ? .9 : 0; };
  window.__foot = function (t) {
    var i = at(t), sh = SH[i], o = sh.o; if (!o.foot) return null; var u = t - sh.a, n = FOOT[o.foot], idx = o.sync ? Math.min(n - 1, Math.max(0, Math.floor((u - .25) * 6))) : Math.floor(u * 6) % n, k = o.sync ? clamp(u / .25) : clamp((u - .4) / .5), w = o.fw || 268;
    return { key: o.foot + (idx + 1), x: (360 - w) / 2, y: o.fy || 104, w: w, rot: o.rot == null ? -2 : o.rot, op: k, cap: o.cap || "فيديو حقيقي · نشرة أخبار CBS" };
  };
  function drawShot(sh, t, next) { var u = t - sh.a, d = Math.max(.6, next - sh.a), c = sh.cam(u, d), cx = c[0] + 9 * Math.sin(t * 1.1) + 3 * Math.sin(t * 2.3), cy = c[1] + 7 * Math.cos(t * .9), z = c[2] * (1 + .02 * Math.sin(t * .8)); return '<g transform="translate(180 320) rotate(' + f(.5 * Math.sin(t * .5)) + ') scale(' + z.toFixed(4) + ') translate(' + f(-cx) + ' ' + f(-cy) + ')">' + sh.draw(u, d, t) + '</g>'; }
  window.__panel = function (svg, t) {
    CLIPN = 0; SH.sort(function (p, q) { return p.a - q.a; });
    var i = at(t), sh = SH[i], next = i + 1 < SH.length ? SH[i + 1].a : L(LN.length), s = "", u = t - sh.a;
    if (i > 0 && u < .35) s += drawShot(SH[i - 1], t, sh.a) + '<g opacity="' + f2(ease(u / .35)) + '">' + drawShot(sh, t, next) + '</g>';
    else s += drawShot(sh, t, next);
    if (sh.o.pill) { var pk = eout(clamp(u / .4)); s += G('translate(180 ' + f(118 - (1 - pk) * 12) + ')', '<rect x="-96" y="-20" width="192" height="40" rx="20" fill="' + YEL + '" stroke="' + INK + '" stroke-width="2"/>' + txt("اللينك في البايو ↑", 0, 7, 17, INK, { wt: 900 }), pk); }
    var endK = clamp((t - window.TIMING.duration) / 1.2);
    svg.innerHTML = s + vignette() + '<rect width="360" height="640" filter="url(#grain)"/>' + (endK > 0 ? R(0, 0, 360, 640, "#000", { s: 0, op: endK * .3 }) : "");
    return i;
  };
})();
