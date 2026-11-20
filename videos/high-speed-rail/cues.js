// Sound cues from the line timings: node cues.js → cues.json. Sound effects only, no music.
// Recorded sounds (sfx/px-*.mp3) are Pixabay sound effects (Pixabay Content License) the channel sent earlier: a ding,
// a wind gust (the sketch kit) and a cough (secret-basement). Everything else is synthesized by ../audio/sfx.py.
global.window = {}; eval(require('fs').readFileSync(__dirname + '/timing.js', 'utf8'));
const T = window.TIMING.lines, L = i => i >= T.length ? window.TIMING.duration : T[i].start, D = i => L(i + 1) - L(i), c = [];
const a = (t, fx, gain, dur) => c.push(Object.assign({ t: +t.toFixed(2), fx, gain }, dur ? { dur } : {}));
const rec = (t, file, gain, from, dur, duck) => c.push(Object.assign({ t: +Math.max(0, t).toFixed(2), file: 'sfx/px-' + file + '.mp3', gain: +(gain * 1.2).toFixed(2), from: from || 0 }, dur ? { dur: +dur.toFixed(2) } : {}, duck != null ? { duck } : {}));
for (let i = 1; i < T.length; i++) a(L(i) - 0.08, 'whoosh', 0.28);
rec(L(0), 'wind-gust', 0.18, 0, 2.0, 1.0); a(L(0) + 0.3, 'creak', 0.25, 1.4); a(L(0) + 0.8, 'pop', 0.55);
a(L(1) + 0.2, 'creak', 0.3, 1.2); a(L(1) + 1.0, 'pop', 0.6); a(L(1) + 1.4, 'thud', 0.35); a(L(1) + 1.45, 'pop', 0.5);
a(L(2) + 0.3, 'clank', 0.4); a(L(2) + 1.0, 'clank', 0.35); a(L(2) + 1.4, 'pop', 0.6); a(L(2) + 2.7, 'spin', 0.25, 2.0); a(L(2) + 2.8, 'pop', 0.5); rec(L(2) + 4.8, 'ding', 0.28, 0, 1.1, 1.0);
a(L(3) + 0.8, 'creak', 0.35, 1.2); a(L(3) + 1.2, 'pop', 0.6); a(L(3) + 1.9, 'clank', 0.4); a(L(3) + 2.0, 'thud', 0.4); a(L(3) + 2.2, 'pop', 0.5);
a(L(4) + 0.4, 'whoosh', 0.3); a(L(4) + 1.4, 'thud', 0.35); for (let k = 0; k < 3; k++) a(L(4) + 1.9 + k * 0.4, 'clink', 0.3); a(L(4) + 2.8, 'pop', 0.6); a(L(4) + 4.0, 'chime', 0.4);
a(L(5) + 0.4, 'whoosh', 0.3); a(L(5) + 0.7, 'creak', 0.35, 1.3); a(L(5) + 1.4, 'pop', 0.6); a(L(5) + 1.8, 'thud', 0.35);
for (let k = 0; k < 10; k++) a(L(6) + 0.4 + k * 0.2, 'clink', 0.18); a(L(6) + 1.6, 'pop', 0.6); rec(L(6) + 2.6, 'ding', 0.28, 0, 1.1, 1.0);
a(L(7) + 0.3, 'pop', 0.5); a(L(7) + 2.0, 'pop', 0.6); a(L(7) + 2.6, 'squeeze', 0.3, 1.2); a(L(7) + 3.0, 'pop', 0.5);
a(L(8) + 0.8, 'pop', 0.6); a(L(8) + 1.9, 'servo', 0.2); a(L(8) + 2.4, 'pop', 0.45); a(L(8) + 3.2, 'pop', 0.5); a(L(8) + 3.6, 'chime', 0.4);
for (let k = 0; k < 8; k++) a(L(9) + 0.25 + k * 0.38, 'tick', 0.35); a(L(9) + 1.2, 'pop', 0.5);
a(L(10) + 0.6, 'pop', 0.55); a(L(10) + 2.0, 'sizzle', 0.2, 2.0); a(L(10) + 3.4, 'pop', 0.6);
a(L(11) + 0.2, 'rev', 0.25, 1.6); a(L(11) + 1.0, 'clank', 0.5); a(L(11) + 1.0, 'thud', 0.45); a(L(11) + 1.0, 'pop', 0.55); a(L(11) + 1.1, 'spark', 0.35);
a(L(12) + 0.6, 'pop', 0.55); a(L(12) + 0.7, 'sizzle', 0.35, 1.6); a(L(12) + 0.8, 'spark', 0.3); a(L(12) + 2.3, 'steam', 0.25, 0.8); a(L(12) + 3.0, 'pop', 0.6); a(L(12) + 3.4, 'chime', 0.4);
a(L(13) + 0.1, 'pop', 0.5); a(L(13) + 0.8, 'pop', 0.55);
a(L(14) + 0.6, 'servo', 0.35); a(L(14) + 0.8, 'clank', 0.3); a(L(14) + 1.4, 'pop', 0.6); a(L(14) + 2.6, 'chime', 0.35);
a(L(15) + 0.4, 'jet', 0.35, 4.0); a(L(15) + 0.5, 'rev', 0.3, 3.5); a(L(15) + 1.0, 'pop', 0.55); a(L(15) + 1.4, 'pop', 0.5); a(L(15) + 2.4, 'pop', 0.5);
a(L(16) + 0.4, 'pop', 0.6); for (let k = 0; k < 3; k++) a(L(16) + 0.6 + k * 0.6, 'ping', 0.18); a(L(16) + 2.4, 'beep', 0.3); a(L(16) + 2.7, 'beep', 0.3); a(L(16) + 2.6, 'exhaust', 0.25, 0.8); a(L(16) + 3.2, 'chime', 0.35);
a(L(17) + 0.5, 'idle', 0.35, 3.6); a(L(17) + 1.6, 'pop', 0.6); rec(L(17) + 1.8, 'cough', 0.3, 0.85, 1.4, 1.0); a(L(17) + 2.4, 'pop', 0.45);
for (let k = 0; k < 3; k++) { a(L(18) + 0.3 + k * 0.6, 'clank', 0.3); a(L(18) + 0.35 + k * 0.6, 'thud', 0.2); } a(L(18) + 2.0, 'pop', 0.6); a(L(18) + 3.0, 'servo', 0.3); a(L(18) + 4.0, 'zap', 0.35); a(L(18) + 4.0, 'spark', 0.3); a(L(18) + 4.1, 'hum', 0.15, 2.0); a(L(18) + 4.3, 'chime', 0.35);
a(L(19) + 0.2, 'rev', 0.35, 3.0); a(L(19) + 1.2, 'pop', 0.6); a(L(19) + 1.4, 'pop', 0.55); a(L(19) + 2.0, 'pop', 0.5); a(L(19) + 2.0, 'beep', 0.25);
a(L(20) + 0.3, 'clank', 0.3); a(L(20) + 0.8, 'pop', 0.55); a(L(20) + 1.3, 'thud', 0.35); a(L(20) + 2.0, 'jet', 0.25, 1.8); a(L(20) + 2.1, 'pop', 0.55); a(L(20) + 2.8, 'chime', 0.35);
a(L(21) + 0.3, 'thud', 0.3); a(L(21) + 0.8, 'pop', 0.5); a(L(21) + 0.9, 'exhaust', 0.25, 1.4); a(L(21) + 1.6, 'bell', 0.3); a(L(21) + 2.6, 'pop', 0.6);
a(L(22) + 0.4, 'chime', 0.5); a(L(22) + 0.6, 'jet', 0.3, 2.4); for (let k = 0; k < 6; k++) a(L(22) + 0.3 + k * 0.25, 'pop', 0.35);
a(L(23) + 0.4, 'pop', 0.7); a(L(23) + 0.5, 'chime', 0.5);
require('fs').writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: false, cues: c }, null, 1));
console.log(c.length + ' cues');
