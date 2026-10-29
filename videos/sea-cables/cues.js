// Sound cues from the line timings: node cues.js → cues.json
// Recorded sounds in sfx/px-*.mp3 are Pixabay sound effects (Pixabay Content License) the channel downloaded for earlier
// episodes, kept out of git; short UI sounds (whoosh, pop, tick, chime) stay synthesized.
global.window = {}; eval(require('fs').readFileSync(__dirname + '/timing.js', 'utf8'));
const T = window.TIMING.lines, L = i => i >= T.length ? window.TIMING.duration : T[i].start, D = i => L(i + 1) - L(i), c = [];
const a = (t, fx, gain, dur) => c.push(Object.assign({ t: +t.toFixed(2), fx, gain }, dur ? { dur } : {}));
const rec = (t, file, gain, from, dur, duck) => c.push(Object.assign({ t: +Math.max(0, t).toFixed(2), file: 'sfx/px-' + file + '.mp3', gain: +(gain * 1.2).toFixed(2), from: from || 0 }, dur ? { dur: +dur.toFixed(2) } : {}, duck != null ? { duck } : {}));
let bo = 0; const bed = i => { rec(L(i), 'bubbles', 0.45, 5 + (bo * 17.3) % 170, D(i) + 0.2, 1.5); bo++; };   // the underwater bed, a different stretch each time
for (let i = 1; i < T.length; i++) a(L(i) - 0.08, 'whoosh', 0.3);
// 0: a tap on the phone, the video plays
rec(L(0) + 0.3, 'tap', 0.7, 0, 0.3); a(L(0) + 1.2, 'ping', 0.4); a(L(0) + 2.0, 'pop', 0.6);
// 1: the satellite
rec(L(1) + 0.3, 'beep', 0.5, 0, 0.3); a(L(1) + 1.2, 'pop', 0.5);
// 2: a cable cut on the seabed
bed(2); rec(L(2) + 0.4, 'sparks', 0.6, 2, 0.9); a(L(2) + 1.2, 'pop', 0.6);
// 3: brand
a(L(3) + 0.05, 'pop', 0.9); a(L(3) + 0.2, 'chime', 0.5);
// 4–5: the globe, 90%, 570 cables
for (let k = 0; k < 8; k++) a(L(4) + 0.4 + k * 0.2, 'tick', 0.2); a(L(4) + 1.8, 'pop', 0.6);
for (let k = 0; k < 12; k++) a(L(5) + 0.2 + k * 0.2, 'tick', 0.2); a(L(5) + 2.6, 'chime', 0.4);
// 6: the cable on the seabed, a garden hose
bed(6); a(L(6) + 0.6, 'pop', 0.5); a(L(6) + 2.0, 'pop', 0.5);
// 7: the cable cut open, the fibres
rec(L(7) + 0.2, 'sonar', 0.5, 0.5, 1.0); a(L(7) + 0.8, 'pop', 0.6);
// 8: pulses of light, 1s and 0s
for (let k = 0; k < 4; k++) rec(L(8) + 0.4 + k * 0.9, 'beep', 0.3, 0, 0.15); a(L(8) + 0.6, 'pop', 0.5);
// 9: bouncing off the walls
for (let k = 0; k < 6; k++) a(L(9) + 0.3 + k * 0.45, 'ping', 0.2);
// 10: the repeater
bed(10); rec(L(10) + 0.6, 'electric-hum', 0.5, 2, D(10) - 0.6, 1.2); a(L(10) + 0.8, 'pop', 0.6);
// 11: power from the shore
rec(L(11) + 0.2, 'waves', 0.45, 0, D(11), 1.2); a(L(11) + 0.6, 'pop', 0.5);
// 12: the layers
a(L(12) + 0.3, 'pop', 0.5); a(L(12) + 0.8, 'pop', 0.5); a(L(12) + 1.3, 'pop', 0.5); a(L(12) + 1.8, 'pop', 0.5); a(L(12) + 2.3, 'pop', 0.5);
// 13: the cable ship
rec(L(13), 'generator', 0.5, 2, D(13) + 0.2, 1.5); rec(L(13) + 0.3, 'waves', 0.35, 8, D(13), 1.2); a(L(13) + 0.5, 'pop', 0.6);
// 14: the plough on the seabed
bed(14); rec(L(14) + 0.6, 'metal-clang', 0.4, 0, 1.0); a(L(14) + 0.5, 'pop', 0.6);
// 15: the beach and the landing station
rec(L(15), 'waves', 0.6, 12, D(15) + 0.2, 1.2); a(L(15) + 0.6, 'pop', 0.5);
// 16: the exchange, the tower, the router
rec(L(16) + 0.4, 'beep', 0.4, 0, 0.3); a(L(16) + 1.0, 'notify', 0.4);
// 17–18: Egypt, 17%
a(L(17) + 0.4, 'wipe', 0.4); a(L(17) + 1.2, 'pop', 0.5);
for (let k = 0; k < 10; k++) a(L(18) + 0.2 + k * 0.2, 'tick', 0.2); a(L(18) + 2.2, 'chime', 0.5);
// 19: the anchor drags and cuts the cable
bed(19); rec(L(19) + 1.6, 'metal-clang', 0.7, 0, 1.2); rec(L(19) + 1.9, 'sparks', 0.5, 5, 0.8);
// 20: the data goes round another cable
rec(L(20) + 0.5, 'sonar', 0.5, 4.9, 1.0); a(L(20) + 1.4, 'chime', 0.4);
// 21: the repair ship, splicing on deck
rec(L(21), 'generator', 0.45, 8, D(21), 1.5); rec(L(21) + 2.2, 'sparks', 0.6, 8, 1.4);
// 22: the shark
bed(22); rec(L(22) + 0.6, 'whip', 0.5, 0.26, 0.6); a(L(22) + 1.8, 'thud', 0.4); a(L(22) + 2.6, 'pop', 0.6);
// 23: a pulse of light crossing the sea
rec(L(23) + 0.3, 'tap', 0.5, 0, 0.3); a(L(23) + 0.8, 'ping', 0.4);
// 24: outro
bed(24); a(L(24) + 0.2, 'pop', 0.7); a(L(24) + 0.4, 'notify', 0.5);
require('fs').writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: true, cues: c }, null, 1)); console.log(c.length, 'cues');
