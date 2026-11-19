// Sound cues from the line timings: node cues.js → cues.json. Sound effects only, no music.
// The diesel blows are timed to the hammer cycle in law/scene.js (hammerCycle(t, 0.83): impact when (t·0.83) mod 1 = 0).
// Recorded clips (sfx/px-*.mp3): Pixabay sound effects from the sketch kit (a ding, rushing water).
global.window = {}; eval(require('fs').readFileSync(__dirname + '/timing.js', 'utf8'));
const T = window.TIMING.lines, L = i => i >= T.length ? window.TIMING.duration : T[i].start, D = i => L(i + 1) - L(i), c = [];
const a = (t, fx, gain, dur) => c.push(Object.assign({ t: +t.toFixed(2), fx, gain }, dur ? { dur } : {}));
const rec = (t, file, gain, from, dur, duck) => c.push(Object.assign({ t: +Math.max(0, t).toFixed(2), file: 'sfx/px-' + file + '.mp3', gain: +(gain * 1.2).toFixed(2), from: from || 0 }, dur ? { dur: +dur.toFixed(2) } : {}, duck != null ? { duck } : {}));
// diesel blows between t0 and t1 (absolute), gain g: a boom + a clank at each impact
const blows = (t0, t1, g) => { for (let k = Math.ceil(t0 * 0.83); k / 0.83 < t1; k++) { const t = k / 0.83; a(t, 'boom', 0.28 * g); a(t + 0.01, 'clank', 0.32 * g); } };
for (let i = 1; i < T.length; i++) a(L(i) - 0.08, 'whoosh', 0.28);
for (let k = 0; k < 4; k++) { a(L(0) + 0.8 + k, 'clank', 0.35); a(L(0) + 0.82 + k, 'tick', 0.3); } a(L(0) + 4.3, 'pop', 0.6);
a(L(1) + 0.4, 'creak', 0.4); a(L(1) + 0.9, 'boom', 0.22); a(L(1) + 1.6, 'thud', 0.4); a(L(1) + 2.0, 'pop', 0.6);
for (let k = 0; k < 5; k++) a(L(2) + 0.6 + k * 0.45, 'thud', 0.25); a(L(2) + 1.6, 'pop', 0.6); a(L(2) + 2.4, 'chime', 0.4);
for (let k = 0; k < 3; k++) a(L(3) + 0.5 + k * 0.6, 'tick', 0.3); a(L(3) + 0.6, 'pop', 0.6); a(L(3) + 1.8, 'pop', 0.6);
a(L(4) + 0.3, 'creak', 0.35); a(L(4) + 0.6, 'pop', 0.5); for (let k = 0; k < 3; k++) { a(L(4) + 0.4 + k * 2, 'servo', 0.15, 1.2); a(L(4) + 1.6 + k * 2, 'thud', 0.5); }
a(L(5) + 0.4, 'servo', 0.12, 2.6); a(L(5) + 1.0, 'pop', 0.6); a(L(5) + 2.8, 'thud', 0.45);
a(L(6) + 0.6, 'motor', 0.25, D(6) - 0.6); a(L(6) + 0.6, 'pop', 0.6); for (let k = 0; k < 3; k++) a(L(6) + 0.9 + k * 1.1, 'thud', 0.45);
a(L(7) + 0.3, 'whoosh', 0.35); a(L(7) + 1.0, 'clank', 0.5); a(L(7) + 1.2, 'creak', 0.4); a(L(7) + 1.6, 'pop', 0.6);
for (let k = 0; k < 4; k++) a(L(8) + 0.3 + k * 0.4, 'clank', 0.2); a(L(8) + 1.2, 'pop', 0.6); a(L(8) + 2.2, 'chime', 0.35);
a(L(9) + 0.9, 'thud', 0.6); a(L(9) + 0.95, 'snip', 0.4); a(L(9) + 1.0, 'pop', 0.6);
a(L(10) + 0.5, 'clank', 0.45); a(L(10) + 0.8, 'pop', 0.6); a(L(10) + 1.8, 'chime', 0.35);
a(L(11) + 0.3, 'motor', 0.18, D(11) - 0.4); a(L(11) + 1.0, 'pop', 0.6); a(L(11) + 2.6, 'thud', 0.35);
a(L(12) + 0.4, 'servo', 0.2, 1.2); a(L(12) + 1.7, 'clank', 0.45); a(L(12) + 1.6, 'pop', 0.5); a(L(12) + 2.0, 'pop', 0.5);
a(L(13) + 1.0, 'steam', 0.2, 2.0); a(L(13) + 2.6, 'spray', 0.25); a(L(13) + L(13) * 0 + 3.2, 'boom', 0.5); a(L(13) + 1.2, 'pop', 0.5);
blows(L(14), L(15), 1); a(L(14) + 1.4, 'pop', 0.5);
blows(L(15), L(15) + 2.0, 0.6); a(L(15) + 2.3, 'thud', 0.4); a(L(15) + 2.4, 'pop', 0.6);
for (let k = 0; k < 2; k++) a(L(16) + 0.8 + k * 2, 'thud', 0.5); blows(L(16) + 2.6, L(17), 1); a(L(16) + 2.7, 'pop', 0.6);
blows(L(17), L(18), 0.5); a(L(17) + 0.6, 'pop', 0.6);
rec(L(18) + 0.2, 'water-rush', 0.18, 3, D(18) - 0.2, 1.2); a(L(18) + 0.4, 'pop', 0.6); a(L(18) + 1.6, 'pop', 0.5);
a(L(19) + 0.6, 'pop', 0.7); rec(L(19) + 0.7, 'ding', 0.3, 0, 1.1, 1.0);
blows(L(20), L(21), 0.7); for (let k = 0; k < 6; k++) a(L(20) + 0.6 + k * 0.5, 'beep', 0.12);
blows(L(21), L(22), 0.45); a(L(21) + 0.4, 'pop', 0.5); a(L(21) + 1.0, 'pop', 0.5); a(L(21) + 2.1, 'pop', 0.5);
a(L(22) + 0.4, 'chime', 0.5); for (let k = 0; k < 6; k++) a(L(22) + 0.3 + k * 0.25, 'pop', 0.35);
a(L(23) + 0.4, 'pop', 0.7); a(L(23) + 0.5, 'chime', 0.5);
require('fs').writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: false, cues: c }, null, 1));
console.log(c.length + ' cues');
