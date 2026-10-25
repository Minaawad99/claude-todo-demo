/* @ds-bundle: {"format":4,"namespace":"TebEzay","components":[{"name":"SceneFrame"},{"name":"Caption"},{"name":"Callout"},{"name":"Inset"},{"name":"Counter"},{"name":"BrandMark"},{"name":"CategoryTag"},{"name":"Legend"},{"name":"AskBox"},{"name":"VideoCard"}]} */
(function () {
  "use strict";

  // Beat lengths in ms. Mirror the --tz-* custom properties in bundle.css.
  var T = { fast: 200, base: 400, slow: 800, word: 110, gap: 120, count: 1400, ring: 1300 };

  var SVGNS = "http://www.w3.org/2000/svg";
  var timers = new WeakMap();

  function reduced() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  // Wrap each word of a line in .tz-w so it can type on. Child elements
  // (keywords, emphasis) stay whole and count as one word.
  function splitWords(el) {
    if (el.dataset.tzSplit) return el.querySelectorAll(":scope > .tz-w");
    var nodes = Array.prototype.slice.call(el.childNodes);
    nodes.forEach(function (n) {
      if (n.nodeType === 3) {
        var parts = n.textContent.split(/(\s+)/);
        var frag = document.createDocumentFragment();
        parts.forEach(function (p) {
          if (!p) return;
          if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(p)); return; }
          var s = document.createElement("span");
          s.className = "tz-w";
          s.textContent = p;
          frag.appendChild(s);
        });
        el.replaceChild(frag, n);
      } else if (n.nodeType === 1) {
        n.classList.add("tz-w");
      }
    });
    el.dataset.tzSplit = "1";
    return el.querySelectorAll(":scope > .tz-w");
  }

  function prepDraw(el) {
    el.querySelectorAll("path, line, polyline, circle, rect, ellipse").forEach(function (s) {
      s.setAttribute("pathLength", "100");
    });
  }

  function countUp(el, ms) {
    var to = parseFloat(el.dataset.to || el.textContent) || 0;
    var from = parseFloat(el.dataset.from || "0");
    var dec = (String(el.dataset.to || "").split(".")[1] || "").length;
    var t0 = performance.now();
    function step(now) {
      var k = Math.min(1, (now - t0) / ms);
      var e = 1 - Math.pow(1 - k, 3); // ease-out cubic, like the video's litre counter
      el.textContent = (from + (to - from) * e).toFixed(dec);
      if (k < 1) requestAnimationFrame(step);
    }
    el.textContent = from.toFixed(dec);
    requestAnimationFrame(step);
  }

  // Duration a verb occupies on the timeline.
  function length(el) {
    var v = el.dataset.tz;
    if (el.dataset.tzDur) return +el.dataset.tzDur;
    if (v === "type") return splitWords(el).length * T.word + T.fast;
    if (v === "count") return T.count;
    if (v === "ring") return T.ring;
    if (v === "draw" || v === "xray") return T.slow;
    if (v === "callout") return T.fast + T.base + T.fast;
    if (v === "underline" || v === "key") return T.base;
    return T.base;
  }

  function fire(el) {
    var v = el.dataset.tz;
    if (v === "type") {
      var words = splitWords(el);
      el.classList.add("tz-on");
      words.forEach(function (w, i) {
        schedule(el, function () {
          w.classList.add("tz-on", "tz-fresh");
          requestAnimationFrame(function () {
            requestAnimationFrame(function () { w.classList.remove("tz-fresh"); });
          });
        }, i * T.word);
      });
      return;
    }
    if (v === "count") countUp(el, T.count);
    el.classList.add("tz-on");
  }

  function schedule(owner, fn, ms) {
    var list = timers.get(owner) || [];
    list.push(setTimeout(fn, ms));
    timers.set(owner, list);
  }

  function stop(root) {
    (timers.get(root) || []).forEach(clearTimeout);
    timers.delete(root);
    root.querySelectorAll("[data-tz]").forEach(function (el) {
      (timers.get(el) || []).forEach(clearTimeout);
      timers.delete(el);
    });
  }

  /**
   * Play every [data-tz] element under root in document order.
   * Each starts when the previous one ends (+ gap), unless it has
   * data-tz-with="prev" (start together) or data-tz-at="<ms>" (absolute).
   * data-tz-delay adds extra wait before that beat.
   * Returns the total length in ms.
   */
  function play(root, opts) {
    root = root || document;
    opts = opts || {};
    var host = root === document ? document.documentElement : root;
    var els = Array.prototype.slice.call(host.querySelectorAll("[data-tz]"));
    stop(host);
    if (reduced() && !opts.force) {
      host.classList.remove("tz-armed");
      return 0;
    }
    els.forEach(function (el) {
      el.classList.remove("tz-on");
      if (el.dataset.tz === "draw") prepDraw(el);
      if (el.dataset.tz === "type") splitWords(el).forEach(function (w) { w.classList.remove("tz-on"); });
      if (el.dataset.tz === "count" && el.dataset.to) el.textContent = el.dataset.from || "0";
    });
    host.classList.add("tz-armed");
    void host.offsetWidth; // commit start states before any beat fires

    var cursor = opts.delay || 0, prevStart = 0, end = 0;
    els.forEach(function (el) {
      var start;
      if (el.dataset.tzAt) start = +el.dataset.tzAt;
      else if (el.dataset.tzWith === "prev") start = prevStart;
      else start = cursor;
      start += +(el.dataset.tzDelay || 0);
      var len = length(el);
      schedule(host, function () { fire(el); }, start);
      prevStart = start;
      cursor = Math.max(cursor, start + len + T.gap);
      end = Math.max(end, start + len);
    });
    return end;
  }

  // Inject the three drawing patterns once per document: hatch, dots, lines.
  function patterns(doc) {
    doc = doc || document;
    if (doc.getElementById("tz-patterns")) return;
    var svg = doc.createElementNS(SVGNS, "svg");
    svg.id = "tz-patterns";
    svg.setAttribute("width", "0");
    svg.setAttribute("height", "0");
    svg.setAttribute("aria-hidden", "true");
    svg.style.position = "absolute";
    svg.innerHTML =
      '<defs>' +
      '<pattern id="tz-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">' +
      '<line x1="0" y1="0" x2="0" y2="6" class="tz-pat-stroke"/></pattern>' +
      '<pattern id="tz-dots" width="7" height="7" patternUnits="userSpaceOnUse">' +
      '<circle cx="3.5" cy="3.5" r="1.1" class="tz-pat-dot"/></pattern>' +
      '<pattern id="tz-lines" width="6" height="5" patternUnits="userSpaceOnUse">' +
      '<line x1="0" y1="2.5" x2="6" y2="2.5" class="tz-pat-stroke"/></pattern>' +
      '</defs>';
    (doc.body || doc.documentElement).prepend(svg);
  }

  // Play a scene when it scrolls into view, once.
  function onView(root, opts) {
    if (!("IntersectionObserver" in window)) return play(root, opts);
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { io.unobserve(e.target); play(e.target, opts); }
      });
    }, { threshold: 0.4 });
    io.observe(root);
  }

  window.TebEzay = {
    timing: T,
    play: play,
    stop: stop,
    onView: onView,
    patterns: patterns,
    splitWords: splitWords,
    countUp: countUp
  };
})();
