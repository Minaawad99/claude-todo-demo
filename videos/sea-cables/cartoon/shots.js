  // ── new pieces for this episode, drawn after the channel's reference photos: the shore-end cable (black with yellow bands) on
  // the seabed, the cable cut open (black jacket, twisted steel wires, copper tube, white insulation, coloured fibres glowing),
  // a cable ship (blue hull, red antifouling, white bridge, the big cable drum under the stern gantry, the cable paying out with
  // yellow floats), a repeater (copper body, black ridged ends), the white burial plough on skids, the beach landing with
  // orange buoys and workers in hi-vis vests, the Red Sea map with its bundle of coloured cables ──
  var INK = "#1c1c1c", RED = "#d8352a", YEL = "#f2c230", BLUE = "#2f7fd8", CY = "#7fd3ff", FIB = ["#ff5a5a", "#ffb03a", "#f2e23a", "#5ad86a", "#3ab0ff", "#a06aff", "#ff6ad8", "#ffffff"];
  function graphPaper(t) { var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#f4efe4"/>', o = (t * 36) % 40, d = "";
    for (var x = -400; x < 1060; x += 40) d += "M" + f(x + o) + " -300 V660 "; for (var y = -300; y < 680; y += 40) d += "M-400 " + f(y + o * 0.6) + " H1040 ";
    return s + '<path d="' + d + '" stroke="#d9cdb3" stroke-width="2"/>'; }
  function qmark(x, y, t, sz, col) { return '<text x="' + f(x) + '" y="' + f(y + Math.sin(t * 4 + x) * 4) + '" text-anchor="middle" style="font:800 ' + sz + 'px Noto Sans Arabic;fill:' + (col || YEL) + ';stroke:#1c1c1c;stroke-width:2;paint-order:stroke">؟</text>'; }
  // underwater: deep-blue gradient, light shafts drifting, marine snow, sandy bed with ripples, rocks, swaying weed, fish
  function sea(t, bed, o) {
    o = o || {}; bed = bed == null ? 280 : bed; var s = '<rect x="-400" y="-300" width="1440" height="960" fill="url(#gDeepSea)"/>';
    for (var r = 0; r < 6; r++) { var x = -100 + r * 150 + 40 * Math.sin(t * 0.3 + r); s += '<path d="M' + f(x) + ' -40 L' + f(x + 60) + ' -40 L' + f(x + 140) + ' ' + bed + ' L' + f(x + 30) + ' ' + bed + ' Z" fill="#bfe8ff" opacity="' + f(0.05 + 0.04 * Math.sin(t * 0.8 + r * 1.7)) + '"/>'; }
    for (var p = 0; p < 50; p++) { var u = (t * 0.04 + hash(p)) % 1; s += '<circle cx="' + f(-100 + hash(p + 3) * 840 + 10 * Math.sin(t + p)) + '" cy="' + f(lerp(-30, bed, u)) + '" r="' + f(0.8 + hash(p) * 1.8) + '" fill="#e9f6ff" opacity="' + f(0.25 + 0.3 * hash(p + 1)) + '"/>'; }
    if (!o.nofish) for (var k = 0; k < 7; k++) { var fx = ((t * (18 + k * 3) + hash(k) * 900) % 900) - 150, fy = 70 + hash(k + 2) * 140 + 8 * Math.sin(t * 2 + k); s += '<g transform="translate(' + f(fx) + ' ' + f(fy) + ') scale(' + f(0.7 + hash(k) * 0.6) + ')"><path d="M0 0 C6 -6 18 -6 24 0 C18 6 6 6 0 0 Z M24 0 L32 -6 L32 6 Z" fill="#9fc4d8" opacity=".75"/></g>'; }
    s += '<path d="M-400 ' + bed + ' Q-100 ' + (bed - 12) + ' 200 ' + (bed + 4) + ' T800 ' + (bed - 6) + ' T1100 ' + bed + ' V700 H-400 Z" fill="url(#gSeabed)"/>';
    for (var w = 0; w < 8; w++) s += '<path d="M' + (-200 + w * 120) + ' ' + (bed + 18 + (w % 3) * 10) + ' q30 -6 60 0 t60 0" stroke="#a8946a" stroke-width="2" fill="none" opacity=".6"/>';
    for (var rk = 0; rk < 6; rk++) s += '<ellipse cx="' + (-120 + rk * 150 + hash(rk) * 40) + '" cy="' + (bed + 6) + '" rx="' + (14 + hash(rk + 4) * 18) + '" ry="' + (8 + hash(rk + 2) * 8) + '" fill="url(#rock)" stroke="#3a3a36" stroke-width="1.4"/>';
    for (var sw = 0; sw < 9; sw++) { var bx = -150 + sw * 95 + hash(sw) * 30, h = 30 + hash(sw + 7) * 40, b = 8 * Math.sin(t * 1.4 + sw); s += '<path d="M' + f(bx) + ' ' + (bed + 4) + ' q' + f(b) + ' ' + f(-h / 2) + ' ' + f(b * 1.6) + ' ' + f(-h) + '" stroke="#4f8f5a" stroke-width="4" fill="none" stroke-linecap="round" opacity=".85"/><path d="M' + f(bx + 6) + ' ' + (bed + 4) + ' q' + f(-b) + ' ' + f(-h / 3) + ' ' + f(-b * 1.2) + ' ' + f(-h * 0.7) + '" stroke="#6aa84f" stroke-width="3" fill="none" stroke-linecap="round" opacity=".8"/>'; }
    return s; }
  // a cable along a gentle curve: thick black with yellow bands (shore-end style); w = thickness; pulses = light running along it
  function cablePts(x0, x1, y0, y1, sag) { var pts = []; for (var i = 0; i <= 40; i++) { var k = i / 40; pts.push([lerp(x0, x1, k), lerp(y0, y1, k) + Math.sin(Math.PI * k) * (sag || 0)]); } return pts; }
  function cable(pts, t, o) {
    o = o || {}; var w = o.w || 16, d = "M" + pts.map(function (p) { return f(p[0]) + " " + f(p[1]); }).join(" L"), s = '';
    s += '<path d="' + d + '" stroke="#000" stroke-width="' + (w + 6) + '" fill="none" stroke-linecap="round" opacity=".2" transform="translate(4 6)"/>';
    s += '<path d="' + d + '" stroke="#121417" stroke-width="' + w + '" fill="none" stroke-linecap="round"/>';
    if (o.bands !== false) s += '<path d="' + d + '" stroke="' + (o.band || YEL) + '" stroke-width="' + (w - 2) + '" fill="none" stroke-dasharray="' + f(w * 0.45) + ' ' + f(w * 2.2) + '" stroke-dashoffset="' + f(o.roll ? -t * 30 : 0) + '"/>';
    s += '<path d="' + d + '" stroke="#fff" stroke-width="' + f(w * 0.18) + '" fill="none" stroke-linecap="round" opacity=".25" transform="translate(0 ' + f(-w * 0.25) + ')"/>';
    if (o.pulses) for (var k = 0; k < (o.n || 5); k++) { var u = (t * (o.sp || 0.35) + k / (o.n || 5)) % 1, i = Math.floor(u * (pts.length - 1)), p = pts[i]; s += '<circle cx="' + f(p[0]) + '" cy="' + f(p[1]) + '" r="' + f(w * 0.9) + '" fill="url(#gPulse)" opacity="' + f(o.pulses) + '"/>'; }
    return s; }
  // the cable cut across: jacket, steel wires, copper tube, insulation, gel, fibres (glowing)
  function section(x, y, r, t, o) {
    o = o || {}; var s = '<g transform="translate(' + f(x) + ' ' + f(y) + ')"><circle r="' + r + '" fill="#121417" stroke="' + INK + '" stroke-width="2"/>';
    var ra = r * 0.8; s += '<circle r="' + f(ra) + '" fill="#3a3d42"/>'; for (var k = 0; k < 22; k++) { var a = k / 22 * 6.283 + (o.spin ? t * 0.2 : 0); s += '<circle cx="' + f(Math.cos(a) * ra * 0.86) + '" cy="' + f(Math.sin(a) * ra * 0.86) + '" r="' + f(r * 0.1) + '" fill="url(#gCableArm)" stroke="#121417" stroke-width="1"/>'; }
    s += '<circle r="' + f(r * 0.6) + '" fill="url(#gCopper)" stroke="#5a2e10" stroke-width="1.4"/><circle r="' + f(r * 0.5) + '" fill="#e9eef2" stroke="#9aa2ac" stroke-width="1"/><circle r="' + f(r * 0.33) + '" fill="#f6f0c0" opacity=".9"/>';
    for (var fb = 0; fb < 14; fb++) { var a2 = fb * 2.39, rr = r * 0.26 * Math.sqrt((fb + 0.5) / 14), fx = Math.cos(a2) * rr, fy = Math.sin(a2) * rr, glow = 0.5 + 0.5 * Math.sin(t * 6 + fb); s += '<circle cx="' + f(fx) + '" cy="' + f(fy) + '" r="' + f(r * 0.05) + '" fill="' + FIB[fb % 8] + '" stroke="#fff" stroke-width=".6"/><circle cx="' + f(fx) + '" cy="' + f(fy) + '" r="' + f(r * 0.09) + '" fill="url(#gPulse)" opacity="' + f(glow * (o.glow == null ? 1 : o.glow)) + '"/>'; }
    return s + '</g>'; }
  // the cable cut open from the side, like the reference: stepped layers, fibres fanning out at the end
  function sideCut(x, y, L, r, t, o) {
    o = o || {}; var s = '<g transform="translate(' + f(x) + ' ' + f(y) + ')">';
    s += '<rect x="0" y="' + (-r) + '" width="' + f(L * 0.45) + '" height="' + (2 * r) + '" fill="#121417" stroke="' + INK + '" stroke-width="2"/><ellipse cx="' + f(L * 0.45) + '" cy="0" rx="' + f(r * 0.28) + '" ry="' + r + '" fill="#2b2e33" stroke="' + INK + '" stroke-width="1.6"/>';
    var ar = r * 0.82, ax = L * 0.45; s += '<rect x="' + f(ax) + '" y="' + f(-ar) + '" width="' + f(L * 0.18) + '" height="' + f(2 * ar) + '" fill="#4a5058"/>'; for (var w = 0; w < 9; w++) s += '<path d="M' + f(ax + w * L * 0.02) + ' ' + f(-ar) + ' l' + f(L * 0.05) + ' ' + f(2 * ar) + '" stroke="#9aa2ac" stroke-width="' + f(r * 0.12) + '" opacity=".9"/><path d="M' + f(ax + w * L * 0.02) + ' ' + f(-ar) + ' l' + f(L * 0.05) + ' ' + f(2 * ar) + '" stroke="#121417" stroke-width="1" opacity=".6"/>';
    var cx = ax + L * 0.18, cr = r * 0.58; s += '<ellipse cx="' + f(cx) + '" cy="0" rx="' + f(r * 0.22) + '" ry="' + f(ar) + '" fill="#2b2e33"/><rect x="' + f(cx) + '" y="' + f(-cr) + '" width="' + f(L * 0.13) + '" height="' + f(2 * cr) + '" fill="url(#gCopper)" stroke="#5a2e10" stroke-width="1.2"/>';
    var ix = cx + L * 0.13, ir = r * 0.46; s += '<ellipse cx="' + f(ix) + '" cy="0" rx="' + f(r * 0.17) + '" ry="' + f(cr) + '" fill="#a8602a"/><rect x="' + f(ix) + '" y="' + f(-ir) + '" width="' + f(L * 0.08) + '" height="' + f(2 * ir) + '" fill="#e9eef2" stroke="#9aa2ac" stroke-width="1"/><ellipse cx="' + f(ix + L * 0.08) + '" cy="0" rx="' + f(r * 0.14) + '" ry="' + f(ir) + '" fill="#f6f0c0" stroke="#c9c4b8"/>';
    var fx0 = ix + L * 0.08; for (var k = 0; k < 16; k++) { var yy = (k / 15 - 0.5) * ir * 1.4, spread = (k / 15 - 0.5) * (o.fan == null ? 1 : o.fan) * r * 1.2, len = L * (0.12 + 0.06 * hash(k)); s += '<path d="M' + f(fx0) + ' ' + f(yy) + ' L' + f(fx0 + len) + ' ' + f(yy + spread) + '" stroke="' + FIB[k % 8] + '" stroke-width="' + f(r * 0.06) + '" stroke-linecap="round"/>'; if (o.glow) s += '<circle cx="' + f(fx0 + len) + '" cy="' + f(yy + spread) + '" r="' + f(r * 0.12) + '" fill="url(#gPulse)" opacity="' + f(0.6 + 0.4 * Math.sin(t * 7 + k)) + '"/>'; }
    return s + '</g>'; }
  // the cable ship: blue hull, red antifouling at the waterline, white superstructure aft of the bow, mast and radome,
  // the big cable drum (a dark coil) under a white gantry at the stern, yellow cranes; cable over the stern with yellow floats
  function ship(x, y, t, o) {
    o = o || {}; var s = '<g transform="translate(' + f(x) + ' ' + f(y + 2 * Math.sin(t * 1.2)) + ') rotate(' + f(0.6 * Math.sin(t * 0.9)) + ') scale(' + (o.s || 1) + ')">';
    s += '<path d="M-200 -6 L210 -6 L240 -40 L-200 -40 Z" fill="url(#gHullB)" stroke="' + INK + '" stroke-width="2.4"/><path d="M-200 -6 L210 -6 L216 -14 L-200 -14 Z" fill="#b83a2a"/><path d="M-200 -40 L240 -40" stroke="#fbfaf6" stroke-width="3"/>';
    s += '<rect x="60" y="-96" width="130" height="56" fill="url(#gHullW)" stroke="' + INK + '" stroke-width="2"/><rect x="90" y="-130" width="90" height="34" fill="url(#gHullW)" stroke="' + INK + '" stroke-width="2"/><rect x="110" y="-150" width="60" height="20" fill="url(#gHullW)" stroke="' + INK + '" stroke-width="2"/>';
    for (var w = 0; w < 7; w++) s += '<rect x="' + (70 + w * 17) + '" y="-84" width="10" height="7" fill="#2b4a6a"/>'; for (var w2 = 0; w2 < 5; w2++) s += '<rect x="' + (98 + w2 * 16) + '" y="-122" width="11" height="8" fill="#2b4a6a"/>';
    s += '<rect x="114" y="-146" width="52" height="8" fill="#1c2a3a"/><path d="M150 -150 V-200 M138 -186 H162 M142 -176 H158" stroke="' + INK + '" stroke-width="3"/><circle cx="125" cy="-162" r="10" fill="#fbfaf6" stroke="' + INK + '" stroke-width="2"/>';
    s += '<rect x="196" y="-58" width="18" height="18" fill="#e86a2a" stroke="' + INK + '" stroke-width="1.6"/>';
    s += '<g transform="translate(-110 -82)"><circle r="40" fill="#1c1e22" stroke="' + INK + '" stroke-width="3"/>'; for (var c = 0; c < 6; c++) s += '<circle r="' + (8 + c * 5.5) + '" fill="none" stroke="#3a3d42" stroke-width="2.2"/>'; s += '<path d="M0 0 L' + f(Math.cos(t * 1.5) * 36) + ' ' + f(Math.sin(t * 1.5) * 36) + '" stroke="' + YEL + '" stroke-width="2.4"/><circle r="6" fill="' + YEL + '" stroke="' + INK + '"/></g>';
    s += '<path d="M-170 -40 V-140 H-50 V-40 M-170 -140 L-110 -160 L-50 -140" stroke="#fbfaf6" stroke-width="9" fill="none"/><path d="M-170 -40 V-140 H-50 V-40 M-170 -140 L-110 -160 L-50 -140" stroke="' + INK + '" stroke-width="1.4" fill="none"/>';
    s += '<path d="M-20 -40 L-10 -110 L40 -128" stroke="' + YEL + '" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M40 -128 V-90" stroke="' + INK + '" stroke-width="1.4"/>';
    s += '<path d="M-200 -50 L-214 -50" stroke="' + INK + '" stroke-width="2"/>';
    if (o.lay) { var d = "M-200 -36"; for (var i = 1; i <= 10; i++) d += " L" + f(-200 - i * 22) + " " + f(-36 + i * i * 1.1 + Math.sin(t * 2 + i) * 2); s += '<path d="' + d + '" stroke="#121417" stroke-width="9" fill="none" stroke-linecap="round"/>'; for (var fl = 0; fl < 4; fl++) { var px = -230 - fl * 46, py = -36 + Math.pow((fl * 46 + 30) / 22, 2) * 1.1; if (py < 4) s += '<ellipse cx="' + f(px) + '" cy="' + f(Math.min(py, -2) + 2 * Math.sin(t * 2 + fl)) + '" rx="12" ry="7" fill="' + YEL + '" stroke="' + INK + '" stroke-width="1.6"/>'; } }
    return s + '</g>'; }
  function waterline(t, y, col) { var s = '<path d="M-400 ' + y + ' V700 H1040 V' + y + ' Z" fill="' + (col || "url(#gSea)") + '"/>'; for (var k = 0; k < 10; k++) { var x = ((t * 30 + k * 110) % 1100) - 300; s += '<path d="M' + f(x) + ' ' + (y + 8 + (k % 3) * 10) + ' q15 -5 30 0 t30 0" stroke="#fff" stroke-width="2" fill="none" opacity=".45"/>'; } return s; }
  function skyDay(t) { var s = '<rect x="-400" y="-300" width="1440" height="960" fill="url(#sky-day)"/>'; for (var c = 0; c < 4; c++) { var x = ((t * 6 + c * 260) % 1200) - 300; s += '<g transform="translate(' + f(x) + ' ' + (30 + c * 18) + ')"><ellipse rx="50" ry="14" fill="#fff" opacity=".85"/><ellipse cx="26" cy="-8" rx="30" ry="14" fill="#fff" opacity=".85"/></g>'; } return s; }
  function repeater(x, y, s, t, glow) {   // a copper body with black ridged bend limiters at each end
    var g = '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + s + ')"><path d="M-120 -7 L-60 -10 L-60 10 L-120 7 Z M60 -10 L120 -7 L120 7 L60 10 Z" fill="#121417"/>';
    for (var r = 0; r < 8; r++) g += '<path d="M' + (-60 + -r * 7) + ' -11 v22 M' + (60 + r * 7) + ' -11 v22" stroke="#3a3d42" stroke-width="3"/>';
    g += '<rect x="-60" y="-22" width="120" height="44" rx="20" fill="url(#gCopper)" stroke="#5a2e10" stroke-width="2"/><path d="M-50 -12 H50" stroke="#fff" stroke-width="3" opacity=".3"/><path d="M-30 -22 V22 M30 -22 V22" stroke="#7a3e14" stroke-width="1.4" opacity=".6"/>';
    if (glow) g += '<circle r="' + f(40 + 6 * Math.sin(t * 8)) + '" fill="url(#gPulse)" opacity="' + f(0.5 * glow) + '"/>';
    return g + '</g>'; }
  function worker(x, y, t, o) {   // a ball-head worker in a white hard hat and a hi-vis vest (or orange overalls)
    o = o || {}; var b = 3 * Math.sin(t * 3 + x); return '<g transform="translate(' + f(x) + ' ' + f(y + b) + ') scale(' + (o.s || 1) + ')"><path d="M-30 90 C-32 34 -20 20 0 20 C20 20 32 34 30 90 Z" fill="' + (o.orange ? "#e86a2a" : "#2b3a5a") + '" stroke="' + INK + '" stroke-width="2.4"/>' + (o.orange ? '' : '<path d="M-24 34 L-10 90 M24 34 L10 90" stroke="#d9f23a" stroke-width="14"/><path d="M-26 60 H26" stroke="#c9ced4" stroke-width="4"/>') + head(0, -6, 24, o.mood || "happy", t, o.look || 0) + '<path d="M-26 -16 C-26 -42 26 -42 26 -16 Z" fill="#fbfaf6" stroke="' + INK + '" stroke-width="2.2"/><path d="M-30 -16 H30" stroke="' + INK + '" stroke-width="3"/></g>'; }
  function phone(x, y, t, o) { o = o || {}; var s = '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(o.rot || 0) + ') scale(' + (o.s || 1) + ')"><rect x="-58" y="-112" width="116" height="224" rx="20" fill="url(#gPhone)" stroke="' + INK + '" stroke-width="2.6"/><rect x="-50" y="-102" width="100" height="204" rx="14" fill="#10161c"/>';
    s += '<rect x="-46" y="-60" width="92" height="64" fill="#2f6f9f"/><path d="M-46 4 L-20 -26 L0 -10 L20 -34 L46 -6 V4 Z" fill="#4f8f5a"/><circle cx="28" cy="-44" r="8" fill="#ffd27a"/>';
    if (o.play !== false) s += '<circle cx="0" cy="-28" r="16" fill="#000" opacity=".4"/><path d="M-5 -36 L9 -28 L-5 -20 Z" fill="#fff"/>';
    var pr = o.progress == null ? (t * 0.1) % 1 : o.progress; s += '<rect x="-46" y="10" width="92" height="4" rx="2" fill="#3a3f46"/><rect x="-46" y="10" width="' + f(92 * pr) + '" height="4" rx="2" fill="' + RED + '"/>';
    for (var l = 0; l < 4; l++) s += '<rect x="-46" y="' + (26 + l * 16) + '" width="' + (92 - l * 14) + '" height="8" rx="4" fill="#3a3f46"/>';
    return s + '<rect x="-16" y="-108" width="32" height="6" rx="3" fill="#0b0d10"/></g>'; }
  function globe(x, y, r, t, o) {   // a turning globe with soft continents; arcs of cable glowing between coasts
    o = o || {}; var s = '<g transform="translate(' + f(x) + ' ' + f(y) + ')"><circle r="' + r + '" fill="url(#gGlobe)" stroke="' + INK + '" stroke-width="2.4"/><clipPath id="glc"><circle r="' + r + '"/></clipPath><g clip-path="url(#glc)">';
    var rot = (t * 14) % 360; [[-80, -30, 60, 40], [-40, 40, 40, 50], [30, -40, 70, 34], [40, 20, 36, 50], [110, -10, 60, 40], [140, 40, 40, 26]].forEach(function (c) { var cx = ((c[0] + rot + 180) % 360 - 180) / 180 * r * 1.3; if (Math.abs(cx) < r + c[2]) s += '<ellipse cx="' + f(cx) + '" cy="' + f(c[1] * r / 120) + '" rx="' + f(c[2] * r / 120) + '" ry="' + f(c[3] * r / 120) + '" fill="#9fc79a" stroke="#4f7a4a" stroke-width="1.6" opacity=".95"/>'; });
    for (var m = -2; m <= 2; m++) s += '<ellipse cx="0" cy="0" rx="' + f(Math.abs(Math.cos((rot + m * 36) * Math.PI / 180)) * r) + '" ry="' + r + '" fill="none" stroke="#fff" stroke-width=".8" opacity=".25"/>';
    if (o.cables) for (var c2 = 0; c2 < (o.n || 8); c2++) { var a0 = hash(c2) * 6.28, a1 = a0 + 1 + hash(c2 + 4), p0 = [Math.cos(a0) * r * 0.7, Math.sin(a0) * r * 0.5], p1 = [Math.cos(a1) * r * 0.7, Math.sin(a1) * r * 0.5]; s += '<path d="M' + f(p0[0]) + ' ' + f(p0[1]) + ' Q0 ' + f((p0[1] + p1[1]) / 2 + 30) + ' ' + f(p1[0]) + ' ' + f(p1[1]) + '" stroke="' + FIB[c2 % 7] + '" stroke-width="2.6" fill="none" opacity=".9" stroke-dasharray="7 4" stroke-dashoffset="' + f(-t * 30) + '"/>'; }
    s += '</g><circle r="' + r + '" fill="none" stroke="#bfe8ff" stroke-width="6" opacity=".25"/><ellipse cx="' + f(-r * 0.35) + '" cy="' + f(-r * 0.4) + '" rx="' + f(r * 0.3) + '" ry="' + f(r * 0.18) + '" fill="#fff" opacity=".15"/>';
    return s + '</g>'; }
  function egypt(t, k) {   // Egypt between the Mediterranean and the Red Sea; the coloured cable bundle up the Red Sea, across to the Med
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#cfe1ec"/>';
    s += '<path d="M-400 100 L60 96 C120 70 200 66 260 80 L320 92 L340 70 L360 100 L380 96 L420 120 L440 180 L470 260 L520 340 L560 420 L600 520 L-400 520 Z" fill="#efe2c2" stroke="#b9a47a" stroke-width="2"/>';
    s += '<path d="M380 96 L420 120 L440 180 L470 260 L520 340 L560 420 L600 520 L700 520 L700 60 L560 40 L470 70 Z" fill="#e9dcc0" stroke="#b9a47a" stroke-width="2"/>';
    s += '<path d="M380 96 L392 180 L440 180 Z" fill="#cfe1ec"/>';
    s += '<path d="M180 110 C200 150 210 220 230 300" stroke="#4f8fc9" stroke-width="5" fill="none" opacity=".6"/>';
    var lines = 7, kk = clamp(k); for (var c = 0; c < lines; c++) { var off = (c - 3) * 5, d = "M" + (600 + off) + " 520 L" + (520 + off) + " 345 L" + (466 + off) + " 255 L" + (436 + off) + " 180 L" + (384 + off * 0.5) + " 120 L" + (330 + off * 0.3) + " 90 L" + (180 + off) + " 70 L" + (-300) + " " + (40 + off * 2); s += '<path d="' + d + '" stroke="' + FIB[c % 7] + '" stroke-width="3" fill="none" stroke-dasharray="2000" stroke-dashoffset="' + f(2000 * (1 - kk)) + '"/>'; }
    for (var p = 0; p < 6; p++) { var u = (t * 0.25 + p / 6) % 1, pts = [[600, 520], [520, 345], [466, 255], [436, 180], [384, 120], [330, 90], [180, 70], [-300, 40]], seg = u * 7, i = Math.floor(seg), fr = seg - i, a = pts[i], b = pts[i + 1]; s += '<circle cx="' + f(lerp(a[0], b[0], fr)) + '" cy="' + f(lerp(a[1], b[1], fr)) + '" r="7" fill="url(#gPulse)"/>'; }
    [[330, 92, "السويس"], [180, 72, "إسكندرية"], [520, 345, "البحر الأحمر"]].forEach(function (c) { s += '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="5" fill="#fff" stroke="' + INK + '" stroke-width="2"/><text x="' + c[0] + '" y="' + (c[1] - 10) + '" text-anchor="middle" style="font:800 13px Noto Sans Arabic;fill:#1c3a5a">' + c[2] + '</text>'; });
    return s + '<text x="120" y="250" text-anchor="middle" style="font:900 34px Noto Sans Arabic;fill:#b9a47a;opacity:.8">مصر</text><text x="-60" y="20" text-anchor="middle" style="font:800 16px Noto Sans Arabic;fill:#3a5a7a">أوروبا</text><text x="620" y="20" text-anchor="middle" style="font:800 16px Noto Sans Arabic;fill:#3a5a7a">آسيا</text>'; }
  function shark(x, y, t, s, bite) {
    var j = bite ? 6 * Math.max(0, Math.sin(t * 6)) : 2 * Math.sin(t * 3), g = '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + (s || 1) + ')"><path d="M-140 0 C-90 -40 40 -46 100 -14 C110 -8 116 -2 118 4 L100 8 C60 30 -60 30 -140 0 Z" fill="url(#gShark)" stroke="#3a4048" stroke-width="2"/>';
    g += '<path d="M-20 -36 L10 -80 L30 -34 Z" fill="#6a7480" stroke="#3a4048" stroke-width="2"/><path d="M-140 0 L-190 ' + f(-40 + 8 * Math.sin(t * 5)) + ' L-170 0 L-190 ' + f(36 + 8 * Math.sin(t * 5)) + ' Z" fill="#6a7480" stroke="#3a4048" stroke-width="2"/><path d="M10 14 L-10 50 L36 18 Z" fill="#5a6470" stroke="#3a4048" stroke-width="2"/>';
    g += '<path d="M60 ' + f(10 + j) + ' Q90 ' + f(20 + j) + ' 114 ' + f(8 + j) + '" fill="#fff" stroke="#3a4048" stroke-width="2"/><circle cx="74" cy="-12" r="4" fill="#111"/>' + [0, 1, 2, 3, 4].map(function (k) { return '<path d="M' + (40 - k * 8) + ' -8 q-3 8 0 16" stroke="#3a4048" stroke-width="1.6" fill="none"/>'; }).join("");
    return g + '</g>'; }
  function tower(x, y, t, s) { var g = '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + (s || 1) + ')"><path d="M-30 0 L-6 -170 L6 -170 L30 0 M-24 -40 L20 -80 M24 -40 L-20 -80 M-16 -100 L12 -130 M16 -100 L-12 -130" stroke="#9aa2ac" stroke-width="4" fill="none"/><rect x="-16" y="-190" width="10" height="30" fill="#e9ecef" stroke="' + INK + '"/><rect x="6" y="-190" width="10" height="30" fill="#e9ecef" stroke="' + INK + '"/>';
    for (var r = 1; r <= 3; r++) { var ph = (t * 0.8 + r / 3) % 1; g += '<path d="M24 -' + (180 + ph * 20) + ' a' + f(20 + ph * 50) + ' ' + f(20 + ph * 50) + ' 0 0 1 0 ' + f(30 + ph * 40) + '" stroke="' + CY + '" stroke-width="3" fill="none" opacity="' + f(1 - ph) + '"/>'; }
    return g + '</g>'; }
  function router(x, y, t) { var g = '<g transform="translate(' + f(x) + ' ' + f(y) + ')"><rect x="-44" y="-16" width="88" height="24" rx="6" fill="#fbfaf6" stroke="' + INK + '" stroke-width="2"/><path d="M-30 -16 V-50 M30 -16 V-50" stroke="' + INK + '" stroke-width="4" stroke-linecap="round"/>';
    for (var l = 0; l < 5; l++) g += '<circle cx="' + (-24 + l * 12) + '" cy="-4" r="2.6" fill="' + (Math.sin(t * 9 + l) > 0 ? "#5bbf6a" : "#2b4a30") + '"/>';
    for (var r = 1; r <= 3; r++) { var ph = (t * 0.9 + r / 3) % 1; g += '<path d="M' + f(-20 - ph * 30) + ' ' + f(-60 - ph * 20) + ' Q0 ' + f(-80 - ph * 40) + ' ' + f(20 + ph * 30) + ' ' + f(-60 - ph * 20) + '" stroke="' + CY + '" stroke-width="3" fill="none" opacity="' + f(1 - ph) + '"/>'; }
    return g + '</g>'; }

  var SH = [];
  function shot(line, cam, draw) { SH.push({ a: L(line), cam: cam, draw: draw }); }
  function at(t) { var i = 0; while (i < SH.length - 1 && SH[i + 1].a <= t) i++; return i; }

  // 0 — you open a video shot in America and it plays in Egypt in under a second
  shot(0, function (u, d) { return [320, 180, lerp(1.0, 1.1, u / d)]; }, function (u, d, t) {
    var s = graphPaper(t) + globe(470, 180, 130, t, { cables: true, n: 4 }) + phone(170, 190, t, { s: 1.15, rot: -6, progress: clamp(u / (d - 0.4)) });
    var k = clamp(u / 1.2); s += '<path d="M400 120 Q470 40 540 150" stroke="' + YEL + '" stroke-width="4" fill="none" stroke-dasharray="300" stroke-dashoffset="' + f(300 * (1 - k)) + '"/>';
    return s + tag("أمريكا", 400, 100, u, 0.4, -3, 15) + tag("مصر", 560, 170, u, 0.9, 3, 15) + tag("أقل من ثانية!", 170, 330, u, 1.8, -2, 16);
  });
  // 1 — how did it cross the ocean? by satellite?
  shot(1, function (u, d) { return [320, lerp(170, 200, u / d), lerp(1.0, 1.15, u / d)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#0b1730"/>'; for (var i = 0; i < 60; i++) s += '<circle cx="' + f(-100 + hash(i) * 840) + '" cy="' + f(-40 + hash(i + 3) * 420) + '" r="' + f(0.8 + hash(i + 1) * 1.6) + '" fill="#fff" opacity="' + f(0.4 + 0.5 * Math.abs(Math.sin(t * 2 + i))) + '"/>';
    s += globe(320, 380, 220, t);
    s += (function () { var sx = 60 + (u * 110) % 520, g2 = ''; for (var r = 1; r <= 3; r++) { var ph = (t * 1.2 + r / 3) % 1; g2 += '<path d="M' + f(sx - 30 - ph * 40) + ' ' + f(110 + ph * 50) + ' Q' + f(sx) + ' ' + f(130 + ph * 70) + ' ' + f(sx + 30 + ph * 40) + ' ' + f(110 + ph * 50) + '" stroke="' + YEL + '" stroke-width="3" fill="none" opacity="' + f(1 - ph) + '"/>'; } return g2; })() + '<g transform="translate(' + f(60 + (u * 110) % 520) + ' 90) rotate(' + f(20 * Math.sin(t * 2)) + ')"><rect x="-14" y="-12" width="28" height="24" fill="#c9a04e" stroke="' + INK + '" stroke-width="2"/><rect x="-74" y="-8" width="56" height="16" fill="#2a4a8a" stroke="' + INK + '" stroke-width="1.6"/><rect x="18" y="-8" width="56" height="16" fill="#2a4a8a" stroke="' + INK + '" stroke-width="1.6"/></g>';
    return s + qmark(320, 50, t, 50) + tag("قمر صناعي؟", 140, 150, u, 0.5, -3, 16);
  });
  // 2 — and if the road it came by were cut, what would happen?
  shot(2, function (u, d) { return [320, 200, lerp(1.0, 1.12, u / d)]; }, function (u, d, t) {
    var s = sea(t, 270) + cable(cablePts(-100, 300, 250, 262, 6), t, { w: 18 }) + cable(cablePts(340, 760, 262, 250, 6), t, { w: 18 });
    for (var k = 0; k < 6; k++) { var a = t * 7 + k; s += '<path d="M320 256 l' + f(Math.cos(a) * 20) + ' ' + f(Math.sin(a) * 14) + '" stroke="#bfe8ff" stroke-width="2.4"/>'; }
    return s + '<circle cx="320" cy="256" r="' + f(16 + 6 * Math.sin(t * 9)) + '" fill="url(#gPulse)" opacity=".7"/>' + qmark(320, 120, t, 54) + tag("اتقطع؟", 470, 120, u, 0.8, 3, 18, "#ffb08a");
  });
  // 3 — brand
  shot(3, function (u, d) { return [320, 190, lerp(1.0, 1.12, u / d)]; }, function (u, d, t) {
    return sea(t, 270) + cable(cablePts(-200, 840, 240, 262, 10), t, { w: 20, pulses: 1 }) + tag("إيه الحكاية؟", 320, 110, u, 0.1, -3, 26);
  });
  // 4 — over 90% of internet traffic between countries goes through undersea cables
  shot(4, function (u, d) { return [320, 180, lerp(1.0, 1.08, u / d)]; }, function (u, d, t) {
    var k = clamp(u / 2), s = graphPaper(t) + globe(230, 180, 140, t, { cables: true, n: 10 });
    s += '<g transform="translate(500 180)"><circle r="80" fill="#e9e4d8" stroke="' + INK + '" stroke-width="2.4"/><path d="M0 0 L0 -80 A80 80 0 ' + (k > 0.5 ? 1 : 0) + ' 1 ' + f(Math.sin(k * 0.95 * 6.283) * 80) + ' ' + f(-Math.cos(k * 0.95 * 6.283) * 80) + ' Z" fill="' + BLUE + '" stroke="' + INK + '" stroke-width="2"/><text y="10" text-anchor="middle" style="font:900 30px Noto Sans Arabic;fill:#fff;paint-order:stroke;stroke:' + INK + ';stroke-width:3">+٩٠٪</text></g>';
    return s + tag("كابلات تحت البحر", 500, 310, u, 1.6, 3, 16);
  });
  // 5 — about 570 cables in service around the world
  shot(5, function (u, d) { return [320, 180, lerp(1.0, 1.12, u / d)]; }, function (u, d, t) {
    var n = Math.round(lerp(0, 570, clamp(u / (d - 0.4)))), s = '<rect x="-400" y="-300" width="1440" height="960" fill="#0b1730"/>' + globe(320, 170, 140, t, { cables: true, n: 6 + Math.floor(n / 40) });
    s += '<g transform="translate(320 322)"><rect x="-90" y="-22" width="180" height="42" rx="10" fill="' + INK + '" stroke="' + YEL + '" stroke-width="3"/><text y="8" text-anchor="middle" style="font:800 20px Noto Sans Arabic;fill:' + YEL + '">' + n + ' كابل</text></g>';
    return s;
  });
  // 6 — the cable is only as thick as a garden hose, and thousands of kilometres long
  shot(6, function (u, d) { return [lerp(260, 380, u / d), 210, lerp(1.0, 1.15, u / d)]; }, function (u, d, t) {
    var s = sea(t, 270) + cable(cablePts(-300, 940, 250, 266, 8), t, { w: 22 }) + cable(cablePts(-300, 940, 278, 290, 6), t, { w: 22 });
    s += '<path d="M220 140 C260 100 340 100 380 140 C410 170 420 200 400 220" stroke="#3fae5a" stroke-width="16" fill="none" stroke-linecap="round"/><path d="M220 140 C260 100 340 100 380 140" stroke="#7ad86a" stroke-width="4" fill="none" opacity=".6"/>';
    return s + tag("قد خرطوم الجنينة", 300, 80, u, 0.6, -2, 16) + tag("آلاف الكيلومترات", 520, 330, u, 2.0, 3, 15);
  });
  // 7 — inside, glass strands thinner than a hair: optical fibres (the cable cut open, fibres fanning out)
  shot(7, function (u, d) { return [lerp(300, 380, ease(clamp(u / d))), 180, lerp(1.0, 1.35, ease(clamp(u / d)))]; }, function (u, d, t) {
    var s = sea(t, 300, { nofish: true }) + sideCut(40, 190, 560, 70, t, { glow: 1, fan: 1 + 0.15 * Math.sin(t * 2) });
    s += '<path d="M470 90 C500 120 540 110 600 150" stroke="#3a2a1a" stroke-width="5" fill="none"/>';
    return s + tag("شعرة", 590, 120, u, 1.4, 3, 14) + tag("ألياف ضوئية", 470, 320, u, 0.8, 3, 17);
  });
  // 8 — pictures and video become pulses of light, flashing on and off billions of times a second
  shot(8, function (u, d) { return [320, 180, lerp(1.0, 1.06, u / d)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#06121e"/><rect x="-100" y="170" width="840" height="24" rx="12" fill="#cfe9f7" opacity=".25" stroke="#7fd3ff" stroke-width="2"/>';
    for (var b = 0; b < 16; b++) { var on = hash(b + 3) > 0.45, x = ((t * 220 + b * 48) % 800) - 80; if (on) s += '<rect x="' + f(x) + '" y="172" width="34" height="20" rx="8" fill="url(#gPulse)"/>'; s += '<text x="' + f(x + 17) + '" y="150" text-anchor="middle" style="font:800 14px Noto Serif;fill:' + (on ? "#bfe8ff" : "#3a5a7a") + '">' + (on ? "1" : "0") + '</text>'; }
    s += phone(80, 260, t, { s: 0.45, play: false });
    return s + tag("نبضات نور", 470, 280, u, 0.6, 3, 18, "#bfe0ff");
  });
  // 9 — the light keeps bouncing off the walls of the strand, so it never leaks out
  shot(9, function (u, d) { return [320, 180, lerp(1.0, 1.08, u / d)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#06121e"/><rect x="-60" y="120" width="760" height="120" fill="#bfe8ff" opacity=".12" stroke="#7fd3ff" stroke-width="3"/><rect x="-60" y="150" width="760" height="60" fill="#bfe8ff" opacity=".1"/>';
    var dp = "M-60 180"; for (var x = -60, up = 1, i = 0; x < 700; x += 90, up = -up, i++) dp += " L" + (x + 90) + " " + (up > 0 ? 126 : 234); s += '<path d="' + dp + '" stroke="' + YEL + '" stroke-width="3" fill="none" opacity=".6"/>';
    var ph = (t * 0.25) % 1, px = -60 + ph * 760, seg = Math.floor((px + 60) / 90), fr = ((px + 60) % 90) / 90, y0 = seg === 0 ? 180 : (seg % 2 ? 126 : 234), y1 = seg % 2 ? 234 : 126; if (seg === 0) y1 = 126;
    s += '<circle cx="' + f(px) + '" cy="' + f(lerp(y0, y1, fr)) + '" r="16" fill="url(#gPulse)"/>';
    for (var k = 0; k < 8; k++) { var bx = 30 + k * 90; s += '<circle cx="' + bx + '" cy="' + (k % 2 ? 234 : 126) + '" r="' + f(6 + 4 * Math.sin(t * 6 + k)) + '" fill="#fff" opacity=".35"/>'; }
    return s + tag("بيرتد", 320, 300, u, 0.6, -2, 18, "#bfe0ff");
  });
  // 10 — light fades with distance; every 60–100 km a repeater boosts it
  shot(10, function (u, d) { return [lerp(260, 380, u / d), 200, lerp(1.0, 1.1, u / d)]; }, function (u, d, t) {
    var s = sea(t, 280) + cable(cablePts(-300, 240, 262, 266, 4), t, { w: 18, bands: false }) + cable(cablePts(400, 940, 266, 262, 4), t, { w: 18, bands: false }) + repeater(320, 264, 0.9, t, 1);
    for (var k = 0; k < 4; k++) { var ph = (t * 0.5 + k / 4) % 1, x = lerp(-200, 900, ph), fade = x < 320 ? 1 - (x + 200) / 600 : 1 - (x - 320) / 700; s += '<circle cx="' + f(x) + '" cy="264" r="' + f(14 * Math.max(0.2, fade)) + '" fill="url(#gPulse)" opacity="' + f(Math.max(0.15, fade)) + '"/>'; }
    return s + tag("ريبيتر", 320, 200, u, 0.8, -2, 18) + tag("كل ٦٠ - ١٠٠ كم", 500, 120, u, 1.8, 3, 15);
  });
  // 11 — the repeaters take power from the shore, down the same cable
  shot(11, function (u, d) { return [320, 190, lerp(1.0, 1.08, u / d)]; }, function (u, d, t) {
    var s = skyDay(t) + '<rect x="-400" y="150" width="1440" height="600" fill="url(#gDeepSea)"/><path d="M-400 150 L120 150 L200 210 L200 700 L-400 700 Z" fill="#e6cfa0" stroke="#b9a47a" stroke-width="2"/>';
    s += '<rect x="-60" y="70" width="140" height="80" fill="#e9e4d8" stroke="' + INK + '" stroke-width="2.4"/><rect x="-40" y="90" width="30" height="24" fill="#2b4a6a"/><rect x="20" y="90" width="30" height="24" fill="#2b4a6a"/><path d="M-60 70 L10 46 L80 70" fill="#c15636" stroke="' + INK + '" stroke-width="2"/>';
    s += '<path d="M70 150 L170 200 L230 280 L700 300" stroke="#121417" stroke-width="12" fill="none"/>' + repeater(480, 292, 0.5, t, 1);
    for (var k = 0; k < 8; k++) { var ph = (t * 0.6 + k / 8) % 1, pts = [[70, 150], [170, 200], [230, 280], [700, 300]], seg = ph * 3, i = Math.floor(seg), fr = seg - i, a = pts[i], b = pts[i + 1]; s += '<circle cx="' + f(lerp(a[0], b[0], fr)) + '" cy="' + f(lerp(a[1], b[1], fr)) + '" r="5" fill="' + YEL + '" stroke="' + INK + '" stroke-width="1"/>'; }
    return s + tag("كهربا من الشط", 10, 30, u, 0.5, -3, 15) + tag("نفس الكابل", 450, 230, u, 1.6, 3, 15);
  });
  // 12 — around the fibres, layers: copper for power, plastic, and near the shore steel wire armour
  shot(12, function (u, d) { return [320, 180, lerp(1.0, 1.08, u / d)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#0f2a3a"/>' + section(220, 180, 130, t, { spin: true });
    var L2 = [["بلاستيك", 122, "#9aa2ac"], ["سلك حديد", 96, "#c9ced4"], ["نحاس", 72, "#e09a5a"], ["عازل", 58, "#e9eef2"], ["ألياف", 22, "#bfe8ff"]];
    L2.forEach(function (l, i) { var k = clamp((u - 0.3 - i * 0.5) / 0.4); if (k <= 0) return; var a = -0.9 + i * 0.42, x = 220 + Math.cos(a) * l[1], y = 180 + Math.sin(a) * l[1]; s += '<path d="M' + f(x) + ' ' + f(y) + ' L470 ' + (60 + i * 58) + ' H500" stroke="' + l[2] + '" stroke-width="2" fill="none" opacity="' + f(k) + '"/><circle cx="' + f(x) + '" cy="' + f(y) + '" r="4" fill="' + l[2] + '"/><text x="510" y="' + (66 + i * 58) + '" style="font:800 17px Noto Sans Arabic;fill:' + l[2] + ';opacity:' + f(k) + '">' + l[0] + '</text>'; });
    return s;
  });
  // 13 — the cable is laid from a special ship, moving slowly, paying it out onto the seabed
  shot(13, function (u, d) { return [lerp(360, 300, u / d), 170, lerp(1.0, 1.1, u / d)]; }, function (u, d, t) {
    var s = skyDay(t) + waterline(t, 200) + ship(420 + t * 2 % 1, 205, t, { s: 0.95, lay: true });
    s += '<path d="M-400 200 V700" stroke="none"/>';
    return s + tag("مركب كابلات", 470, 40, u, 0.5, 3, 17) + tag("بيفرده ببطء", 120, 300, u, 1.6, -3, 15);
  });
  // 14 — near the shore, an underwater plough buries the cable in the sand
  shot(14, function (u, d) { return [lerp(260, 360, u / d), 210, lerp(1.05, 1.2, u / d)]; }, function (u, d, t) {
    var px = 360 + 20 * Math.sin(t * 0.4), s = sea(t, 270) + '<path d="M-300 268 L' + f(px - 60) + ' 268" stroke="#7a6648" stroke-width="10" stroke-dasharray="10 8"/>';
    s += cable(cablePts(px + 70, 940, 240, 250, -6), t, { w: 14 }) + '<path d="M' + f(px + 60) + ' 230 L' + f(px + 200) + ' -40" stroke="#c9ced4" stroke-width="3"/>';
    s += '<g transform="translate(' + f(px) + ' 262)"><path d="M-90 4 H90 L100 -4 H-100 Z" fill="#c9ced4" stroke="' + INK + '" stroke-width="2"/><rect x="-80" y="-50" width="160" height="46" fill="none" stroke="#f4f2ec" stroke-width="9"/><rect x="-80" y="-50" width="160" height="46" fill="none" stroke="' + INK + '" stroke-width="1.4"/><path d="M-40 -50 L0 -86 L40 -50" fill="none" stroke="#f4f2ec" stroke-width="8"/><ellipse cx="-90" cy="-60" rx="22" ry="12" fill="#f4f2ec" stroke="' + INK + '" stroke-width="2"/><ellipse cx="90" cy="-60" rx="22" ry="12" fill="#f4f2ec" stroke="' + INK + '" stroke-width="2"/><path d="M-6 -4 L-14 20 L14 20 L6 -4 Z" fill="' + INK + '"/></g>';
    for (var k = 0; k < 10; k++) { var ph = (t * 0.8 + k / 10) % 1; s += '<circle cx="' + f(px - 20 - ph * 60) + '" cy="' + f(262 - ph * 40) + '" r="' + f(3 + ph * 6) + '" fill="#c9b48a" opacity="' + f(0.6 * (1 - ph)) + '"/>'; }
    return s + tag("محراث", 380, 120, u, 0.5, 3, 18) + tag("بيدفنه في الرمل", 120, 330, u, 1.4, -3, 15);
  });
  // 15 — at the shore the cable goes into a landing station, then onto the country's network (beach, orange buoys, workers)
  shot(15, function (u, d) { return [320, 190, lerp(1.0, 1.08, u / d)]; }, function (u, d, t) {
    var s = skyDay(t) + waterline(t, 140, "#3f9cc9") + ship(620, 140, t, { s: 0.35 }) + '<path d="M-400 220 Q100 190 700 230 V700 H-400 Z" fill="#e6cfa0"/>';
    for (var w = 0; w < 4; w++) { var x = ((t * 40 + w * 260) % 1100) - 300; s += '<path d="M' + f(x) + ' ' + (196 + w * 2) + ' q30 -8 60 0 t60 0" stroke="#fff" stroke-width="4" fill="none" opacity=".8"/>'; }
    s += '<path d="M640 150 Q400 190 120 250 L-60 300" stroke="#121417" stroke-width="8" fill="none"/>';
    [[560, 156, "#e86a2a"], [500, 166, YEL], [430, 178, "#e86a2a"], [360, 190, YEL]].forEach(function (b, i) { s += '<circle cx="' + b[0] + '" cy="' + f(b[1] + 3 * Math.sin(t * 2 + i)) + '" r="11" fill="' + b[2] + '" stroke="' + INK + '" stroke-width="1.6"/>'; });
    s += '<rect x="-120" y="210" width="130" height="80" fill="#e9e4d8" stroke="' + INK + '" stroke-width="2.4"/><rect x="-100" y="230" width="34" height="26" fill="#2b4a6a"/><text x="-55" y="282" text-anchor="middle" style="font:800 12px Noto Sans Arabic;fill:' + INK + '">محطة إنزال</text>';
    s += worker(200, 220, t, { s: 0.7 }) + worker(280, 210, t + 1, { s: 0.65, orange: true, look: -1 });
    return s + tag("الشط", 420, 300, u, 0.6, 3, 16);
  });
  // 16 — from there to the exchange, to the mobile tower or the router in your home
  shot(16, function (u, d) { return [320, 190, lerp(1.0, 1.06, u / d)]; }, function (u, d, t) {
    var s = graphPaper(t) + '<rect x="20" y="170" width="120" height="100" fill="#e9e4d8" stroke="' + INK + '" stroke-width="2.4"/><text x="80" y="250" text-anchor="middle" style="font:800 13px Noto Sans Arabic;fill:' + INK + '">سنترال</text>' + tower(320, 290, t, 0.9);
    s += '<rect x="460" y="160" width="160" height="120" fill="#f4ead8" stroke="' + INK + '" stroke-width="2.4"/><path d="M450 160 L540 100 L630 160" fill="#c15636" stroke="' + INK + '" stroke-width="2"/>' + router(540, 250, t);
    s += '<path d="M140 230 H300 M140 250 C300 250 380 260 470 250" stroke="#121417" stroke-width="5" fill="none" stroke-dasharray="10 6" stroke-dashoffset="' + f(-t * 40) + '"/>';
    return s + tag("برج الموبايل", 320, 70, u, 1.0, -2, 15) + tag("الراوتر", 540, 70, u, 1.8, 3, 15);
  });
  // 17 — Egypt is one of the most important places in this story, right between Europe and Asia
  shot(17, function (u, d) { return [320, 190, lerp(1.0, 1.1, u / d)]; }, function (u, d, t) {
    return egypt(t, u / 2.2);
  });
  // 18 — about 17% of the whole world's internet passes through us!
  shot(18, function (u, d) { return [380, 170, lerp(1.1, 1.2, u / d)]; }, function (u, d, t) {
    var k = clamp(u / 2), s = egypt(t, 1) + '<g transform="translate(150 200)"><circle r="70" fill="#fbfaf6" stroke="' + INK + '" stroke-width="2.4"/><path d="M0 0 L0 -70 A70 70 0 0 1 ' + f(Math.sin(k * 0.17 * 6.283) * 70) + ' ' + f(-Math.cos(k * 0.17 * 6.283) * 70) + ' Z" fill="' + RED + '" stroke="' + INK + '" stroke-width="2"/><text y="34" text-anchor="middle" style="font:900 26px Noto Sans Arabic;fill:' + INK + '">' + Math.round(17 * k) + '٪</text></g>';
    return s + tag("من نت العالم!", 150, 300, u, 1.6, -2, 16);
  });
  // 19 — a cable gets cut about 150 times a year, mostly by ship anchors
  shot(19, function (u, d) { return [320, 190, lerp(1.0, 1.1, u / d)]; }, function (u, d, t) {
    var k = clamp((u - 0.4) / 1.6), ax = lerp(80, 330, k), s = sea(t, 270) + cable(cablePts(-300, 320, 256, 262, 4), t, { w: 18 }) + cable(cablePts(330 + 30 * k, 940, 262 + 6 * k, 256, 4), t, { w: 18 });
    s += '<path d="M' + f(ax - 260) + ' -60 L' + f(ax) + ' ' + f(220) + '" stroke="#6a727c" stroke-width="5" stroke-dasharray="10 4"/><g transform="translate(' + f(ax) + ' 232) rotate(-20)"><path d="M0 -40 V30 M-30 20 Q0 50 30 20 M-34 12 L-30 22 L-22 16 M34 12 L30 22 L22 16 M-14 -30 H14" stroke="#4a5058" stroke-width="9" fill="none" stroke-linecap="round"/><circle cy="-46" r="7" fill="none" stroke="#4a5058" stroke-width="5"/></g>';
    var n = Math.round(lerp(0, 150, clamp(u / 2.6))); s += '<g transform="translate(520 60)"><rect x="-90" y="-22" width="180" height="42" rx="10" fill="' + INK + '" stroke="' + YEL + '" stroke-width="3"/><text y="8" text-anchor="middle" style="font:800 18px Noto Sans Arabic;fill:' + YEL + '">' + n + ' مرة في السنة</text></g>';
    return s + tag("مرساة!", 140, 120, u, 1.2, -3, 18, "#ffb08a");
  });
  // 20 — but the internet doesn't stop: the data goes round through another cable
  shot(20, function (u, d) { return [320, 180, lerp(1.0, 1.06, u / d)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#0f2a3a"/><circle cx="60" cy="180" r="30" fill="#2f6f9f" stroke="#7fd3ff" stroke-width="3"/><circle cx="580" cy="180" r="30" fill="#2f6f9f" stroke="#7fd3ff" stroke-width="3"/>';
    s += '<path d="M90 180 H280 M360 180 H550" stroke="#5a6068" stroke-width="10"/><path d="M290 160 l20 40 M310 160 l-20 40" stroke="' + RED + '" stroke-width="6"/><path d="M90 170 C200 40 440 40 550 170" stroke="#3fae5a" stroke-width="10" fill="none"/>';
    for (var k = 0; k < 6; k++) { var ph = (t * 0.5 + k / 6) % 1, x = lerp(90, 550, ph), y = 170 - Math.sin(Math.PI * ph) * 98; s += '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="10" fill="url(#gPulse)"/>'; }
    return s + tag("كابل تاني", 320, 30, u, 0.8, -2, 17, "#bfe0ff") + tag("مبيقفش!", 320, 310, u, 1.6, 2, 18);
  });
  // 21 — a repair ship goes out, grapples the cable up from the seabed and splices it on deck
  shot(21, function (u, d) { return [320, 170, lerp(1.0, 1.08, u / d)]; }, function (u, d, t) {
    var k = clamp(u / 2), s = skyDay(t) + waterline(t, 160) + ship(380, 165, t, { s: 0.8 });
    s += '<rect x="-400" y="250" width="1440" height="460" fill="#0f3f62" opacity=".6"/>';
    var gy = lerp(330, 150, k); s += '<path d="M190 120 L190 ' + f(gy) + '" stroke="#c9ced4" stroke-width="3"/><path d="M180 ' + f(gy) + ' q10 16 20 0 M176 ' + f(gy) + ' q14 -10 28 0" stroke="#4a5058" stroke-width="5" fill="none"/>';
    s += '<path d="M-300 ' + f(330 - 0 * k) + ' Q100 ' + f(330) + ' 190 ' + f(gy + 4) + '" stroke="#121417" stroke-width="8" fill="none"/>';
    if (k > 0.9) for (var sp = 0; sp < 8; sp++) { var a = t * 20 + sp; s += '<path d="M280 110 l' + f(Math.cos(a) * 14) + ' ' + f(Math.sin(a) * 14 - 6) + '" stroke="' + YEL + '" stroke-width="2.4"/>'; }
    return s + tag("مركب إصلاح", 470, 40, u, 0.4, 3, 16) + tag("بتلحمه", 280, 70, u, 2.2, -2, 15);
  });
  // 22 — even sharks were filmed biting cables, so they wrapped them in a Kevlar-like material
  shot(22, function (u, d) { return [320, 200, lerp(1.0, 1.12, u / d)]; }, function (u, d, t) {
    var k = clamp((u - 0.4) / 1.4), s = sea(t, 280, { nofish: true }) + cable(cablePts(-300, 940, 262, 268, 4), t, { w: 18, band: u > 2.6 ? "#f2c230" : YEL });
    if (u > 2.6) s += '<path d="M200 265 H440" stroke="#f2c230" stroke-width="24" stroke-dasharray="4 3" opacity=".8"/>';
    s += shark(lerp(-120, 360, k), lerp(150, 230, k), t, 0.9, k > 0.95);
    return s + tag("قرش!", 140, 90, u, 0.6, -3, 19, "#ffb08a") + tag("كيفلار", 320, 330, u, 2.8, 2, 16);
  });
  // 23 — so the video you're watching now may have crossed the sea in a pulse of light
  shot(23, function (u, d) { return [320, 190, lerp(1.0, 1.12, u / d)]; }, function (u, d, t) {
    var s = sea(t, 280) + cable(cablePts(-300, 940, 256, 266, 8), t, { w: 20, pulses: 1, n: 4, sp: 0.4 }) + phone(320, 120, t, { s: 0.75 });
    return s + tag("نبضة نور", 520, 200, u, 1.0, 3, 17, "#bfe0ff");
  });
  // 24 — outro
  shot(24, function (u, d) { return [320, lerp(190, 170, u / d), lerp(1.0, 1.15, u / d)]; }, function (u, d, t) {
    return sea(t, 280) + cable(cablePts(-300, 940, 256, 266, 8), t, { w: 20, pulses: 1 }) + qmark(500, 90, t, 56) + qmark(550, 140, t + 1, 36) + tag("حكاية إيه المرة الجاية؟", 320, 330, u, 0.2, -2, 19);
  });

  window.__parts = { sea: sea, cable: cable, cablePts: cablePts, section: section, sideCut: sideCut, ship: ship, waterline: waterline, skyDay: skyDay, repeater: repeater, globe: globe, egypt: egypt, shark: shark, phone: phone, tag: tag };
  window.__panel = function (svg, t) {
    var i = at(t), sh = SH[i], next = i + 1 < SH.length ? SH[i + 1].a : L(LN.length), u = t - sh.a, d = Math.max(0.5, next - sh.a);
    var c = sh.cam(u, d), cx = c[0] + 16 * Math.sin(t * 1.2), cy = c[1] + 12 * Math.cos(t * 1.2), z = c[2] * (1 + 0.03 * Math.sin(t * 1.1));   // a slow circle: the drift never comes to rest
    svg.innerHTML = '<g transform="translate(320 180) rotate(' + f(0.9 * Math.sin(t * 0.83)) + ') scale(' + z.toFixed(4) + ') translate(' + f(-cx) + ' ' + f(-cy) + ')">' + sh.draw(u, d, t) + '</g><rect width="640" height="360" filter="url(#grain)"/>';
    return i;
  };
})();
