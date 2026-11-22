// Sound cues from the line timings: node cues.js → cues.json. Sound effects only, no music.
// Recorded sounds (sfx/px-*.mp3) are Pixabay sound effects (Pixabay Content License) the channel sent earlier: a ding,
// an exhale and a wind gust (from videos/secret-basement/sfx). Everything else is synthesized by ../audio/sfx.py.
global.window = {}; eval(require('fs').readFileSync(__dirname + '/timing.js', 'utf8'));
const T = window.TIMING.lines, L = i => i >= T.length ? window.TIMING.duration : T[i].start, D = i => L(i + 1) - L(i), c = [];
const a = (t, fx, gain, dur) => c.push(Object.assign({ t: +t.toFixed(2), fx, gain }, dur ? { dur } : {}));
const rec = (t, file, gain, from, dur, duck) => c.push(Object.assign({ t: +Math.max(0, t).toFixed(2), file: 'sfx/px-' + file + '.mp3', gain: +(gain * 1.2).toFixed(2), from: from || 0 }, dur ? { dur: +dur.toFixed(2) } : {}, duck != null ? { duck } : {}));
const dig = (t0, n, gap) => { for (let k = 0; k < n; k++) { a(t0 + k * gap, 'thud', 0.22); a(t0 + k * gap + 0.25, 'toner', 0.22, 0.5); } };
for (let i = 1; i < T.length; i++) a(L(i) - 0.08, 'whoosh', 0.3);
a(L(0) + 0.1, 'steam', 0.25, 2.0); a(L(0) + 0.6, 'pop', 0.6); a(L(0) + 3.4, 'pop', 0.6); a(L(0) + 3.5, 'chime', 0.3);
a(L(1) + 0.1, 'sizzle', 0.35, 1.8); a(L(1) + 0.6, 'pop', 0.6); a(L(1) + 1.4, 'tick', 0.25); rec(L(1) + 3.0, 'exhale', 0.25, 0, 1.0, 1.0);
a(L(2) + 0.5, 'thud', 0.3); for (let k = 0; k < 5; k++) a(L(2) + 0.8 + k * 0.28, 'tick', 0.16); a(L(2) + 2.0, 'jet', 0.18, 3.4); a(L(2) + 2.8, 'pop', 0.6); a(L(2) + 4.2, 'chime', 0.4);
rec(L(3) + 0.2, 'wind-gust', 0.2, 0, 1.8, 1.0); a(L(3) + 0.4, 'pop', 0.6); a(L(3) + 2.4, 'sizzle', 0.3, 1.4); a(L(3) + 3.6, 'thud', 0.3);
a(L(4) + 1.0, 'pop', 0.6); a(L(4) + 2.6, 'pop', 0.6); a(L(4) + 2.7, 'bell', 0.3); a(L(4) + 4.6, 'chime', 0.35);
dig(L(5) + 0.1, 3, 0.62); a(L(5) + 0.3, 'pop', 0.6); a(L(5) + 1.8, 'thud', 0.3); rec(L(5) + 2.2, 'exhale', 0.3, 0, 1.0, 1.0);
dig(L(6) + 1.0, 7, 0.6); a(L(6) + 2.2, 'pop', 0.55); a(L(6) + 3.4, 'pop', 0.55); a(L(6) + 5.2, 'chime', 0.35);
a(L(7) + 0.3, 'wipe', 0.3); a(L(7) + 1.6, 'pop', 0.6); a(L(7) + 2.6, 'chime', 0.35);
a(L(8) + 0.8, 'pop', 0.6); a(L(8) + 1.0, 'thud', 0.25); a(L(8) + 1.4, 'thud', 0.25);
dig(L(9) + 0.1, 5, 0.6); a(L(9) + 1.0, 'pop', 0.55); a(L(9) + 1.7, 'pop', 0.55); a(L(9) + 2.4, 'pop', 0.55); a(L(9) + 3.8, 'pop', 0.6); a(L(9) + 4.0, 'chime', 0.3);
a(L(10) + 0.3, 'sizzle', 0.25, 1.6); a(L(10) + 0.5, 'pop', 0.6); a(L(10) + 1.4, 'thud', 0.3);
rec(L(11) + 0.4, 'wind-gust', 0.18, 0.5, 2.0, 1.0); a(L(11) + 0.5, 'whoosh', 0.3); for (let k = 0; k < 3; k++) a(L(11) + 2.5 + k * 0.3, 'thud', 0.28); a(L(11) + 3.0, 'pop', 0.6); a(L(11) + 4.0, 'chime', 0.35);
a(L(12) + 0.2, 'sizzle', 0.4, 2.2); a(L(12) + 0.8, 'pop', 0.6); a(L(12) + 1.6, 'thud', 0.3);
a(L(13) + 0.3, 'whoosh', 0.35); a(L(13) + 2.0, 'thud', 0.3); a(L(13) + 2.2, 'pop', 0.6); a(L(13) + 2.3, 'wind', 0.15, 2.4); a(L(13) + 4.6, 'pop', 0.6); a(L(13) + 4.7, 'chime', 0.45); rec(L(13) + 5.0, 'ding', 0.3, 0, 1.1, 1.0);
a(L(14) + 0.6, 'pop', 0.6); a(L(14) + 2.6, 'notify', 0.25);
for (let k = 0; k < 6; k++) a(L(15) + 0.5 + k * 0.45, 'drip', 0.3); a(L(15) + 0.8, 'pop', 0.6); a(L(15) + 3.7, 'pop', 0.6); a(L(15) + 3.8, 'chime', 0.35); a(L(15) + 6.0, 'pop', 0.5);
rec(L(16) + 0.4, 'exhale', 0.3, 0, 1.2, 1.0); a(L(16) + 0.8, 'pop', 0.6); a(L(16) + 1.8, 'chime', 0.35);
rec(L(17) + 0.1, 'wind-gust', 0.35, 0, D(17) - 0.1, 1.2); a(L(17) + 0.4, 'pop', 0.6);
a(L(18) + 0.3, 'wipe', 0.3); a(L(18) + 1.2, 'thud', 0.4); a(L(18) + 1.0, 'pop', 0.55); a(L(18) + 2.2, 'pop', 0.55); rec(L(18) + 3.0, 'ding', 0.3, 0, 1.1, 1.0);
a(L(19) + 0.1, 'jet', 0.22, 1.9); a(L(19) + 0.5, 'pop', 0.6);
for (let k = 0; k < 8; k++) a(L(20) + 0.6 + k * 0.28, 'thud', 0.18); a(L(20) + 2.6, 'pop', 0.6); a(L(20) + 3.0, 'jet', 0.18, 2.6); a(L(20) + 3.4, 'clink', 0.35, 0.9); a(L(20) + 3.5, 'bell', 0.25);
a(L(21) + 0.3, 'pop', 0.6); a(L(21) + 0.6, 'slosh', 0.25, 0.8); a(L(21) + 1.9, 'pop', 0.6); for (let k = 0; k < 4; k++) a(L(21) + 2.1 + k * 0.35, 'tick', 0.15); a(L(21) + 3.6, 'pop', 0.6);
a(L(22) + 0.1, 'rotor', 0.3, D(22) + D(23)); a(L(22) + 0.6, 'pop', 0.7); a(L(22) + 0.7, 'chime', 0.5);
a(L(23) + 0.5, 'pop', 0.7);
const out = c.filter(x => x.gain > 0);
require('fs').writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: false, cues: out }, null, 1));
console.log(out.length + ' cues');
