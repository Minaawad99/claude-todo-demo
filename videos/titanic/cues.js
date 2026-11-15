// Sound cues for «تيتانيك»: node cues.js → cues.json. Effects only, no music (the user's rule).
global.window = {}; eval(require('fs').readFileSync(__dirname + '/timing.js', 'utf8'));
const T = window.TIMING.lines, END = window.TIMING.duration, L = i => i >= T.length ? END : T[i].start, D = i => L(i + 1) - L(i), c = [];
const a = (t, fx, gain, dur, o) => c.push(Object.assign({ t: +t.toFixed(2), fx, gain }, dur ? { dur: +dur.toFixed(2) } : {}, o || {}));
const r = (t, file, gain, from, dur) => c.push({ t: +t.toFixed(2), file, gain, from: from || 0, dur: +dur.toFixed(2) });
const K = '../_templates/sketch/sfx/';
for (let i = 1; i < T.length; i++) a(L(i) - 0.1, 'whoosh', 0.08);
// the ocean at night and the ship's engines
a(0.1, 'waves', 0.22, L(7)); a(0.1, 'wind', 0.12, L(7)); a(L(2), 'motor', 0.2, D(2) + D(3));
a(L(4) + 0.4, 'creak', 0.35); r(L(5) + 0.3, K + 'px-space-drone.mp3', 0.35, 0, D(5));
// morning, the cancelled drill
a(L(7), 'waves', 0.15, D(7)); a(L(7) + 1.0, 'bell', 0.3, null, { f: 660 }); a(L(7) + 3.2, 'thud', 0.35);
// the wireless room: Morse, paper
r(L(8) + 0.3, 'sfx/morse.wav', 0.3, 0, Math.min(6, D(8))); for (let k = 0; k < 4; k++) r(L(8) + 0.8 + k * 0.9, K + 'px-paper.mp3', 0.35, 0, 0.6);
r(L(9) + 0.2, 'sfx/morse.wav', 0.3, 1.5, Math.min(5, D(9))); for (let k = 0; k < 5; k++) r(L(9) + 0.5 + k * 0.7, K + 'px-paper.mp3', 0.3, 0, 0.6);
a(L(10) + 1.0, 'thud', 0.4);
a(L(11), 'wind', 0.2, D(11)); r(L(11) + 1.5, 'sfx/morse.wav', 0.3, 0, 3); a(L(12) + 0.4, 'thud', 0.45); a(L(13) + 0.8, 'tick', 0.5); a(L(13) + 1.0, 'wind', 0.12, D(13));
r(L(14), K + 'px-space-drone.mp3', 0.4, 0, D(14) + D(15) + D(16) + D(17));
// the crow's nest
a(L(15), 'wind', 0.3, D(15) + D(16) + D(17)); a(L(16) + 1.2, 'clink', 0.35); a(L(16) + 2.6, 'clank', 0.3);
// 11:40: the bell three times, the turn, the scrape
[0.3, 0.75, 1.2].forEach(k => a(L(18) + k, 'bell', 0.7, null, { f: 990 }));
a(L(19), 'creak', 0.6, 2.2); a(L(19) + 1.6, 'creak', 0.7, 2.4); a(L(19) + 2.0, 'boom', 0.45); a(L(19) + 2.2, 'spray', 0.3, 1.6);
a(L(20) + 0.6, 'clink', 0.3); a(L(20) + 0.8, 'thud', 0.3);
a(L(21), 'fill', 0.5, D(21)); a(L(21) + 0.4, 'slosh', 0.4); a(L(21) + 2.4, 'slosh', 0.35);
r(L(22), K + 'px-clock-ticking.mp3', 0.45, 0, D(22));
for (let k = 0; k < 5; k++) a(L(23) + 0.3 + k * 0.25, 'pop', 0.3);
a(L(24), 'creak', 0.35, 2); a(L(24) + 0.4, 'gear', 0.3); a(L(24) + D(24) - 0.8, 'splash', 0.35);
a(L(25), 'wind', 0.15, D(25) + D(26)); a(L(26) + 0.8, 'whoosh', 0.4); a(L(26) + 2.0, 'pop', 0.5);
a(L(27), 'creak', 0.25, 2); a(L(28), 'wind', 0.15, D(28));
a(L(29), 'creak', 0.3, 2.4); a(L(29), 'waves', 0.2, D(29));
a(L(30) + 0.6, 'chime', 0.25); a(L(31) + 2.2, 'gear', 0.3); a(L(31) + D(31) - 0.6, 'splash', 0.3);
// the rockets
[0.3, 1.5, 2.6].forEach(k => { a(L(32) + k, 'whoosh', 0.5); a(L(32) + k + 0.7, 'pop', 0.6); });
a(L(33), 'wind', 0.2, D(33) + D(34) + D(35)); a(L(33) + 1.0, 'pop', 0.25); a(L(34) + 1.4, 'tick', 0.4); a(L(34) + 1.7, 'tick', 0.4);
// the Carpathia
r(L(36) + 0.3, 'sfx/morse.wav', 0.35, 2.4, 3.2); r(L(36) + 2.2, 'sfx/horn.wav', 0.4, 0, 3.2);
a(L(37), 'motor', 0.4, D(37)); a(L(37), 'waves', 0.3, D(37)); a(L(37) + 0.5, 'steam', 0.3, 1.6);
// the end of the ship
r(L(38), K + 'px-space-drone.mp3', 0.5, 0, D(38) + D(39)); a(L(38) + 0.5, 'creak', 0.6, 2.4); a(L(38) + 2.4, 'clank', 0.3); a(L(39) + 0.6, 'creak', 0.5, 2.4);
a(L(40) + 1.2, 'zap', 0.4); a(L(40) + 2.0, 'creak', 0.9, 2.6); a(L(40) + 2.8, 'boom', 0.9); a(L(40) + 3.0, 'thud', 0.7); a(L(40) + 3.6, 'fill', 0.6, 2.4); a(L(40) + 4.2, 'splash', 0.6);
a(L(41), 'wind', 0.25, D(41) + D(42)); a(L(43), 'waves', 0.2, D(43)); a(L(43) + 1.0, 'splash', 0.2);
// dawn
r(L(44) + 0.3, 'sfx/horn.wav', 0.45, 0, 3.2); a(L(44), 'waves', 0.3, D(44)); for (let k = 0; k * 0.9 < D(44) - 0.5; k++) a(L(44) + 0.6 + k * 0.9, 'splash', 0.14);
r(L(45) + D(45) * 0.55, 'sfx/morse.wav', 0.3, 0, 2.4);
a(L(46) + 0.4, 'thud', 0.4); a(L(46) + 1.2, 'pop', 0.3);
a(L(47), 'wind', 0.12, D(47)); a(L(47) + 1.4, 'chime', 0.3); c.push({ t: +(L(48) + 0.3).toFixed(2), fx: 'bell', gain: 0.35, dur: 2.5, f: 330 });
require('fs').writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: false, cues: c }, null, 1)); console.log(c.length, 'cues');
