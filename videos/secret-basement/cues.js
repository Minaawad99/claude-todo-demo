// Sound cues from the line timings: node cues.js → cues.json. Sound effects only, no music.
// Recorded sounds in sfx/px-*.mp3 are Pixabay sound effects (Pixabay Content License) the channel sent for earlier episodes
// (an exhale, a cough, a heartbeat, plus a ding, rushing water and a wind gust from the sketch kit).
global.window = {}; eval(require('fs').readFileSync(__dirname + '/timing.js', 'utf8'));
const T = window.TIMING.lines, L = i => i >= T.length ? window.TIMING.duration : T[i].start, D = i => L(i + 1) - L(i), c = [];
const a = (t, fx, gain, dur) => c.push(Object.assign({ t: +t.toFixed(2), fx, gain }, dur ? { dur } : {}));
const rec = (t, file, gain, from, dur, duck) => c.push(Object.assign({ t: +Math.max(0, t).toFixed(2), file: 'sfx/px-' + file + '.mp3', gain: +(gain * 1.2).toFixed(2), from: from || 0 }, dur ? { dur: +dur.toFixed(2) } : {}, duck != null ? { duck } : {}));
for (let i = 1; i < T.length; i++) a(L(i) - 0.08, 'whoosh', 0.3);
for (let k = 0; k < 5; k++) a(L(0) + 0.3 + k * 0.45, 'thud', 0.25); a(L(0) + 2.6, 'pop', 0.7);                      // digging, the rug drops
a(L(1) + 0.5, 'boom', 0.3); for (let k = 0; k < 8; k++) a(L(1) + 0.6 + k * 0.12, 'thud', 0.22); a(L(1) + 1.8, 'pop', 0.6);   // cave-in
for (let k = 0; k < 4; k++) a(L(2) + 0.3 + k * 0.25, 'clank', 0.25); a(L(2) + 0.6, 'pop', 0.5); a(L(2) + 2.8, 'thud', 0.5); a(L(2) + 2.8, 'pop', 0.7);
a(L(3) + 0.4, 'creak', 0.35); for (let k = 0; k < 4; k++) a(L(3) + 0.5 + k * 0.3, 'tick', 0.2); a(L(3) + 1.8, 'pop', 0.6);
a(L(4) + 0.2, 'fill', 0.35, 2.0); a(L(4) + 0.8, 'pop', 0.5); a(L(4) + 2.6, 'pop', 0.6);
rec(L(5), 'water-rush', 0.22, 0, D(5), 1.2); for (let k = 0; k < 4; k++) a(L(5) + 1.8 + k * 0.5, 'drip', 0.35); a(L(5) + 1.8, 'pop', 0.5);
a(L(6) + 0.3, 'wipe', 0.4); a(L(6) + 0.5, 'pop', 0.5); a(L(6) + 1.6, 'clank', 0.3); a(L(6) + 1.7, 'pop', 0.5); a(L(6) + 2.6, 'motor', 0.2, 1.6); a(L(6) + 2.7, 'pop', 0.5);
rec(L(7) + 0.6, 'exhale', 0.5, 0, 1.8, 1.0); a(L(7) + 1.0, 'pop', 0.6);
a(L(8) + 0.3, 'clank', 0.25); a(L(8) + 0.8, 'pop', 0.5); rec(L(8) + 2.0, 'wind-gust', 0.25, 0, D(8) - 2.0, 1.0); a(L(8) + 2.0, 'spin', 0.25); a(L(8) + 2.2, 'pop', 0.6);
for (let k = 0; k < 5; k++) a(L(9) + 0.4 + k * 0.5, 'drip', 0.3); a(L(9) + 1.4, 'pop', 0.6);
a(L(10) + 0.3, 'pop', 0.5); a(L(10) + 0.5, 'hum', 0.15, D(10) - 0.6); for (let k = 0; k < 3; k++) a(L(10) + 1.0 + k * 0.4, 'beep', 0.2); a(L(10) + 2.2, 'pop', 0.6);
a(L(11) + 0.6, 'whoosh', 0.35); a(L(11) + 1.4, 'pop', 0.6); a(L(11) + 1.6, 'bump', 0.4);
a(L(12) + 0.6, 'tick', 0.4); a(L(12) + 1.2, 'creak', 0.45); a(L(12) + 0.7, 'pop', 0.5); a(L(12) + 1.8, 'pop', 0.5);
for (let k = 0; k < 6; k++) a(L(13) + 0.3 + k * 0.32, 'thud', 0.25 + (k % 2) * 0.1); a(L(13) + 1.6, 'pop', 0.6);
a(L(14) + 0.3, 'squeeze', 0.3); a(L(14) + 0.6, 'pop', 0.6); for (let k = 0; k < 3; k++) a(L(14) + 1.2 + k * 0.3, 'thud', 0.12 - k * 0.03); a(L(14) + 2.2, 'pop', 0.5);
a(L(15) + 0.3, 'creak', 0.3); a(L(15) + 0.9, 'thud', 0.6); rec(L(15) + 1.1, 'heartbeat', 0.45, 0, D(15) - 1.1, 1.2); a(L(15) + 1.2, 'pop', 0.6);
for (let k = 0; k < 5; k++) a(L(16) + 0.3 + k * 0.32, 'clank', 0.18); a(L(16) + 2.0, 'pop', 0.6); rec(L(16) + 2.0, 'ding', 0.3, 0, 1.1, 1.0);
for (let k = 0; k < 4; k++) a(L(17) + 0.3 + k * 0.4, 'tick', 0.2); a(L(17) + 0.8, 'pop', 0.6);
a(L(18) + 0.4, 'steam', 0.12, 2.4); a(L(18) + 1.2, 'pop', 0.4); a(L(18) + 1.6, 'pop', 0.4); a(L(18) + 2.4, 'pop', 0.7);
rec(L(19) + 0.6, 'cough', 0.35, 0.85, 1.9, 1.0); a(L(19) + 0.3, 'pop', 0.5); a(L(19) + 1.0, 'pop', 0.6); a(L(19) + 1.6, 'pop', 0.4); a(L(19) + 2.4, 'pop', 0.4);
a(L(20) + 0.8, 'squeeze', 0.35); a(L(20) + 0.9, 'pop', 0.5); a(L(20) + 1.6, 'motor', 0.18, 2.0); a(L(20) + 2.0, 'pop', 0.5);
for (let k = 0; k < 5; k++) a(L(21) + 0.4 + k * 0.15, 'thud', 0.2); a(L(21) + 0.8, 'pop', 0.6); a(L(21) + 2.0, 'pop', 0.6);
a(L(22) + 0.3, 'ping', 0.3); for (let k = 0; k < 8; k++) a(L(22) + 3.7 + k * 0.09, 'bell', 0.12); a(L(22) + 0.4, 'pop', 0.5); a(L(22) + 1.2, 'pop', 0.5); a(L(22) + 2.1, 'notify', 0.3); a(L(22) + 2.1, 'pop', 0.5);
a(L(23) + 0.4, 'chime', 0.5); for (let k = 0; k < 5; k++) a(L(23) + 0.5 + k * 0.2, 'pop', 0.35);
a(L(24) + 0.4, 'pop', 0.7); a(L(24) + 0.5, 'chime', 0.5);
require('fs').writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: false, cues: c }, null, 1));
console.log(c.length + ' cues');
