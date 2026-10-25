/* طب إزاي؟ — video engine.
   Every moving part is a pure function of time: renderAt(t) draws frame t.
   Elements say when they move with data-l (script line), data-o (offset s), data-d (duration s).
   Requires window.TIMING = { duration, lines: [{start, end}, …] } (see align.py). */
(function () {
  var NS = "http://www.w3.org/2000/svg";
  var T = window.TIMING.lines.map(function (l) { return [l.start, l.end]; });
  var END = window.TIMING.duration;
  var clamp = function (x) { return x < 0 ? 0 : x > 1 ? 1 : x; };
  var ease = function (x) { x = clamp(x); return 1 - Math.pow(1 - x, 3); };
  var easeIO = function (x) { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
  var back = function (x) { x = clamp(x); var c = 1.6; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
  var lineStart = function (i) { return T[Math.min(i, T.length - 1)][0]; };
  var at = function (el) { return lineStart(+el.dataset.l) + (+el.dataset.o || 0); };
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };
  var SHAPES = "path,line,polyline,circle,rect,ellipse";
  var shapesOf = function (el) { return /^(path|line|polyline|circle|rect|ellipse)$/i.test(el.tagName) ? [el] : el.querySelectorAll(SHAPES); };

  // Scenes: visible from their first line until the next scene's first line.
  var scenes = $$(".scene").map(function (el) {
    var r = el.dataset.scene.split("-").map(Number);
    return { el: el, from: r[0], to: r[1] };
  });
  scenes.forEach(function (s, k) {
    s.t0 = k === 0 ? -1 : lineStart(s.from) - 0.3;
    s.t1 = k === scenes.length - 1 ? 1e9 : lineStart(scenes[k + 1].from) - 0.3;
  });

  // Captions inside a scene: each shows from its line start to the next caption's.
  var caps = $$(".cap");

  // Word-timed text: split into .w spans spread across the spoken line.
  var words = [];
  $$("[data-words]").forEach(function (el) {
    var li = +el.dataset.words, units = [];
    Array.prototype.slice.call(el.childNodes).forEach(function (n) {
      if (n.nodeType === 3) {
        var f = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(function (p) {
          if (!p) return;
          if (/^\s+$/.test(p)) { f.appendChild(document.createTextNode(p)); return; }
          var s = document.createElement("span"); s.className = "w"; s.textContent = p; f.appendChild(s); units.push(s);
        });
        el.replaceChild(f, n);
      } else if (n.nodeType === 1 && n.tagName !== "BR") { n.classList.add("w"); units.push(n); }
    });
    var a = T[li][0], span = Math.max(0.5, (T[li][1] - a) * 0.9);
    units.forEach(function (u, k) { words.push({ el: u, at: a + span * k / units.length }); });
  });

  var anim = $$("[data-v]").map(function (el) {
    if (el.dataset.v === "draw") Array.prototype.forEach.call(shapesOf(el), function (s) { s.setAttribute("pathLength", "100"); s.style.strokeDasharray = "100"; });
    return { el: el, v: el.dataset.v, at: at(el), dur: +el.dataset.d || 0.4 };
  });
  var underlines = $$("[data-ul]");
  var loops = $$("[data-loop]");

  // Particles riding along every <path> inside [data-particles].
  var streams = [];
  $$("[data-particles]").forEach(function (g) {
    var n = +g.dataset.n || 8, cls = g.dataset.dot || "pt", r = +g.dataset.r || 2.6, sp = +g.dataset.speed || 50;
    g.querySelectorAll("path").forEach(function (p, i) {
      var L = p.getTotalLength(), dots = [];
      for (var k = 0; k < n; k++) {
        var c = document.createElementNS(NS, "circle");
        c.setAttribute("r", r); c.setAttribute("class", (p.dataset.dot || cls));
        g.appendChild(c); dots.push(c);
      }
      streams.push({ p: p, L: L, dots: dots, sp: +p.dataset.speed || sp, phase: (i * 0.37) % 1 });
    });
  });

  var setT = function (el, s) { el.setAttribute("transform", s); };

  window.renderAt = function (t) {
    scenes.forEach(function (s) {
      var o = Math.min(ease((t - s.t0) / 0.35), 1 - ease((t - s.t1) / 0.35));
      s.el.style.opacity = o;
      s.el.style.visibility = o <= 0 ? "hidden" : "visible";
    });
    caps.forEach(function (c, k) {
      var a = lineStart(+c.dataset.cap) - 0.15, nx = caps[k + 1];
      var next = nx && nx.closest(".scene") === c.closest(".scene") ? lineStart(+nx.dataset.cap) - 0.2 : 1e9;
      c.style.opacity = Math.min(ease((t - a) / 0.2), 1 - ease((t - next) / 0.2));
    });
    words.forEach(function (w) {
      var p = t - w.at;
      w.el.style.opacity = ease(p / 0.12);
      w.el.style.setProperty("--mix", (ease((p - 0.08) / 0.4) * 100).toFixed(1) + "%");
    });
    underlines.forEach(function (u) {
      var li = +u.dataset.ul, p = ease((t - (T[li][0] + (T[li][1] - T[li][0]) * 0.55)) / 0.35);
      u.style.setProperty("--ul", (p * 100).toFixed(1) + "%");
    });
    anim.forEach(function (a) {
      var el = a.el, d = el.dataset, raw = (t - a.at) / a.dur, p = ease(raw);
      switch (a.v) {
        case "fade": el.style.opacity = p; break;
        case "out": el.style.opacity = 1 - p; break;
        case "pop": var b = back(raw); el.style.opacity = p; el.style.transform = "scale(" + (0.6 + 0.4 * b) + ")"; break;
        case "rise": el.style.opacity = p; el.style.transform = "translateY(" + (16 * (1 - p)) + "px)"; break;
        case "draw": Array.prototype.forEach.call(shapesOf(el), function (s) { s.style.strokeDashoffset = 100 * (1 - p); }); break;
        case "ring": el.style.strokeDashoffset = 100 * (1 - easeIO(raw)); break;
        case "grow":
          var f = d.from != null ? +d.from : 0, to = d.to != null ? +d.to : 1, g = d.ease === "io" ? easeIO(raw) : p;
          el.style.transform = "scale(" + (d.axis === "x" ? (f + (to - f) * g) + ",1" : d.axis === "y" ? "1," + (f + (to - f) * g) : (f + (to - f) * g)) + ")"; break;
        case "rot": setT(el, "rotate(" + (+d.from + (+d.to - +d.from) * easeIO(raw)) + " " + d.cx + " " + d.cy + ")"); break;
        case "move": var q = easeIO(raw); setT(el, "translate(" + (+d.dx * q) + " " + (+d.dy * q) + ")"); break;
        case "count": el.textContent = Math.round(+d.from + (+d.to - +d.from) * p); break;
      }
    });
    loops.forEach(function (el) {
      var d = el.dataset, sp = +d.speed, tt = d.until != null ? Math.min(t, lineStart(+d.until) + (+d.uo || 0)) : t;
      if (d.loop === "flow") el.style.strokeDashoffset = (-tt * sp).toFixed(1);
      else if (d.loop === "spin") el.style.transform = "rotate(" + (tt * sp) + "deg)";
      else if (d.loop === "scroll") setT(el, "translate(" + ((tt * sp) % +d.period) + " 0)");
      else if (d.loop === "drift") { var W = +d.w || 520; setT(el, "translate(" + ((((+d.x0 || 0) + tt * sp) % W + W) % W - 100) + " " + (d.y0 || 0) + ") scale(" + (d.s || 1) + ")"); }
      else if (d.loop === "bob") setT(el, "translate(0 " + (Math.sin(tt * (+d.f || 1.4)) * (+d.a || 3)).toFixed(2) + ")");
      else if (d.loop === "fanface") setT(el, "translate(" + d.cx + " " + d.cy + ") scale(" + d.sx + " 1) rotate(" + (tt * sp) + ")");
    });
    streams.forEach(function (s) {
      var gap = 1 / s.dots.length;
      s.dots.forEach(function (c, k) {
        var u = ((k * gap + s.phase + t * s.sp / s.L) % 1 + 1) % 1, pt = s.p.getPointAtLength(u * s.L);
        c.setAttribute("cx", pt.x.toFixed(1)); c.setAttribute("cy", pt.y.toFixed(1));
        c.style.opacity = Math.min(1, u * 8, (1 - u) * 8);
      });
    });
  };
  window.VIDEO_END = END;

  if (location.hash === "#play") {
    var audio = new Audio("voice.wav");
    document.addEventListener("click", function () { audio.currentTime = 0; audio.play(); }, { once: true });
    (function tick() { renderAt(audio.currentTime || 0); requestAnimationFrame(tick); })();
  } else {
    renderAt(+((location.hash.match(/t=([\d.]+)/) || [])[1] || END));
  }
})();
