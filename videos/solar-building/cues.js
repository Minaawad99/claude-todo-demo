// Sound cues from the line timings: node cues.js → cues.json. Sound effects only, no music.
// Recorded sounds (sfx/px-*.mp3) are Pixabay sound effects (Pixabay Content License) the channel sent earlier: a ding,
// rushing water, a wind gust (the sketch kit) and a cough.
global.window = {}; eval(require('fs').readFileSync(__dirname + '/timing.js', 'utf8'));
const T = window.TIMING.lines, L = i => i >= T.length ? window.TIMING.duration : T[i].start, D = i => L(i + 1) - L(i), c = [];
const a = (t, fx, gain, dur) => c.push(Object.assign({ t: +t.toFixed(2), fx, gain }, dur ? { dur } : {}));
const rec = (t, file, gain, from, dur, duck) => c.push(Object.assign({ t: +Math.max(0, t).toFixed(2), file: 'sfx/px-' + file + '.mp3', gain: +(gain * 1.2).toFixed(2), from: from || 0 }, dur ? { dur: +dur.toFixed(2) } : {}, duck != null ? { duck } : {}));
for (let i = 1; i < T.length; i++) a(L(i) - 0.08, 'whoosh', 0.3);
a(L(0) + 0.4, 'clank', 0.3); a(L(0) + 0.6, 'pop', 0.6); a(L(0) + 2.4, 'zap', 0.25); a(L(0) + 2.5, 'pop', 0.6); a(L(0) + 2.6, 'hum', 0.1, D(0) - 2.6);
rec(L(1) + 0.2, 'wind-gust', 0.25, 0, 1.6, 1.0); for (let k = 0; k < 4; k++) a(L(1) + 1.0 + k * 0.15, 'tick', 0.25); a(L(1) + 1.1, 'pop', 0.6); a(L(1) + 2.2, 'thud', 0.3);
a(L(2) + 0.5, 'clank', 0.35); a(L(2) + 0.6, 'pop', 0.6); a(L(2) + 1.2, 'charge', 0.3, 1.2); rec(L(2) + 2.6, 'ding', 0.3, 0, 1.1, 1.0);
a(L(3) + 0.5, 'sizzle', 0.3, 1.5); a(L(3) + 1.1, 'pop', 0.6); a(L(3) + 1.4, 'spark', 0.3); a(L(3) + 2.8, 'beep', 0.25); a(L(3) + 3.1, 'beep', 0.25);
a(L(4) + 0.4, 'clank', 0.3); a(L(4) + 0.9, 'pop', 0.6); for (let k = 0; k < 4; k++) a(L(4) + 1.2 + k * 0.3, 'tick', 0.2); a(L(4) + 2.4, 'chime', 0.4);
a(L(5) + 0.4, 'pop', 0.6); a(L(5) + 1.4, 'pop', 0.5); a(L(5) + 1.5, 'hum', 0.12, 1.2); a(L(5) + 2.8, 'pop', 0.6); a(L(5) + 2.9, 'motor', 0.25, 0.6); a(L(5) + 3.4, 'thud', 0.4);
for (let k = 0; k < 3; k++) { a(L(6) + 0.4 + k * 0.7, 'clank', 0.3); a(L(6) + 0.5 + k * 0.7, 'pop', 0.5); } a(L(6) + 2.6, 'chime', 0.4);
a(L(7) + 0.4, 'whoosh', 0.3); a(L(7) + 1.2, 'pop', 0.6); a(L(7) + 1.4, 'thud', 0.2);
for (let k = 0; k < 4; k++) a(L(8) + 0.3 + k * 0.35, 'servo', 0.2); a(L(8) + 1.6, 'pop', 0.6); a(L(8) + 2.2, 'chime', 0.35);
a(L(9) + 0.3, 'pop', 0.5); a(L(9) + 1.4, 'pop', 0.5); a(L(9) + 1.5, 'hum', 0.15, 1.6); a(L(9) + 2.4, 'beep', 0.25);
a(L(10) + 0.4, 'clank', 0.3); a(L(10) + 0.8, 'pop', 0.6); a(L(10) + 1.8, 'hum', 0.15, 1.5); rec(L(10) + 1.8, 'ding', 0.3, 0, 1.1, 1.0);
a(L(11) + 0.6, 'motor', 0.35, 1.0); a(L(11) + 0.9, 'pop', 0.6); a(L(11) + 1.6, 'spark', 0.45); a(L(11) + 1.6, 'zap', 0.35); a(L(11) + 1.7, 'thud', 0.4);
a(L(12) + 0.4, 'clank', 0.35); a(L(12) + 0.6, 'pop', 0.6); a(L(12) + 1.4, 'motor', 0.2, 1.4); a(L(12) + 1.8, 'chime', 0.4);
rec(L(13) + 0.2, 'wind-gust', 0.3, 0, D(13) - 0.2, 1.2); rec(L(13) + 1.5, 'cough', 0.3, 0.85, 1.4, 1.0); a(L(13) + 2.0, 'pop', 0.6);
rec(L(14) + 0.3, 'water-rush', 0.22, 2, D(14) - 0.3, 1.2); for (let k = 0; k < 4; k++) a(L(14) + 1.0 + k * 0.4, 'wipe', 0.25); a(L(14) + 2.6, 'chime', 0.35);
a(L(15) + 0.6, 'pop', 0.6); a(L(15) + 1.8, 'tick', 0.3);
a(L(16) + 0.4, 'sizzle', 0.25, 1.6); a(L(16) + 1.2, 'pop', 0.6); a(L(16) + 2.0, 'pop', 0.6); a(L(16) + 2.1, 'thud', 0.3);
rec(L(17) + 0.3, 'wind-gust', 0.25, 1, 1.8, 1.0); a(L(17) + 0.8, 'pop', 0.6); a(L(17) + 2.0, 'chime', 0.35);
for (let k = 0; k < 3; k++) a(L(18) + 0.6 + k * 0.5, 'beep', 0.22 - k * 0.04); a(L(18) + 0.6, 'pop', 0.6); a(L(18) + 2.4, 'thud', 0.3);
a(L(19) + 0.6, 'clank', 0.3); a(L(19) + 1.2, 'pop', 0.6); a(L(19) + 1.3, 'charge', 0.3, 1.0); rec(L(19) + 1.6, 'ding', 0.3, 0, 1.1, 1.0);
a(L(20) + 0.8, 'boom', 0.45); a(L(20) + 0.8, 'zap', 0.35); a(L(20) + 1.0, 'pop', 0.6); a(L(20) + 2.1, 'beep', 0.25); a(L(20) + 2.2, 'pop', 0.5);
a(L(21) + 0.4, 'chime', 0.5); for (let k = 0; k < 6; k++) a(L(21) + 0.3 + k * 0.25, 'pop', 0.35);
a(L(22) + 0.4, 'pop', 0.7); a(L(22) + 0.5, 'chime', 0.5);
require('fs').writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: false, cues: c }, null, 1));
console.log(c.length + ' cues');
