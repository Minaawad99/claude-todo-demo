// Sound cues from the line timings: node cues.js → cues.json
// Recorded sounds in sfx/px-*.mp3 are Pixabay sound effects (Pixabay Content License) downloaded by the channel and kept out of
// git; short UI sounds (whoosh, pop, tick, chime) stay synthesized.
global.window = {}; eval(require('fs').readFileSync(__dirname + '/timing.js', 'utf8'));
const T = window.TIMING.lines, L = i => i >= T.length ? window.TIMING.duration : T[i].start, D = i => L(i + 1) - L(i), c = [];
const a = (t, fx, gain, dur) => c.push(Object.assign({ t: +t.toFixed(2), fx, gain }, dur ? { dur } : {}));
const rec = (t, file, gain, from, dur) => c.push(Object.assign({ t: +Math.max(0, t).toFixed(2), file: 'sfx/px-' + file + '.mp3', gain, from: from || 0 }, dur ? { dur: +dur.toFixed(2) } : {}));
let ro = 0; const river = (i, gain) => { rec(L(i), 'river', gain, 3 + (ro * 7.1) % 55, D(i) + 0.3); ro++; };   // a different stretch of the river each time
for (let i = 1; i < T.length; i++) a(L(i) - 0.08, 'whoosh', 0.35);
rec(L(0), 'traffic-bridge', 0.9, 20, D(0) + 0.2); river(0, 0.6); a(L(0) + 0.6, 'pop', 0.6);
river(1, 0.9); rec(L(1), 'bubbles', 0.5, 5, D(1)); a(L(1) + 0.4, 'pop', 0.6);
rec(L(2), 'bubbles', 0.7, 20, D(2)); river(2, 0.5); a(L(2) + 0.6, 'pop', 0.6);
a(L(3) + 0.05, 'pop', 0.9); a(L(3) + 0.2, 'chime', 0.5);
river(4, 0.5); a(L(4) + 0.3, 'motor', 0.3, D(4) - 0.6); for (let k = 0; k < 10; k++) a(L(4) + 0.5 + k * 0.4, 'tick', 0.25); a(L(4) + 2.4, 'pop', 0.6);
{ const beat = 0.42; for (let t = Math.ceil(L(5) / beat) * beat; t < L(6) - 0.1; t += beat) rec(t, 'metal-clang', 0.55, 0, 0.45);   // the hammer hits on the beat the drawing uses
  river(5, 0.4); rec(L(5), 'crane', 0.4, 2, D(5)); a(L(5) + 0.4, 'pop', 0.6); a(L(5) + 2.2, 'pop', 0.6); }
{ const q = D(6) / 3; river(6, 0.4); a(L(6), 'motor', 0.35, q); rec(L(6) + q + 0.2, 'metal-clang', 0.4, 0, 0.8); rec(L(6) + 2 * q, 'concrete-mixer', 0.8, 2, q); for (let k = 0; k < 3; k++) a(L(6) + k * q + 0.1, 'pop', 0.6); }
river(7, 0.5); rec(L(7) + 1.1, 'metal-clang', 0.6, 0, 1.2); rec(L(7) + 1.75, 'metal-clang', 0.5, 0, 1.2); a(L(7) + 0.5, 'pop', 0.6); a(L(7) + 1.6, 'pop', 0.5);
rec(L(8), 'water-pump', 1.0, 5, D(8)); river(8, 0.3); a(L(8) + D(8) - 1.6, 'pop', 0.6);
river(9, 0.5); rec(L(9) + 1.5, 'crane', 0.7, 6, 1.8); rec(L(9) + 2.6, 'rock-splash-2', 0.4); a(L(9) + 0.3, 'pop', 0.7);
rec(L(10), 'concrete-mixer', 0.8, 6, D(10)); rec(L(10), 'bubbles', 0.4, 40, D(10)); river(10, 0.3); a(L(10) + 0.6, 'pop', 0.6);
rec(L(11), 'bubbles', 0.6, 60, D(11)); rec(L(11), 'concrete-mixer', 0.4, 12, D(11)); a(L(11) + 0.5, 'pop', 0.6); a(L(11) + 1.8, 'pop', 0.5);
rec(L(12), 'bubbles', 0.35, 90, D(12)); a(L(12) + 0.4, 'pop', 0.6); a(L(12) + 0.8, 'fizz', 0.3); a(L(12) + 2.2, 'pop', 0.6); a(L(12) + 2.3, 'chime', 0.4);
for (let k = 0; k < 8; k++) a(L(13) + 0.1 + k * 0.17, 'tick', 0.3); rec(L(13), 'bubbles', 0.8, 120, D(13)); river(13, 0.35); a(L(13) + 0.6, 'pop', 0.6); a(L(13) + 1.8, 'pop', 0.6);
rec(L(14), 'bubbles', 0.5, 150, D(14)); a(L(14) + 1.0, 'pop', 0.6); a(L(14) + 2.0, 'pop', 0.5);
a(L(15) + 0.5, 'pop', 0.6); for (let k = 0; k < 4; k++) a(L(15) + 0.8 + k * 1.0, 'paper', 0.3); a(L(15) + D(15) - 1.4, 'pop', 0.6); a(L(15) + D(15) - 1.3, 'chime', 0.4);
river(16, 0.6); a(L(16) + 0.2, 'thud', 0.4); a(L(16) + 2.0, 'pop', 0.6);
river(17, 0.5); for (let k = 0; k < 4; k++) rec(L(17) + 0.8 + k * 0.5, k % 2 ? 'rock-splash-2' : 'rock-splash', 0.55); a(L(17) + 0.2, 'pop', 0.5); a(L(17) + 1.2, 'pop', 0.6);
rec(L(18), 'crane', 0.9, 1, D(18)); river(18, 0.35); rec(L(18) + D(18) - 0.6, 'metal-clang', 0.5, 0, 1.0); a(L(18) + 0.5, 'pop', 0.6);
{ const seg = D(19) / 6.5; rec(L(19), 'crane', 0.7, 8, D(19)); for (let k = 0; k < 6; k++) { rec(L(19) + k * seg + 0.02, 'metal-clang', 0.35, 0, 0.6); rec(L(19) + (k + 0.5) * seg, 'metal-clang', 0.3, 0, 0.6); }
  a(L(19) + 0.4, 'pop', 0.5); a(L(19) + 0.9, 'pop', 0.5); a(L(19) + 1.6, 'pop', 0.6); }
rec(L(20) + 1.35, 'metal-clang', 0.6, 0, 1.4); a(L(20) + 1.7, 'servo', 0.4); river(20, 0.4); a(L(20) + 1.2, 'pop', 0.6); a(L(20) + 2.0, 'pop', 0.5);
rec(L(21), 'traffic-bridge', 0.6, 40, D(21)); a(L(21) + 0.4, 'pop', 0.6);
rec(L(22), 'traffic-bridge', 0.6, 60, D(22)); river(22, 0.45); for (let k = 0; k < 8; k++) a(L(22) + 0.8 + k * 0.17, 'tick', 0.25); a(L(22) + 2.0, 'chime', 0.5); a(L(22) + 2.0, 'pop', 0.7); a(L(22) + 0.4, 'pop', 0.6);
river(23, 0.6); rec(L(23), 'traffic-bridge', 0.35, 75, D(23)); a(L(23) + 0.6, 'pop', 0.5); a(L(23) + 1.6, 'pop', 0.5); a(L(23) + 2.0, 'pop', 0.6);
a(L(24) + 0.2, 'pop', 0.7); a(L(24) + 0.3, 'notify', 0.5);
require('fs').writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: true, cues: c }, null, 1)); console.log(c.length, 'cues');
