/* «إيه الحكاية؟» — «الرسم الهندسي» page engine (shared by every episode; loaded after the episode's scenes.js).
   Reads TIMING (../timing.js), DATA (from build.py: caption chunks, hook words, phase lines) and SCENE (from scenes.js:
   panel(), and optionally intro(), bumper(), outro()). Exposes renderAt(t) and VIDEO_END for render.js / tools/frame.js.
   Phases (from the reference videos):
     intro card   lines 0 … promise-1   the hook builds word by word with the voice, the card frame draws itself in
     bumper       the promise line      «إيه الحكاية؟ هشرحهالك في دقيقة.»: a ring fills orange round the subject, like a stopwatch
     panel        … summary-1           the diagram panel + one caption chunk at a time (≈1.2–2 s each)
     summary card summary … end         question, numbered diagram, legend, big number, 3 points, «معلومة زيادة»
     ask box      cta line … end        «قولولنا… عايزين تعرفوا حكاية ___؟» with a blinking caret, under the points */
(function () {
  var LN = TIMING.lines, D = window.DATA, S = window.SCENE || {};
  function clamp(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function ease(x) { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
  function $(id) { return document.getElementById(id); }
  function st(i) { return i >= LN.length ? TIMING.duration + 5 : LN[i].start; }
  var P = D.promise, SUM = D.summary, CTA = D.cta, introEnd = P >= 0 ? st(P) : st(D.introLines), mainStart = P >= 0 ? st(P + 1) : introEnd, XF = 0.4;
  var main = $("main"), intro = $("intro"), bumper = $("bumper"), outro = $("outro"), cap = $("cap"), hook = $("hook"), ask = $("ask");
  if (!D.watermark) $("wm").style.display = "none";

  // caption chunks with absolute times
  var CH = [];
  D.caps.forEach(function (chunks, li) { if (li < D.introLines || li === P || li >= SUM) return; var l = LN[li];
    chunks.forEach(function (c) { CH.push({ t: l.start + (l.end - l.start) * c.f, h: c.h }); }); });

  // the double card frame + crop marks, drawn in over 0.5 s
  function chrome(svg, k) {
    function seg(d, w, kk) { return '<path d="' + d + '" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="' + (1 - clamp(kk)).toFixed(4) + '" fill="none" stroke="#2a2016" stroke-width="' + w + '"/>'; }
    var c = "M6 16 V6 H16 M344 6 H354 V16 M354 624 V634 H344 M16 634 H6 V624";
    svg.innerHTML = seg("M14 14 H346 V626 H14 Z", 1.1, k * 1.3) + seg("M18.5 18.5 H341.5 V621.5 H18.5 Z", .5, k * 1.3 - .3) + '<path d="' + c + '" fill="none" stroke="#6f6556" stroke-width=".7" opacity="' + clamp(k * 2 - 1).toFixed(2) + '"/>';
  }
  function show(el, op) { el.style.display = op > 0.001 ? "block" : "none"; el.style.opacity = op.toFixed(3); }

  // hook: the words of the current hook line appear one by one, timed by their place in the line
  var hookCur = -1;
  function renderHook(t) {
    var li = 0; while (li < D.introLines - 1 && st(li + 1) <= t) li++;
    var l = LN[li], words = D.hook[li] || [];
    if (li !== hookCur) { hook.innerHTML = words.map(function (w) { return '<span class="' + w.c + '">' + w.w + '</span>'; }).join(" "); hookCur = li; }
    var spans = hook.children;
    for (var i = 0; i < spans.length; i++) { var wt = l.start + (l.end - l.start) * words[i].f, a = t < wt ? 0 : 0.35 + 0.65 * ease((t - wt) / 0.22); spans[i].style.opacity = a.toFixed(3); }
    var nx = li + 1 < D.introLines ? st(li + 1) : 1e9; hook.style.opacity = (1 - ease((t - (nx - 0.15)) / 0.15)).toFixed(3);
    return li;
  }

  function bumperArt(t) {
    var l = LN[P], k = clamp((t - l.start) / Math.max(0.6, l.end - l.start)), R = 70, cx = 90, cy = 112, circ = 2 * Math.PI * R;
    var icon = S.bumper ? S.bumper(t - l.start, t) : "";
    $("bumperArt").innerHTML = '<clipPath id="bclip"><circle cx="' + cx + '" cy="' + cy + '" r="' + (R - 3) + '"/></clipPath><g clip-path="url(#bclip)">' + icon + '</g>' +
      '<rect x="80" y="18" width="20" height="7" fill="#2a2016"/><rect x="86" y="25" width="8" height="9" fill="#2a2016"/>' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="' + R + '" fill="none" stroke="#d6cbb2" stroke-width="2.2"/>' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="' + R + '" fill="none" stroke="#bd552f" stroke-width="2.6" stroke-dasharray="' + (circ * k).toFixed(1) + ' ' + circ.toFixed(1) + '" transform="rotate(-90 ' + cx + ' ' + cy + ')"/>' +
      // the stopwatch hand sweeps round with the ring
      '<path d="M' + cx + ' ' + cy + ' L' + (cx + Math.sin(k * 6.2832) * (R - 8)).toFixed(1) + ' ' + (cy - Math.cos(k * 6.2832) * (R - 8)).toFixed(1) + '" stroke="#bd552f" stroke-width="2.4" stroke-linecap="round"/><circle cx="' + cx + '" cy="' + cy + '" r="3.5" fill="#bd552f"/>';
  }

  var capCur = -1;
  function renderCaption(t) {
    var i = -1; while (i < CH.length - 1 && CH[i + 1].t <= t) i++;
    if (i < 0) { cap.innerHTML = ""; capCur = -1; return; }
    if (i !== capCur) { cap.innerHTML = CH[i].h; capCur = i; }
    var nx = i + 1 < CH.length ? CH[i + 1].t : st(SUM), a = ease((t - CH[i].t) / 0.15), out = t > nx - 0.12 ? 0.45 : 1;
    cap.style.opacity = (a * out).toFixed(3);
  }

  var outroEls = ["q", "art", "leg", "stat", "pts"].map(function (c) { return outro.querySelector("." + c); });
  window.VIDEO_END = TIMING.duration;
  window.renderAt = function (t) {
    var tSum = st(SUM), tCta = st(CTA);
    // intro card
    var iOp = t < introEnd ? 1 : 1 - clamp((t - introEnd) / XF);   // linear: an eased fade parks at both ends
    show(intro, iOp);
    if (iOp > 0) { chrome($("introChrome"), ease(t / 0.5)); $("introArt").style.transform = "translate(" + (6 * Math.sin(t * 2.3)).toFixed(2) + "px," + (5 * Math.cos(t * 1.9)).toFixed(2) + "px) scale(" + (1.03 + 0.03 * Math.sin(t * 1.5)).toFixed(4) + ")"; var li = renderHook(t); if (S.intro) $("introArt").innerHTML = S.intro($("introArt"), t, li) || $("introArt").innerHTML; }
    // bumper
    var bOp = P < 0 ? 0 : t < introEnd ? 0 : t < mainStart ? 1 : 1 - ease((t - mainStart) / XF);
    show(bumper, bOp); if (bOp > 0) { bumperArt(t); $("bumperArt").style.transform = "translate(" + (6 * Math.sin(t * 2.6)).toFixed(2) + "px," + (5 * Math.cos(t * 2.1)).toFixed(2) + "px) scale(" + (0.8 + 0.2 * Math.min(1, (t - introEnd) / 0.5) + 0.12 * (t - introEnd)).toFixed(4) + ")"; }
    // panel + captions
    var mOp = t < mainStart ? 0 : 1;
    show(main, mOp);
    if (mOp > 0 && t < tSum + XF) { S.panel($("panelA"), $("panelB"), t); renderCaption(t); }
    // summary card + ask box
    var oOp = t < tSum ? 0 : ease((t - tSum) / XF);
    show(outro, oOp);
    if (oOp > 0) {
      var u = t - tSum; chrome($("outroChrome"), 1);
      outro.style.transform = "translate(" + (3 * Math.sin(u * 2.2)).toFixed(2) + "px," + (2.5 * Math.cos(u * 1.8)).toFixed(2) + "px) scale(" + (1 + 0.015 * u).toFixed(4) + ")";   // the camera never parks, even on the end cards
      outroEls.forEach(function (el, k) { if (el) el.style.opacity = ease((u - 0.15 * k) / 0.35).toFixed(3); });
      if (S.outro && $("outroArt")) $("outroArt").innerHTML = S.outro($("outroArt"), u, t) || $("outroArt").innerHTML;
      var aOp = CTA > SUM && t >= tCta ? ease((t - tCta) / 0.35) : 0;
      ask.style.display = aOp > 0 ? "block" : "none"; ask.style.opacity = aOp.toFixed(3);
      // the ask box sits under the recap points, so both stay on screen
      $("caret").style.opacity = Math.floor(t * 2.2) % 2 ? "0" : "1";
    }
  };
  renderAt(Math.min(30, TIMING.duration / 2));
})();
