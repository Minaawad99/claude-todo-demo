// Sound cues from the line timings: node cues.js → cues.json
// Recorded sounds in sfx/px-*.mp3 are Pixabay sound effects (Pixabay Content License) the channel sent for earlier episodes
// (pouring water, a tap, a light switch, sparks, a ticking clock, a ding, a breeze, wind, bubbles, a hum, a sizzle, a door,
// frying), kept out of git. No recorded sound plays in two shots in a row.
global.window = {}; eval(require('fs').readFileSync(__dirname + '/timing.js', 'utf8'));
const T = window.TIMING.lines, L = i => i >= T.length ? window.TIMING.duration : T[i].start, D = i => L(i + 1) - L(i), c = [];
const a = (t, fx, gain, dur) => c.push(Object.assign({ t: +t.toFixed(2), fx, gain }, dur ? { dur } : {}));
const rec = (t, file, gain, from, dur, duck) => c.push(Object.assign({ t: +Math.max(0, t).toFixed(2), file: 'sfx/px-' + file + '.mp3', gain: +(gain * 1.2).toFixed(2), from: from || 0 }, dur ? { dur: +dur.toFixed(2) } : {}, duck != null ? { duck } : {}));
const bed = (i, file, g, from) => rec(L(i), file, g, from, D(i) + 0.2, 1.2);
for (let i = 1; i < T.length; i++) a(L(i) - 0.08, 'whoosh', 0.3);
a(L(0) + 1.0, 'pop', 0.7); a(L(0) + 1.2, 'ping', 0.3); a(L(0) + 0.3, 'pop', 0.5);
rec(L(1) + 0.4, 'door', 0.3, 0, 1.4, 1.0); a(L(1) + 1.8, 'pop', 0.7); a(L(1) + 1.9, 'clank', 0.3);
a(L(2) + 0.05, 'pop', 0.9); a(L(2) + 0.2, 'chime', 0.5);
rec(L(3) + 0.3, 'pour', 0.35, 1, D(3) - 0.3, 1.2); a(L(3) + 0.4, 'pop', 0.5); a(L(3) + 1.6, 'pop', 0.6);
bed(4, 'electric-hum', 0.15, 2); a(L(4) + 0.3, 'pop', 0.5); a(L(4) + 0.9, 'pop', 0.5); a(L(4) + 1.6, 'pop', 0.6); a(L(4) + 0.5, 'fill', 0.25);
rec(L(5) + 0.3, 'tap', 0.4, 0, 1.0, 1.0); a(L(5) + 0.6, 'fill', 0.35); a(L(5) + 0.2, 'pop', 0.5);
a(L(6) + 0.6, 'slosh', 0.35); a(L(6) + 0.4, 'pop', 0.5); a(L(6) + 1.4, 'pop', 0.5); a(L(6) + 0.8, 'creak', 0.2);
a(L(7) + 0.6, 'clank', 0.3); a(L(7) + 0.7, 'spray', 0.2, 1.6); a(L(7) + 0.5, 'pop', 0.5); a(L(7) + 1.8, 'pop', 0.6);
for (let k = 0; k < 4; k++) a(L(8) + 0.4 + k * 0.25, 'zap', 0.25); rec(L(8) + 1.0, 'sizzle', 0.3, 2, D(8) - 1.0, 1.0); a(L(8) + 1.0, 'boom', 0.18); a(L(8) + 1.8, 'pop', 0.5);
a(L(9) + 0.4, 'pop', 0.5); a(L(9) + 1.6, 'pop', 0.5); for (let k = 0; k < 6; k++) a(L(9) + 0.6 + k * 0.2, 'clink', 0.14); a(L(9) + 0.2, 'spray', 0.15, D(9) - 0.4);
rec(L(10), 'bubbles', 0.3, 30, D(10), 1.2); a(L(10) + 0.4, 'pop', 0.5); a(L(10) + 1.6, 'pop', 0.5);
for (let k = 0; k < 8; k++) a(L(11) + 0.3 + k * 0.18, 'tick', 0.2); rec(L(11) + 1.4, 'ding', 0.35, 0, 1.1, 1.0); a(L(11) + 1.4, 'pop', 0.7);
rec(L(12) + 0.5, 'tap', 0.4, 0, 1.0, 1.0); a(L(12) + 1.0, 'thud', 0.3); a(L(12) + 1.4, 'pop', 0.6);
a(L(13) + 0.4, 'ping', 0.3); a(L(13) + 0.2, 'pop', 0.5);
a(L(14) + 0.5, 'charge', 0.3); a(L(14) + 1.0, 'pop', 0.8); a(L(14) + 2.0, 'chime', 0.3);
a(L(15) + 0.3, 'pop', 0.6); a(L(15) + 0.6, 'charge', 0.25); a(L(15) + 1.6, 'pop', 0.7);
rec(L(16), 'pour', 0.25, 2, D(16), 1.2); a(L(16) + 1.0, 'pop', 0.6);
rec(L(17), 'clock-ticking', 0.3, 0, D(17), 1.2); a(L(17) + 0.4, 'pop', 0.6); a(L(17) + 1.8, 'pop', 0.7);
bed(18, 'wind', 0.35, 4); a(L(18) + 0.3, 'pop', 0.6); a(L(18) + 1.2, 'pop', 0.5); a(L(18) + 0.6, 'clink', 0.2);
rec(L(19) + 0.2, 'pour', 0.3, 2, D(19) - 0.2, 1.2); a(L(19) + 1.4, 'pop', 0.7); a(L(19) + 0.6, 'creak', 0.2);
rec(L(20), 'frying', 0.15, 10, D(20), 1.2); a(L(20) + 0.3, 'pop', 0.5); a(L(20) + 1.2, 'pop', 0.5); a(L(20) + 1.5, 'pop', 0.5); a(L(20) + 2.0, 'pop', 0.6);
a(L(21) + 0.8, 'charge', 0.25); a(L(21) + 1.2, 'pop', 0.7); rec(L(21) + 1.2, 'ding', 0.3, 0, 1.1, 1.0);
bed(22, 'breeze', 0.3, 20); a(L(22) + 0.4, 'pop', 0.6); a(L(22) + 1.6, 'pop', 0.5);
a(L(23) + 0.8, 'pop', 0.8); a(L(23) + 1.4, 'pop', 0.6); a(L(23) + 0.9, 'boom', 0.15);
rec(L(24), 'clock-ticking', 0.25, 2, D(24), 1.2); a(L(24) + 0.3, 'pop', 0.6); a(L(24) + 1.4, 'pop', 0.7); a(L(24) + 1.5, 'chime', 0.35);
rec(L(25), 'pour', 0.25, 2, D(25) + 1.5, 1.0); a(L(25) + 0.4, 'pop', 0.7); a(L(25) + 0.5, 'chime', 0.5);
require('fs').writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: false, cues: c }, null, 1));
console.log(c.length + ' cues');
