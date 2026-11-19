// Sound cues for «عبّارة السلام 98»: node cues.js → cues.json. Effects only, no music (the user's rule).
// The three real black-box clips (sfx/px-vdr-*.mp3, cut from the recording the channel sent) play in the gaps clips.py opened.
global.window = {}; eval(require('fs').readFileSync(__dirname + '/timing.js', 'utf8'));
const T = window.TIMING.lines, END = window.TIMING.duration, L = i => i >= T.length ? END : T[i].start, D = i => L(i + 1) - L(i), c = [];
const a = (t, fx, gain, dur, o) => c.push(Object.assign({ t: +t.toFixed(2), fx, gain }, dur ? { dur: +dur.toFixed(2) } : {}, o || {}));
const r = (t, file, gain, from, dur, o) => c.push(Object.assign({ t: +t.toFixed(2), file, gain, from: from || 0 }, dur ? { dur: +dur.toFixed(2) } : {}, o || {}));
const K = '../_templates/sketch/sfx/';
const CLIP = new Set(window.TIMING.clips.map(q => q.line));
window.TIMING.clips.forEach(q => { r(q.t, 'sfx/px-' + q.file + '.mp3', 1.0, 0, null, { duck: false }); r(Math.max(0, q.t - 0.2), K + 'px-space-drone.mp3', 0.3, 0, D(q.line) + 0.4); });
for (let i = 1; i < T.length; i++) if (!CLIP.has(i)) a(L(i) - 0.1, 'whoosh', 0.08);
// 0–7 the night sea under the cold open
r(0.05, K + 'px-ocean-waves.mp3', 0.22, 0.2, Math.min(21, L(5))); a(0.1, 'wind', 0.1, L(1)); a(L(0) + 3.4, 'creak', 0.35, 2.2);
a(L(1) + 0.4, 'ping', 0.3); a(L(2), 'motor', 0.18, D(2) + D(3)); a(L(3) + D(3) * 0.55, 'pop', 0.3);
a(L(5), 'spray', 0.25, D(5)); a(L(5) + 0.6, 'sizzle', 0.2, 1.4); r(L(6) + 0.2, K + 'px-space-drone.mp3', 0.35, 0, D(6)); a(L(6) + 1.1, 'snip', 0.3);
r(L(7), K + 'px-clock-ticking.mp3', 0.4, 0, D(7));
// 8–11 the port, the old photo, the route
a(L(8), 'waves', 0.15, D(8)); a(L(8) + 0.6, 'idle', 0.25, 3); a(L(8) + 2.4, 'clank', 0.3); a(L(8) + D(8) * 0.7, 'pop', 0.3);
r(L(9) + 0.2, K + 'px-paper.mp3', 0.4, 0, 0.6); a(L(9) + D(9) * 0.62, 'pop', 0.3); a(L(10) + 0.9, 'gear', 0.25); a(L(10) + 1.0, 'pop', 0.25);
a(L(11), 'motor', 0.2, D(11)); a(L(11), 'waves', 0.15, D(11));
// 12–17 the fire, the water, the blocked scuppers
a(L(12) + 0.2, 'steam', 0.2, 1.6); a(L(12) + D(12) * 0.55, 'sizzle', 0.4, 1.6); a(L(12) + D(12) * 0.6, 'boom', 0.25);
a(L(13) + 0.3, 'spray', 0.4, D(13) - 0.4); a(L(13) + 1.0, 'sizzle', 0.3, 1.4); a(L(13) + D(13) - 1.6, 'sizzle', 0.35, 1.4);
a(L(14) + 0.5, 'drip', 0.4); a(L(14) + 0.9, 'drip', 0.4); a(L(14) + 1.3, 'drip', 0.4); a(L(14), 'spray', 0.15, D(14));
a(L(15) + 0.35, 'thud', 0.5); a(L(15) + 0.6, 'snip', 0.3); a(L(16) + 0.2, 'ping', 0.3); a(L(16) + 0.9, 'ping', 0.2);
a(L(17), 'fill', 0.4, D(17)); a(L(17) + 0.8, 'slosh', 0.4); a(L(17) + 3.0, 'slosh', 0.35);
a(L(18) + D(18) * 0.5, 'slosh', 0.5); a(L(18) + D(18) * 0.5 + 1.0, 'slosh', 0.4);
a(L(19), 'motor', 0.18, D(19)); a(L(19) + D(19) * 0.45, 'snip', 0.3);
r(L(20), K + 'px-clock-ticking.mp3', 0.4, 0, D(20)); a(L(20) + 1.0, 'creak', 0.4, 2.2); a(L(20) + 2.6, 'slosh', 0.3);
// 21–29 the wheelhouse, the list, the decks, the roll
a(L(21), 'hum', 0.12, D(21)); a(L(21) + 0.8, 'creak', 0.3, 2); a(L(22), 'wind', 0.15, D(22)); r(L(22) + 0.2, K + 'px-clock-ticking.mp3', 0.3, 0, D(22) - 0.4);
a(L(23) + 0.6, 'creak', 0.3, 2.4);
a(L(24), 'wind', 0.2, D(24) + D(25)); a(L(24) + 0.5, 'creak', 0.4, 2.2); for (let k = 0; k < 8; k++) a(L(24) + 1.0 + k * 0.35, 'thud', 0.14);
a(L(25) + 1.5, 'creak', 0.5, 2.6); a(L(25) + 3.6, 'clank', 0.3);
r(L(26), K + 'px-space-drone.mp3', 0.45, 0, D(26)); a(L(26) + 0.8, 'creak', 0.6, 2.4);
a(L(27) + 0.35, 'pop', 0.35); a(L(28), 'wind', 0.2, D(28));
a(L(29) + D(29) * 0.3, 'creak', 0.9, 2.6); a(L(29) + D(29) * 0.3 + 1.0, 'clank', 0.5); a(L(29) + D(29) * 0.3 + 1.6, 'boom', 0.7); a(L(29) + D(29) * 0.3 + 1.9, 'fill', 0.6, 2.4); a(L(29) + D(29) * 0.3 + 2.4, 'splash', 0.6);
// 31–37 the box, the silent radio, the beacon, the people in the sea
a(L(31), 'fill', 0.25, D(31)); a(L(32) + 0.8, 'snip', 0.3); a(L(32), 'hum', 0.1, D(32));
for (let k = 0; k * 0.9 < D(33) - 0.4; k++) a(L(33) + 0.3 + k * 0.9, 'beep', 0.2); a(L(33), 'waves', 0.2, D(33));
r(L(34), K + 'px-space-drone.mp3', 0.4, 0, D(34)); [0.2, 0.62, 0.8].forEach(k => a(L(34) + D(34) * k + 0.5, 'ping', 0.3));
r(L(35), K + 'px-ocean-waves.mp3', 0.4, 0.2, Math.min(21, D(35) + D(36) + D(37))); a(L(35) + 0.8, 'splash', 0.25); a(L(35) + 2.4, 'splash', 0.2); a(L(35), 'wind', 0.2, D(35) + D(36));
a(L(36) + 0.5, 'motor', 0.15, D(36) - 0.6); a(L(37) + 0.4, 'motor', 0.25, D(37) - 0.4);
// 38–46 the numbers, Safaga, the box recovered, the verdicts, the homes
a(L(38) + D(38) * 0.45, 'bell', 0.3, null, { f: 440 }); c.push({ t: +(L(39) + 0.4).toFixed(2), fx: 'bell', gain: 0.4, dur: 2.5, f: 220 }); a(L(39), 'waves', 0.2, D(39));
a(L(40), 'wind', 0.15, D(40)); r(L(40) + 3.0, K + 'px-paper.mp3', 0.3, 0, 0.6);
a(L(41), 'fill', 0.2, D(41)); a(L(41) + 0.6, 'servo', 0.25); a(L(41) + 2.0, 'clank', 0.25);
a(L(42) + 0.4, 'ping', 0.25); a(L(42) + D(42) * 0.4, 'slosh', 0.4); a(L(42) + D(42) * 0.82, 'snip', 0.3);
a(L(43) + 0.3, 'jet', 0.2, 2.6); a(L(43) + D(43) * 0.52, 'thud', 0.6); a(L(43) + D(43) * 0.52 + 0.25, 'pop', 0.3);
a(L(44) + D(44) * 0.4, 'thud', 0.5); a(L(44), 'waves', 0.15, D(44));
a(L(45), 'wind', 0.12, D(45)); c.push({ t: +(L(45) + D(45) * 0.6).toFixed(2), fx: 'bell', gain: 0.35, dur: 2.5, f: 220 });
c.push({ t: +(L(46) + 0.3).toFixed(2), fx: 'bell', gain: 0.3, dur: 2.5, f: 330 }); a(L(46), 'waves', 0.2, D(46));
require('fs').writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: false, cues: c }, null, 1)); console.log(c.length, 'cues');
