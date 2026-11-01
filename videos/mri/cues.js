// Sound cues from the line timings: node cues.js → cues.json
// Recorded sounds go in sfx/px-<name>.mp3 (Pixabay clips the user sends; gitignored). Until a clip is there, its cue falls
// back to a synthesized effect from audio/sfx.py, so the mix always builds.
const fs = require('fs');
global.window = {}; eval(fs.readFileSync(__dirname + '/timing.js', 'utf8'));
const T = window.TIMING.lines, L = i => i >= T.length ? window.TIMING.duration : T[i].start, D = i => L(i + 1) - L(i), c = [];
const a = (t, fx, gain, dur) => c.push(Object.assign({ t: +t.toFixed(2), fx, gain }, dur ? { dur: +dur.toFixed(2) } : {}));
const has = n => fs.existsSync(__dirname + '/sfx/px-' + n + '.mp3');
// rec: a recorded clip if present, else the fallback synth effect
const rec = (t, n, gain, from, dur, fb) => has(n) ? c.push(Object.assign({ t: +Math.max(0, t).toFixed(2), file: 'sfx/px-' + n + '.mp3', gain: +(gain * 1.2).toFixed(2), from: from || 0, duck: 1.2 }, dur ? { dur: +dur.toFixed(2) } : {})) : fb && a(t, fb[0], fb[1], fb[2] || dur);
const mri = (i, g, from) => rec(L(i), 'mri', g, from || 0, D(i) + 0.1, ['motor', g * 0.8]);
for (let i = 1; i < T.length; i++) a(L(i) - 0.08, 'whoosh', 0.3);
// 0: hospital room, the table slides in
rec(L(0), 'hospital', 0.25, 2, D(0), ['hum', 0.12]); a(L(0) + 0.4, 'servo', 0.3, 2.0); a(L(0) + 1.2, 'pop', 0.7);
// 1: the knocking
mri(1, 0.45, 2); rec(L(1) + 0.6, 'hammer', 0.25, 0, 1.6, ['thud', 0.35]); a(L(1) + 0.2, 'pop', 0.7);
// 2: metal into the tray
for (let k = 0; k < 4; k++) a(L(2) + 0.5 + k * D(2) * 0.2, 'clink', 0.35); a(L(2) + 0.4, 'pop', 0.6); a(L(2) + 1.6, 'pop', 0.5);
// 3: brand
a(L(3) + 0.05, 'pop', 0.9); a(L(3) + 0.2, 'chime', 0.5);
// 4: a giant magnet, ×30,000
a(L(4) + 0.2, 'hum', 0.25, D(4) - 0.3); a(L(4) + 0.3, 'pop', 0.6); for (let k = 0; k < 10; k++) a(L(4) + 1.0 + k * 0.16, 'tick', 0.15); a(L(4) + 2.6, 'ping', 0.35);
// 5: always on, at night
a(L(5) + 0.1, 'hum', 0.3, D(5)); a(L(5) + 0.5, 'pop', 0.6); a(L(5) + 1.6, 'pop', 0.5);
// 6: metal gets pulled
rec(L(6) + 0.3, 'magnet', 0.4, 1.4, 1.4, ['whoosh', 0.5]); rec(L(6) + D(6) * 0.78, 'metal', 0.45, 0, 1.2, ['clank', 0.6]); a(L(6) + 0.8, 'pop', 0.7);
// 7: chairs and oxygen tanks stuck
rec(L(7) + 0.2, 'magnet', 0.35, 1.4, 1.0, ['whoosh', 0.4]); rec(L(7) + D(7) * 0.6, 'metal', 0.45, 0, 1.2, ['clank', 0.6]); a(L(7) + 0.3, 'pop', 0.6); a(L(7) + 1.1, 'pop', 0.6);
// 8: the card wiped
a(L(8) + 0.3, 'whoosh', 0.3); rec(L(8) + D(8) * 0.75, 'error', 0.4, 0, 1.0, ['beep', 0.4]); a(L(8) + D(8) * 0.75, 'zap', 0.3); a(L(8) + D(8) * 0.75, 'pop', 0.7);
// 9–12: the water, tiny magnets, the push and the signal
for (let k = 0; k < 4; k++) a(L(9) + 0.3 + k * 0.4, 'plunk', 0.3); a(L(9) + 0.4, 'pop', 0.6); a(L(9) + 1.4, 'pop', 0.5);
a(L(10) + 0.2, 'spin', 0.3, D(10) - 0.4); a(L(10) + 0.6, 'pop', 0.6);
a(L(11) + 0.3, 'pop', 0.6); a(L(11) + 0.4, 'servo', 0.3, 1.4); a(L(11) + 1.6, 'chime', 0.35); a(L(11) + 1.6, 'pop', 0.5);
a(L(12) + 0.2, 'laser', 0.35); a(L(12) + 0.3, 'pop', 0.6); rec(L(12) + D(12) * 0.35, 'scan', 0.3, 0, D(12) * 0.6, ['ping', 0.35]); a(L(12) + D(12) * 0.35, 'pop', 0.5);
// 13: the computer draws the picture
rec(L(13) + 0.3, 'scan', 0.3, 0, D(13) - 0.5, ['notify', 0.3]); for (let k = 0; k < 8; k++) a(L(13) + 0.4 + k * 0.45, 'tick', 0.15); a(L(13) + 1.0, 'pop', 0.5);
// 14: and the noise?
mri(14, 0.25, 5); a(L(14) + 0.3, 'pop', 0.7); a(L(14) + 1.5, 'pop', 0.5);
// 15–18: the gradient coils knocking
mri(15, 0.45, 60); a(L(15) + 0.5, 'pop', 0.6); a(L(15) + 1.8, 'pop', 0.6);
mri(16, 0.55, 8); a(L(16) + 0.8, 'pop', 0.6);
mri(17, 0.45, 61); rec(L(17) + 0.3, 'rock', 0.3, 5, 1.6, ['boom', 0.3]); a(L(17) + 1.5, 'squeeze', 0.3); a(L(17) + 1.5, 'pop', 0.6);
mri(18, 0.4, 3); a(L(18) + 0.6, 'pop', 0.6); for (let k = 0; k < 6; k++) a(L(18) + 0.8 + k * 0.5, 'tick', 0.15);
// 19: payoff, the table slides out
a(L(19) + 0.2, 'servo', 0.3, 2.0); a(L(19) + 0.4, 'pop', 0.6); a(L(19) + 0.45, 'chime', 0.35); a(L(19) + 1.4, 'pop', 0.6);
// 20: outro
rec(L(20), 'hospital', 0.2, 20, D(20) + 1.5, ['hum', 0.1]); a(L(20) + 0.4, 'pop', 0.7); a(L(20) + 0.5, 'chime', 0.5);
fs.writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: false, cues: c }, null, 1));
console.log(c.length + ' cues');
