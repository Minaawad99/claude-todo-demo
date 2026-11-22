// Sound cues from the line timings: node cues.js → cues.json. Sound effects only, no music.
// Recorded sounds (sfx/px-*.mp3) are Pixabay sound effects (Pixabay Content License) the channel sent earlier
// (ding, wind gust, swipe from the sketch kit; cough, exhale, punch, siren from earlier episodes).
global.window = {}; eval(require('fs').readFileSync(__dirname + '/timing.js', 'utf8'));
const T = window.TIMING.lines, L = i => i >= T.length ? window.TIMING.duration : T[i].start, D = i => L(i + 1) - L(i), c = [];
const a = (t, fx, gain, dur) => c.push(Object.assign({ t: +t.toFixed(2), fx, gain }, dur ? { dur } : {}));
const rec = (t, file, gain, from, dur, duck) => c.push(Object.assign({ t: +Math.max(0, t).toFixed(2), file: 'sfx/px-' + file + '.mp3', gain: +(gain * 1.2).toFixed(2), from: from || 0 }, dur ? { dur: +dur.toFixed(2) } : {}, duck != null ? { duck } : {}));
for (let i = 1; i < T.length; i++) a(L(i) - 0.08, 'whoosh', 0.3);
a(L(0) + 0.3, 'thud', 0.3); a(L(0) + 1.7, 'thud', 0.3); a(L(0) + 3.0, 'clink', 0.4); a(L(0) + 3.05, 'pop', 0.5); rec(L(0) + 3.2, 'ding', 0.25, 0, 1.0, 1.0);
for (let k = 0; k < 4; k++) a(L(1) + 0.2 + k * 0.22, 'tick', 0.2); for (let k = 0; k < 3; k++) a(L(1) + 1.2 + k * 0.3, 'clank', 0.35); rec(L(1) + 2.0, 'punch', 0.3, 0, 0.5, 1.0); a(L(1) + 2.5, 'pop', 0.6);
a(L(2) + 0.2, 'motor', 0.2, 1.8); a(L(2) + 2.0, 'clank', 0.4); a(L(2) + 2.05, 'thud', 0.4); rec(L(2) + 2.7, 'ding', 0.3, 0, 1.0, 1.0);
a(L(3) + 1.0, 'boom', 0.35); a(L(3) + 1.4, 'clink', 0.45); a(L(3) + 1.5, 'pop', 0.6);
for (let k = 0; k < 7; k++) a(L(4) + 0.5 + k * 0.3, 'tick', 0.22); a(L(4) + 0.3, 'pop', 0.5); a(L(4) + 2.8, 'chime', 0.4);
a(L(5) + 0.3, 'boom', 0.35); rec(L(5) + 0.7, 'punch', 0.3, 0, 0.4, 1.0); a(L(5) + 0.8, 'pop', 0.6);
for (let k = 0; k < 5; k++) a(L(6) + 0.3 + k * 0.5, 'clank', 0.28); a(L(6) + 3.2, 'boom', 0.3); a(L(6) + 3.7, 'clank', 0.45); a(L(6) + 3.9, 'chime', 0.4);
a(L(7) + 0.1, 'creak', 0.4, 1.0); a(L(7) + 0.7, 'thud', 0.45); a(L(7) + 0.6, 'pop', 0.5);
a(L(8) + 0.3, 'servo', 0.25, 2.2); a(L(8) + 0.3, 'motor', 0.15, 2.2); a(L(8) + 2.6, 'chime', 0.4); for (let k = 0; k < 8; k++) a(L(8) + 3.0 + k * 0.12, 'pop', 0.3);
a(L(9) + 0.05, 'boom', 0.35); a(L(9) + 0.45, 'steam', 0.3, 1.2); a(L(9) + 0.7, 'pop', 0.6);
a(L(10) + 0.5, 'clank', 0.35); rec(L(10) + 1.0, 'ding', 0.25, 0, 1.0, 1.0); a(L(10) + 2.6, 'idle', 0.25, D(10) - 2.6);
a(L(11) + 0.0, 'motor', 0.2, 0.5); a(L(11) + 0.4, 'thud', 0.35); a(L(11) + 0.6, 'pop', 0.6);
a(L(12) + 0.3, 'clank', 0.4); a(L(12) + 1.4, 'rev', 0.3, 1.8); a(L(12) + 2.0, 'bump', 0.4); a(L(12) + 2.8, 'chime', 0.4);
a(L(13) + 0.0, 'sizzle', 0.35, D(13)); rec(L(13) + 0.6, 'cough', 0.3, 0.85, 1.3, 1.0); a(L(13) + 0.5, 'pop', 0.6);
a(L(14) + 0.9, 'spray', 0.35, 2.0); a(L(14) + 1.8, 'steam', 0.25, 1.4); rec(L(14) + 2.4, 'exhale', 0.3, 0, 1.2, 1.0); a(L(14) + 2.8, 'chime', 0.35);
a(L(15) + 0.4, 'creak', 0.3, 0.6); a(L(15) + 0.9, 'pop', 0.6);
for (let k = 0; k < 3; k++) a(L(16) + 0.3 + k * 0.2, 'pop', 0.4); a(L(16) + 1.8, 'clank', 0.35); a(L(16) + 2.6, 'chime', 0.35);
a(L(17) + 0.5, 'pop', 0.6); a(L(17) + 0.9, 'thud', 0.35);
a(L(18) + 0.9, 'thud', 0.4); a(L(18) + 0.95, 'clank', 0.3); for (let k = 0; k < 3; k++) a(L(18) + 1.5 + k * 0.4, 'beep', 0.2); a(L(18) + 3.0, 'chime', 0.4);
for (let k = 0; k < 5; k++) a(L(19) + 0.1 + k * 0.22, 'tick', 0.18); a(L(19) + 1.0, 'pop', 0.5);
a(L(20) + 0.8, 'snip', 0.4); a(L(20) + 0.85, 'splash', 0.4); a(L(20) + 0.9, 'spray', 0.3, 0.7); a(L(20) + 1.0, 'pop', 0.6); a(L(20) + 2.6, 'pop', 0.5);
a(L(21) + 0.1, 'rev', 0.35, 1.3); a(L(21) + 0.4, 'pop', 0.6);
a(L(22) + 0.4, 'notify', 0.35); a(L(22) + 1.4, 'beep', 0.22); a(L(22) + 2.2, 'beep', 0.22); a(L(22) + 3.0, 'thud', 0.3); rec(L(22) + 3.1, 'siren', 0.12, 0, 1.5, 1.2); a(L(22) + 3.3, 'chime', 0.35);
a(L(23) + 0.5, 'pop', 0.5); a(L(23) + 1.6, 'pop', 0.5); a(L(23) + 1.7, 'ping', 0.3); a(L(23) + 3.0, 'pop', 0.5);
a(L(24) + 0.1, 'bell', 0.4); rec(L(24) + 0.2, 'ding', 0.3, 0, 1.0, 1.0); for (let k = 0; k < 6; k++) a(L(24) + 0.3 + k * 0.3, 'pop', 0.3);
a(L(25) + 0.5, 'pop', 0.5);
require('fs').writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: false, cues: c }, null, 1));
console.log(c.length, 'cues');
