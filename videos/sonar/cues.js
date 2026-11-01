// Sound cues from the line timings: node cues.js → cues.json
// Recorded sounds go in sfx/px-<name>.mp3 (Pixabay clips the user sends; gitignored). Until a clip is there, its cue falls
// back to a synthesized effect from audio/sfx.py, so the mix always builds.
const fs = require('fs');
global.window = {}; eval(fs.readFileSync(__dirname + '/timing.js', 'utf8'));
const T = window.TIMING.lines, L = i => i >= T.length ? window.TIMING.duration : T[i].start, D = i => L(i + 1) - L(i), c = [];
const a = (t, fx, gain, dur) => c.push(Object.assign({ t: +t.toFixed(2), fx, gain }, dur ? { dur: +dur.toFixed(2) } : {}));
const has = n => fs.existsSync(__dirname + '/sfx/px-' + n + '.mp3');
const rec = (t, n, gain, from, dur, fb) => has(n) ? c.push(Object.assign({ t: +Math.max(0, t).toFixed(2), file: 'sfx/px-' + n + '.mp3', gain: +(gain * 1.2).toFixed(2), from: from || 0, duck: 1.2 }, dur ? { dur: +dur.toFixed(2) } : {})) : fb && a(t, fb[0], fb[1], fb[2] || dur);
const beat = (t0, dur, g) => { for (let x = 0; x < dur; x += 0.42) { a(t0 + x, 'thud', g); a(t0 + x + 0.14, 'thud', g * 0.6); } };
for (let i = 1; i < T.length; i++) a(L(i) - 0.08, 'whoosh', 0.3);
// 0: the clinic, the baby appears with its heartbeat
rec(L(0), 'clinic', 0.25, 0, D(0), ['hum', 0.1]); has('heartbeat') ? rec(L(0) + 1.2, 'heartbeat', 0.4, 0, D(0) - 1.2) : beat(L(0) + 1.2, D(0) - 1.4, 0.18); a(L(0) + 1.6, 'pop', 0.7); a(L(0) + 1.65, 'chime', 0.3);
// 1: no cutting, no X-rays
a(L(1) + 0.4, 'pop', 0.6); a(L(1) + 0.8, 'pop', 0.6); a(L(1) + 0.5, 'beep', 0.25);
// 2: the cold gel
rec(L(2) + 0.4, 'gel', 0.4, 0, 1.0, ['squeeze', 0.4]); a(L(2) + 0.3, 'pop', 0.6); a(L(2) + 1.4, 'pop', 0.6);
// 3: brand
a(L(3) + 0.05, 'pop', 0.9); a(L(3) + 0.2, 'chime', 0.5);
// 4: a sound you can't hear
a(L(4) + 0.3, 'pop', 0.6); a(L(4) + 0.4, 'laser', 0.25); a(L(4) + 1.4, 'pop', 0.6); a(L(4) + 1.2, 'beep', 0.2);
// 5: over a hundred times higher
a(L(5) + 0.3, 'pop', 0.5); a(L(5) + 0.6, 'charge', 0.3); for (let k = 0; k < 10; k++) a(L(5) + 0.6 + k * 0.16, 'tick', 0.15); a(L(5) + 2.0, 'pop', 0.7);
// 6: the echo in the mountains
rec(L(6) + 1.2, 'echo', 0.35, 0, D(6) - 1.3, ['ping', 0.35]); a(L(6) + 1.0, 'pop', 0.6); a(L(6) + 1.8, 'pop', 0.5);
// 7: send, listen, thousands of times
for (let k = 0; k < Math.floor(D(7) * 1.6); k++) { a(L(7) + k / 1.6, 'ping', 0.18); } a(L(7) + 1.0, 'pop', 0.6);
// 8–9: near = fast, far = late
for (let k = 0; k < 4; k++) a(L(8) + 0.3 + k * 1.1, 'plunk', 0.3); a(L(8) + 0.6, 'pop', 0.6); a(L(8) + 1.0, 'chime', 0.3);
for (let k = 0; k < 2; k++) a(L(9) + 0.3 + k * 2.2, 'plunk', 0.3); a(L(9) + 0.5, 'pop', 0.6);
// 10–11: bone white, water black
a(L(10) + 0.5, 'pop', 0.6); a(L(10) + 0.8, 'clank', 0.3); a(L(10) + 1.2, 'pop', 0.6);
a(L(11) + 0.3, 'splash', 0.25); a(L(11) + 0.5, 'pop', 0.6); a(L(11) + 1.3, 'pop', 0.6);
// 12–13: drawing line by line, live
a(L(12) + 0.3, 'toner', 0.25, D(12) - 0.5); a(L(12) + 0.6, 'pop', 0.6);
has('heartbeat') ? rec(L(13), 'heartbeat', 0.35, 4, D(13)) : beat(L(13), D(13) - 0.2, 0.18); rec(L(13) + 0.5, 'baby', 0.3, 0, 1.6, ['notify', 0.3]); a(L(13) + 0.6, 'pop', 0.6);
// 14–16: sound hates air; the gel
a(L(14) + 0.2, 'pop', 0.6); a(L(14) + 1.0, 'pop', 0.6); a(L(14) + 0.3, 'wind', 0.2, D(14) - 0.4);
a(L(15) + 0.4, 'pop', 0.5); a(L(15) + 1.0, 'bump', 0.4); a(L(15) + 1.0, 'pop', 0.7); a(L(15) + 1.2, 'beep', 0.3);
rec(L(16) + 0.2, 'gel', 0.35, 0, 1.0, ['squeeze', 0.35]); a(L(16) + 0.4, 'pop', 0.6); a(L(16) + 1.4, 'chime', 0.35); a(L(16) + 1.4, 'pop', 0.6);
// 17: the bat
rec(L(17), 'bat', 0.35, 0, D(17), ['ping', 0.25]); a(L(17) + 0.4, 'pop', 0.6); a(L(17) + 1.4, 'pop', 0.5);
// 18: sound, not radiation
a(L(18) + 0.6, 'pop', 0.6); a(L(18) + 1.4, 'chime', 0.35); a(L(18) + 1.4, 'pop', 0.6);
// 19: the first picture of you
has('heartbeat') ? rec(L(19), 'heartbeat', 0.3, 8, D(19)) : beat(L(19), D(19) - 0.2, 0.15); rec(L(19) + 1.0, 'baby', 0.3, 0, 2.0, ['bell', 0.25]); a(L(19) + 0.4, 'pop', 0.7);
// 20: outro
rec(L(20), 'clinic', 0.2, 10, D(20) + 1.5, ['hum', 0.08]); a(L(20) + 0.4, 'pop', 0.7); a(L(20) + 0.5, 'chime', 0.5);
fs.writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: false, cues: c }, null, 1));
console.log(c.length + ' cues');
