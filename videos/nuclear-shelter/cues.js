// Sound cues from the line timings: node cues.js → cues.json
// Recorded sounds in sfx/px-*.mp3 are Pixabay sound effects (Pixabay Content License) the channel sent for earlier episodes
// (a breeze, wind, thunder, a rumble, sand, a crane, a metal clang, a door, an anchor chain, a sonar ping, beeps, a ticking
// clock, a storm, a ding, a night street), kept out of git. No recorded sound plays in two shots in a row.
global.window = {}; eval(require('fs').readFileSync(__dirname + '/timing.js', 'utf8'));
const T = window.TIMING.lines, L = i => i >= T.length ? window.TIMING.duration : T[i].start, D = i => L(i + 1) - L(i), c = [];
const a = (t, fx, gain, dur) => c.push(Object.assign({ t: +t.toFixed(2), fx, gain }, dur ? { dur } : {}));
const rec = (t, file, gain, from, dur, duck) => c.push(Object.assign({ t: +Math.max(0, t).toFixed(2), file: 'sfx/px-' + file + '.mp3', gain: +(gain * 1.2).toFixed(2), from: from || 0 }, dur ? { dur: +dur.toFixed(2) } : {}, duck != null ? { duck } : {}));
const bed = (i, file, g, from) => rec(L(i), file, g, from, D(i) + 0.2, 1.2);
for (let i = 1; i < T.length; i++) a(L(i) - 0.08, 'whoosh', 0.3);
bed(0, 'breeze', 0.25, 5); rec(L(0) + 0.3, 'sand', 0.3, 0, 2.0, 1.0); a(L(0) + 2.0, 'pop', 0.7); a(L(0) + 3.0, 'thud', 0.3);
rec(L(1) + 0.3, 'thunder-clap', 0.22, 0, D(1) - 0.3, 0.8); a(L(1) + 0.3, 'boom', 0.4); a(L(1) + 1.6, 'pop', 0.7);
rec(L(2) + 0.2, 'crane', 0.3, 2, 2.4, 1.2); a(L(2) + 2.5, 'clank', 0.5); a(L(2) + 0.8, 'pop', 0.6); a(L(2) + 2.8, 'pop', 0.6);
rec(L(3), 'storm-ambience', 0.18, 0, D(3), 1.2); a(L(3) + 1.2, 'pop', 0.6);
rec(L(4), 'sand', 0.3, 2, D(4), 1.2); a(L(4) + 1.4, 'pop', 0.7);
for (let k = 0; k < 9; k++) a(L(5) + 0.4 + k * 0.3, 'tick', 0.18); a(L(5) + 0.6, 'pop', 0.6); a(L(5) + 1.2, 'pop', 0.5);
bed(6, 'breeze', 0.2, 40); a(L(6) + 1.2, 'pop', 0.8); a(L(6) + 2.0, 'chime', 0.4);
a(L(7) + 0.4, 'laser', 0.3); a(L(7) + 0.3, 'pop', 0.5); a(L(7) + 2.0, 'pop', 0.6); rec(L(7) + 2.0, 'beep', 0.25, 0, 0.8, 1.0);
rec(L(8) + 0.2, 'sand', 0.3, 4, 1.4, 1.2); a(L(8) + 1.0, 'pop', 0.7);
a(L(9) + 0.3, 'laser', 0.25); a(L(9) + 1.0, 'thud', 0.4); a(L(9) + 1.2, 'pop', 0.6); rec(L(9) + 1.2, 'ding', 0.3, 0, 1.1, 1.0);
bed(10, 'night-street', 0.15, 10); a(L(10) + 0.4, 'creak', 0.2); a(L(10) + 1.0, 'pop', 0.6);
a(L(11) + 0.4, 'clank', 0.3); a(L(11) + 1.6, 'pop', 0.5); a(L(11) + 2.2, 'motor', 0.25, 2.0); a(L(11) + 2.4, 'pop', 0.5);
rec(L(12) + 0.2, 'distant-thunder', 0.22, 0, D(12) - 0.2, 1.0); a(L(12) + 1.4, 'pop', 0.6);
a(L(13) + 1.2, 'clank', 0.6); rec(L(13) + 1.2, 'metal-clang', 0.35, 0, 1.2, 1.0); a(L(13) + 1.8, 'pop', 0.7);
rec(L(14) + 0.3, 'quake', 0.2, 0, D(14) - 0.3, 1.0); a(L(14) + 1.0, 'boom', 0.35); a(L(14) + 1.1, 'pop', 0.6);
rec(L(15) + 0.3, 'door', 0.35, 0, 1.4, 1.0); a(L(15) + 1.4, 'thud', 0.5); a(L(15) + 0.4, 'pop', 0.5); a(L(15) + 1.6, 'pop', 0.5);
rec(L(16) + 0.3, 'sand', 0.35, 1, 1.6, 1.2); for (let k = 0; k < 6; k++) a(L(16) + 0.4 + k * 0.2, 'thud', 0.2); a(L(16) + 1.6, 'pop', 0.7);
rec(L(17) + 0.3, 'anchor', 0.25, 2, 1.8, 1.2); a(L(17) + 1.9, 'pop', 0.7); a(L(17) + 2.0, 'chime', 0.35);
bed(18, 'wind', 0.3, 4); a(L(18) + 0.4, 'ping', 0.3); a(L(18) + 1.0, 'pop', 0.6);
for (let k = 0; k < 26; k++) a(L(19) + 0.2 + k * 0.12 + (k % 3) * 0.03, 'tick', 0.22 + (k % 4) * 0.04); a(L(19) + 0.6, 'pop', 0.7);
bed(20, 'night-street', 0.15, 40); a(L(20) + 0.6, 'pop', 0.7);
rec(L(21), 'clock-ticking', 0.3, 0, D(21), 1.2); a(L(21) + 0.2, 'pop', 0.5); a(L(21) + 1.6, 'pop', 0.6); a(L(21) + 3.0, 'pop', 0.7); a(L(21) + 3.1, 'chime', 0.35);
a(L(22) + 0.8, 'pop', 0.7); rec(L(22) + 0.8, 'ding', 0.3, 0, 1.1, 1.0);
for (let k = 0; k < 3; k++) a(L(23) + 0.2 + k * 0.9, 'pop', 0.6); a(L(23) + 1.2, 'clink', 0.3); a(L(23) + 2.0, 'tick', 0.3);
a(L(24) + 0.4, 'chime', 0.5); for (let k = 0; k < 5; k++) a(L(24) + 0.5 + k * 0.2, 'pop', 0.35);
rec(L(25), 'breeze', 0.25, 80, D(25) + 1.5, 1.0); a(L(25) + 0.4, 'pop', 0.7); a(L(25) + 0.5, 'chime', 0.5);
require('fs').writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: false, cues: c }, null, 1));
console.log(c.length + ' cues');
