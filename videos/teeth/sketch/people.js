/* «السنان الصفرا» — the person, from the shared kit (videos/_templates/people/person.js), dressed for home (sweater) in front
   of the bathroom mirror: we look at him from the mirror. */
var PEOPLE_MOUTH = [0, 0];
var PEOPLE = (function () {
  var BS = .62;   // brush scale against the person
  // standing at the sink, the brush in his fist and its head at his mouth. fl = floor y, s = person scale, t = time
  // o.face: face options; o.scrub 0..1 the side-to-side scrub (hard brushing); o.cup: a glass at his mouth instead of the brush
  function brusher(x, fl, s, t, o) {
    o = o || {}; var y = fl - 210 * s, b = (o.scrub || .15) * Math.sin(t * (o.scrub ? 14 : 5)) * 10 * s;
    var base = { x: x, y: y, s: s, legs: "stand", outfit: "home", breath: (Math.sin(t * 1.7) + 1) / 2, head: { tilt: 2 * Math.sin(t * .9) },
      face: Object.assign({ eyes: (t * 1000) % 3400 < 120 ? .05 : 1, brows: "neutral", mouth: "grin", look: [0, 0] }, o.face || {}) };
    var h = PERSON.front(base).joints.head, mx = h[0], my = h[1] + 17 * s;
    var hand = [mx - 112 * s * BS / .62 * .62 + b, my + 6 * s];
    base.arms = [{ to: hand, bend: -1, hand: "fist", rot: 0, front: true }, { rel: [8, 120], hand: "relaxed", bend: 1 }];
    var P = PERSON.front(base), g = ""; PEOPLE_MOUTH = [mx, my];
    var brush = o.cup ? TH.cup(mx + b, my + 58 * s, s * .5, .5) : TH.brush(mx - 10 * s + 30 * s * BS * .55 + b * .3, my + 1 * s, 180, s * BS * .55, { handle: true }) + foam(mx, my, s, t);
    g += P.svg + brush;
    return g;
  }
  function foam(mx, my, s, t) { var g = ''; for (var i = 0; i < 5; i++) g += '<circle cx="' + (mx - 9 * s + i * 4.5 * s).toFixed(1) + '" cy="' + (my + (i % 2 ? 2 : -1) * s).toFixed(1) + '" r="' + (1.6 * s + .4 * s * Math.sin(t * 6 + i)).toFixed(1) + '" fill="#fbfdff" stroke="#9fb4bf" stroke-width=".6"/>'; return g; }
  return { brusher: brusher };
})();
