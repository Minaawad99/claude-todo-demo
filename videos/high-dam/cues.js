// Sound cues from the line timings: node cues.js → cues.json
// Recorded sounds in sfx/px-*.mp3 are Pixabay sound effects (Pixabay Content License) downloaded by the channel and kept out of
// git; short UI sounds (whoosh, pop, tick, chime) stay synthesized.
global.window = {}; eval(require('fs').readFileSync(__dirname + '/timing.js', 'utf8'));
const T = window.TIMING.lines, L = i => i >= T.length ? window.TIMING.duration : T[i].start, D = i => L(i + 1) - L(i), c = [];
const a = (t, fx, gain, dur) => c.push(Object.assign({ t: +t.toFixed(2), fx, gain }, dur ? { dur } : {}));
const rec = (t, file, gain, from, dur) => c.push(Object.assign({ t: +Math.max(0, t).toFixed(2), file: 'sfx/px-' + file + '.mp3', gain, from: from || 0 }, dur ? { dur: +dur.toFixed(2) } : {}));
const off = {}; const bed = (i, file, gain, len) => { const o = off[file] || 0; off[file] = o + 1; rec(L(i), file, gain, 1 + (o * 3.7) % Math.max(1, len - D(i) - 2), D(i) + 0.3); };   // a different stretch each time
for (let i = 1; i < T.length; i++) a(L(i) - 0.08, 'whoosh', 0.35);
rec(L(0) + 0.95, 'light-switch', 0.9); bed(0, 'electric-hum', 0.25, 21); a(L(0) + 2.4, 'pop', 0.6);
bed(1, 'dam-water', 0.6, 31); rec(L(1) + 1.0, 'sparks', 0.5, 2, 0.8); a(L(1) + 0.4, 'pop', 0.5);
bed(2, 'power-buzz', 0.35, 9.8); a(L(2) + 1.0, 'pop', 0.6); for (let k = 0; k < 6; k++) a(L(2) + 0.4 + k * 0.4, 'tick', 0.2);
a(L(3) + 0.05, 'pop', 0.9); a(L(3) + 0.2, 'chime', 0.5); bed(3, 'generator', 0.35, 15.6);
bed(4, 'dam-water', 0.45, 31); a(L(4) + 0.4, 'wind', 0.25, D(4) - 0.6); for (let k = 0; k < 8; k++) a(L(4) + 0.4 + k * 0.1, 'tick', 0.25); a(L(4) + 1.8, 'pop', 0.6); a(L(4) + 2.6, 'pop', 0.6);
a(L(5), 'wind', 0.35, D(5)); bed(5, 'dam-water', 0.25, 31); for (let k = 0; k < 10; k++) a(L(5) + 0.8 + k * 0.16, 'tick', 0.25); a(L(5) + 0.4, 'pop', 0.6); a(L(5) + 1.4, 'pop', 0.5);
bed(6, 'dam-water', 0.6, 31); a(L(6) + 0.4, 'beep', 0.3); a(L(6) + 1.8, 'pop', 0.7); a(L(6) + 1.9, 'chime', 0.4);
bed(7, 'dam-water', 1.0, 31); a(L(7) + 0.4, 'pop', 0.6);
bed(8, 'dam-water', 0.7, 31); bed(8, 'generator', 0.6, 15.6); a(L(8) + 0.6, 'pop', 0.6); a(L(8) + 1.8, 'pop', 0.5);
bed(9, 'generator', 0.9, 15.6); a(L(9) + 0.2, 'pop', 0.5); a(L(9) + 0.5, 'pop', 0.5); a(L(9) + 1.0, 'pop', 0.6);
bed(10, 'generator', 0.8, 15.6); bed(10, 'electric-hum', 0.4, 21); a(L(10) + 0.5, 'pop', 0.6); a(L(10) + 1.4, 'pop', 0.6);
bed(11, 'electric-hum', 0.4, 21); { const P = Math.PI / 2.4; for (let t = Math.ceil(L(11) / P) * P; t < L(12) - 0.2; t += P) rec(t - 0.05, 'sparks', 0.45, 3 + (t % 5), 0.35); } a(L(11) + 0.8, 'pop', 0.6);
for (let k = 0; k < 8; k++) a(L(12) + 0.1 + k * 0.17, 'tick', 0.3); { const P = Math.PI / 3.2; for (let t = Math.ceil(L(12) / P) * P; t < L(13) - 0.2; t += P) rec(t, 'sparks', 0.25, 6, 0.25); } a(L(12) + 0.6, 'pop', 0.6); a(L(12) + 2.0, 'pop', 0.6);
bed(13, 'dam-water', 0.8, 31); bed(13, 'generator', 0.5, 15.6); for (let k = 0; k < 12; k++) a(L(13) + 0.05 + k * 0.25, 'tick', 0.3);
bed(14, 'generator', 0.35, 15.6); for (let k = 0; k < 8; k++) a(L(14) + 0.1 + k * 0.14, 'tick', 0.25); a(L(14) + 1.2, 'pop', 0.6); a(L(14) + 2.4, 'pop', 0.7); a(L(14) + 2.5, 'chime', 0.45);
bed(15, 'power-buzz', 0.6, 9.8); a(L(15), 'wind', 0.3, D(15)); a(L(15) + 1.6, 'sizzle', 0.25); a(L(15) + 1.6, 'pop', 0.6);
bed(16, 'electric-hum', 0.9, 21); bed(16, 'power-buzz', 0.4, 9.8); rec(L(16) + 2.4, 'sparks', 0.6, 1, 1.2); a(L(16) + 0.4, 'pop', 0.6);
bed(17, 'power-buzz', 0.35, 9.8); a(L(17) + 0.4, 'sizzle', 0.3); a(L(17) + 0.4, 'pop', 0.6); a(L(17) + 1.6, 'pop', 0.6);
bed(18, 'power-buzz', 0.8, 9.8); a(L(18), 'wind', 0.3, D(18)); a(L(18) + 0.4, 'pop', 0.6); a(L(18) + 1.7, 'pop', 0.5); a(L(18) + 2.2, 'pop', 0.5);
bed(19, 'electric-hum', 0.7, 21); for (let k = 0; k < 5; k++) a(L(19) + k * D(19) / 5.2 + 0.05, 'clank', 0.4); a(L(19) + 0.6, 'pop', 0.6);
bed(20, 'night-street', 0.9, 85); bed(20, 'electric-hum', 0.35, 21); for (let k = 0; k < 8; k++) a(L(20) + 0.6 + k * 0.2, 'tick', 0.22); a(L(20) + 0.4, 'pop', 0.6);
bed(21, 'clock-ticking', 0.5, 8.1); rec(L(21) + 2.35, 'light-switch', 0.8); a(L(21) + 0.3, 'pop', 0.5); a(L(21) + 1.0, 'pop', 0.5); a(L(21) + 2.2, 'pop', 0.6);
bed(22, 'generator', 0.4, 15.6); bed(22, 'electric-hum', 0.4, 21); a(L(22) + 0.3, 'pop', 0.5); a(L(22) + 0.6, 'pop', 0.5); a(L(22) + 1.6, 'pop', 0.7);
rec(L(23) + 0.05, 'light-switch', 0.7); bed(23, 'generator', 0.5, 15.6); a(L(23) + 0.6, 'pop', 0.6); a(L(23) + 1.4, 'pop', 0.7);
a(L(24) + 0.2, 'pop', 0.7); a(L(24) + 0.3, 'notify', 0.5);
require('fs').writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: true, cues: c }, null, 1)); console.log(c.length, 'cues');
