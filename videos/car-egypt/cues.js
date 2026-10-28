// Sound cues from the line timings: node cues.js → cues.json
// Recorded sounds in sfx/px-*.mp3 are Pixabay sound effects (Pixabay Content License) downloaded by the channel and kept out of
// git; short UI sounds (whoosh, pop, tick, chime) stay synthesized.
global.window = {}; eval(require('fs').readFileSync(__dirname + '/timing.js', 'utf8'));
const T = window.TIMING.lines, L = i => i >= T.length ? window.TIMING.duration : T[i].start, D = i => L(i + 1) - L(i), c = [];
const a = (t, fx, gain, dur) => c.push(Object.assign({ t: +t.toFixed(2), fx, gain }, dur ? { dur } : {}));
const rec = (t, file, gain, from, dur) => c.push(Object.assign({ t: +Math.max(0, t).toFixed(2), file: 'sfx/px-' + file + '.mp3', gain, from: from || 0 }, dur ? { dur: +dur.toFixed(2) } : {}));
let eo = 0; const engine = (i, gain) => { c.push({ t: +L(i).toFixed(2), file: 'sfx/px-old-engine-running.mp3', gain: +(gain * 0.6).toFixed(2), from: 6 + (eo * 2.3) % 11, dur: +(D(i) + 0.3).toFixed(2), duck: 1.8 }); eo++; };   // the running-engine bed sits well under the voice (it carries room tone)   // steady running engine, a different stretch each time
for (let i = 1; i < T.length; i++) a(L(i) - 0.08, 'whoosh', 0.35);
rec(L(0) + 0.2, 'car-pass', 0.8); engine(0, 0.45); for (let k = 0; k < 10; k++) a(L(0) + 2.4 + k * 0.16, 'tick', 0.25); a(L(0) + 1.4, 'pop', 0.6);
rec(L(1), 'engine-roar', 0.9, 0, D(1) + 0.3); a(L(1) + 0.2, 'pop', 0.5);
a(L(2) + 0.2, 'thud', 0.5); a(L(2) + 0.6, 'pop', 0.6); a(L(2) + 0.9, 'pop', 0.6); engine(2, 0.3);
a(L(3) + 0.05, 'pop', 0.9); a(L(3) + 0.2, 'chime', 0.5); engine(3, 0.3);
a(L(4) + 0.3, 'clank', 0.4); rec(L(4) + 0.75, 'electricity', 0.35, 0, 1.0); rec(L(4) + 0.6, 'start-accelerate', 0.9, 1.2, D(4) - 0.5); a(L(4) + 1.0, 'pop', 0.6); a(L(4) + 1.6, 'pop', 0.5);
engine(5, 0.6); a(L(5) + 0.5, 'pop', 0.5); a(L(5) + 1.4, 'pop', 0.6);
engine(6, 0.45); { const P = 1 / 0.6 / 2; for (let t = L(6); t < L(7) - 0.2; t += 0.1) { const ang = (t * 360 * 0.6) % 720; if (ang >= 360 && ang < 381.6) rec(t, 'sparks', 0.35, 4, 0.3); } } a(L(6) + 1.6, 'pop', 0.6);
engine(7, 0.35); a(L(7), 'intake', 0.5); a(L(7) + 1.4, 'spray', 0.4); a(L(7) + 0.4, 'pop', 0.5); a(L(7) + 1.4, 'pop', 0.5);
engine(8, 0.35); a(L(8) + 0.2, 'squeeze', 0.45); a(L(8) + 0.6, 'pop', 0.6);
rec(L(9) + 0.25, 'sparks', 0.6, 2, 0.5); a(L(9) + 0.4, 'boom', 0.8); rec(L(9) + 0.45, 'engine-roar', 0.6, 0.2, 1.8); a(L(9) + 0.2, 'pop', 0.5); a(L(9) + 0.5, 'pop', 0.7);
engine(10, 0.35); a(L(10) + 0.5, 'pop', 0.6); a(L(10) + 1.6, 'pop', 0.5);
engine(11, 0.4); a(L(11) + 0.3, 'exhaust', 0.45); a(L(11) + 0.6, 'pop', 0.6);
rec(L(12), 'revving', 0.9, 0.8, D(12) + 0.2); for (let k = 0; k < 10; k++) a(L(12) + 0.6 + k * 0.14, 'tick', 0.25);
engine(13, 0.3); a(L(13) + 0.4, 'pop', 0.5);
engine(14, 0.4); a(L(14) + 0.4, 'pop', 0.6); a(L(14) + 1.8, 'pop', 0.6);
rec(L(15), 'gear-shift', 0.7, 0, D(15) + 0.3); a(L(15) + 0.4, 'pop', 0.6);
rec(L(16), 'gear-change', 0.7, 0.5, D(16) + 0.2); a(L(16) + 0.4, 'pop', 0.5); a(L(16) + 1.6, 'pop', 0.5);
rec(L(17) - 0.6, 'car-pass', 0.7); engine(17, 0.35); a(L(17) + 0.5, 'pop', 0.6); a(L(17) + 1.4, 'pop', 0.5);
rec(L(18) - 1.0, 'car-passing-2', 0.8, 0.5, D(18) + 1.0); a(L(18) + 1.2, 'pop', 0.6); a(L(18) + 2.0, 'pop', 0.5);
rec(L(19), 'old-car', 0.7, 0, D(19)); for (let k = 0; k < 8; k++) a(L(19) + 0.1 + k * 0.2, 'tick', 0.3); a(L(19) + 1.0, 'pop', 0.6); a(L(19) + 1.6, 'chime', 0.4);
rec(L(20), 'old-car', 0.5, 0.5, D(20)); a(L(20) + 0.8, 'pop', 0.5);
a(L(21) + 0.5, 'pop', 0.5); a(L(21) + 0.6, 'clink', 0.4); a(L(21) + 1.9, 'pop', 0.6); a(L(21) + 2.6, 'creak', 0.3); rec(L(21) + 2.9, 'old-car', 0.5, 2, D(21) - 2.9);
engine(22, 0.35); a(L(22) + 0.3, 'pop', 0.5); a(L(22) + 0.8, 'pop', 0.5); a(L(22) + 1.3, 'pop', 0.5);
rec(L(23) + 0.2, 'revving', 1.0, 2.5, D(23)); a(L(23) + 1.2, 'pop', 0.6);
a(L(24) + 0.2, 'pop', 0.7); a(L(24) + 0.3, 'notify', 0.5); rec(L(24), 'car-pass', 0.4);
require('fs').writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: true, cues: c }, null, 1)); console.log(c.length, 'cues');
