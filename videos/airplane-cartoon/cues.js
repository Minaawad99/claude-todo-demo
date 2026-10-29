// Sound cues from the line timings: node cues.js → cues.json
// Recorded sounds in sfx/px-*.mp3 are Pixabay sound effects (Pixabay Content License) from the channel's Drive library
// and the user's uploads; kept out of git (see refs/SOURCES.md).
global.window = {}; eval(require('fs').readFileSync(__dirname + '/timing.js', 'utf8'));
const T = window.TIMING.lines, L = i => i >= T.length ? window.TIMING.duration : T[i].start, D = i => L(i + 1) - L(i), c = [];
const a = (t, fx, gain, dur) => c.push(Object.assign({ t: +t.toFixed(2), fx, gain }, dur ? { dur } : {}));
const rec = (t, file, gain, from, dur, duck) => c.push(Object.assign({ t: +Math.max(0, t).toFixed(2), file: 'sfx/px-' + file + '.mp3', gain, from: from || 0 }, dur ? { dur: +dur.toFixed(2) } : {}, duck != null ? { duck } : {}));
for (let i = 1; i < T.length; i++) a(L(i) - 0.08, 'whoosh', 0.35);
rec(0, 'cabin-1', 0.32, 4, D(0) + 0.3, 1.6); a(0.3, 'chime', 0.45); a(L(0) + 2.6, 'pop', 0.7);                       // the cabin, the seat-belt chime, «400 طن»
rec(L(1), 'jet-flyby', 0.42, 3, D(1) + 0.3, 1.6); for (let k = 0; k < 4; k++) a(L(1) + 0.35 + k * 0.55, 'pop', 0.5); a(L(1) + 3.4, 'pop', 0.6);
rec(L(2), 'engine', 0.5, 1, D(2) + 0.2, 1.6); a(L(2) + 1.4, 'pop', 0.6);
a(L(3) + 0.05, 'pop', 0.9); a(L(3) + 0.2, 'chime', 0.5);
a(L(4), 'wind', 0.2, D(4)); for (let k = 0; k < 4; k++) a(L(4) + 0.4 + k * 0.4, 'pop', 0.5); a(L(4) + 1.8, 'pop', 0.6);
a(L(5), 'wind', 0.2, D(5)); a(L(5) + 0.2, 'pop', 0.5); a(L(5) + 1.3, 'chime', 0.35);
a(L(6), 'wind', 0.3, D(6)); a(L(6) + 0.2, 'pop', 0.5);
rec(L(7), 'engine', 0.6, 6, D(7) + 0.2, 1.6); a(L(7) + 0.2, 'intake', 0.4); a(L(7) + 0.6, 'pop', 0.6);
a(L(8) + 0.3, 'whoosh', 0.5); a(L(8) + 0.9, 'chime', 0.4); a(L(8) + 0.9, 'pop', 0.6);
a(L(9) + 0.8, 'pop', 0.6); a(L(9) + 2.0, 'pop', 0.5);
a(L(10), 'wind', 0.35, D(10)); a(L(10) + 1.6, 'pop', 0.6);
a(L(11), 'wind', 0.3, D(11)); a(L(11) + 1.0, 'spool', 0.35); a(L(11) + 2.2, 'pop', 0.6);
rec(L(12), 'car-pass', 0.5, 0, 3.4, 1.6); a(L(12) + 0.5, 'wind', 0.4, D(12) - 0.5); a(L(12) + 1.6, 'pop', 0.6);
a(L(13) + 0.4, 'pop', 0.6); a(L(13) + 1.5, 'spool', 0.4); a(L(13) + 2.9, 'chime', 0.45); a(L(13) + 2.9, 'pop', 0.6);
rec(L(14), 'engine', 0.4, 9, D(14) + 0.2, 1.6); a(L(14) + 1.4, 'pop', 0.6);
a(L(15) + 0.8, 'servo', 0.45, 2.0); a(L(15) + 1.2, 'pop', 0.6);
rec(L(16), 'takeoff', 0.62, 0, D(16) + 0.4, 1.4); a(L(16) + D(16) * 0.68, 'pop', 0.6);
for (let k = 0; k < 10; k++) a(L(17) + 0.6 + k * 0.28, 'pop', 0.35); a(L(17) + 3.4, 'thud', 0.5); a(L(17) + 3.4, 'pop', 0.6);
rec(L(18), 'wind', 0.42, 2, D(18) + 0.2, 1.6); a(L(18) + D(18) * 0.6, 'pop', 0.6);
rec(L(19), 'jet-flyby', 0.38, 7, D(19) + 0.2, 1.6); a(L(19) + 0.2, 'pop', 0.6); a(L(19) + 1.0, 'pop', 0.5);
a(L(20), 'hum', 0.2, D(20)); a(L(20) + 0.6, 'pop', 0.5); a(L(20) + 1.0, 'pop', 0.6);
rec(L(21), 'prop-plane', 0.5, 12, D(21) + 0.2, 1.6); for (let k = 0; k < 8; k++) a(L(21) + 0.4 + k * 0.55, 'tick', 0.25); a(L(21) + 0.2, 'pop', 0.6);
a(L(22) + 0.4, 'whoosh', 0.4); a(L(22) + 1.8, 'whoosh', 0.35); a(L(22) + 2.4, 'pop', 0.6);
rec(L(23), 'cabin-2', 0.32, 3, D(23) + 0.3, 1.6); a(L(23) + 2.6, 'pop', 0.6); a(L(23) + 2.7, 'chime', 0.35);
a(L(24) + 0.1, 'pop', 0.7); a(L(24) + 0.3, 'chime', 0.5);
require('fs').writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: true, cues: c }, null, 1));
console.log(c.length, 'cues');
