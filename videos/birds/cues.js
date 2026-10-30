// Sound cues from the line timings: node cues.js → cues.json
// Recorded sounds in sfx/px-*.mp3 are Pixabay sound effects (Pixabay Content License) the channel sent (wind, breeze, waves,
// cicadas, a clock, a propeller plane, a jet, a whip), kept out of git. Clips asked for and not here yet (wing flaps, gulls,
// geese) fall back to synthesized sounds (see HAVE). No recorded sound plays in two shots in a row.
global.window = {}; eval(require('fs').readFileSync(__dirname + '/timing.js', 'utf8'));
const fs = require('fs'), HAVE = n => fs.existsSync(__dirname + '/sfx/px-' + n + '.mp3');
const T = window.TIMING.lines, L = i => i >= T.length ? window.TIMING.duration : T[i].start, D = i => L(i + 1) - L(i), c = [];
const a = (t, fx, gain, dur) => c.push(Object.assign({ t: +t.toFixed(2), fx, gain }, dur ? { dur } : {}));
const rec = (t, file, gain, from, dur, duck) => c.push(Object.assign({ t: +Math.max(0, t).toFixed(2), file: 'sfx/px-' + file + '.mp3', gain: +(gain * 1.2).toFixed(2), from: from || 0 }, dur ? { dur: +dur.toFixed(2) } : {}, duck != null ? { duck } : {}));
const bed = (i, file, g, from) => rec(L(i), file, g, from, D(i) + 0.2, 1.2);
let fo = 0, go = 0, ko = 0;
// the wing-flap clip has 2.8 s of flapping (0.46–3.24 s); longer stretches repeat it
const flaps = (t, g, dur) => HAVE('wing-flaps') ? (() => { for (let x = 0; x < dur - 0.3; x += 2.6) rec(t + x, 'wing-flaps', g, 0.46 + (fo++ % 3) * 0.1, Math.min(2.6, dur - x), 1.0); })() : (() => { for (let k = 0; k < dur / 0.3; k++) a(t + k * 0.3, 'whoosh', g * 0.35); })();
const gulls = (t, g, dur) => HAVE('gulls') ? rec(t, 'gulls', g, (go++ * 3.1) % 12, dur, 1.0) : a(t, 'ping', g * 0.3);
const geese = (t, g, dur) => HAVE('geese') ? rec(t, 'geese', g, (ko++ * 3.3) % 9, Math.min(dur, 6), 1.0) : a(t, 'beep', g * 0.2);
for (let i = 1; i < T.length; i++) a(L(i) - 0.08, 'whoosh', 0.3);
// 0: eleven days over the sea
bed(0, 'waves', 0.35, 2); flaps(L(0) + 0.3, 0.45, D(0) - 0.3); for (let k = 0; k < 6; k++) a(L(0) + 0.5 + k * 0.45, 'tick', 0.25);
// 1: two wings of feathers holding a whole body
bed(1, 'breeze', 0.3, 5); flaps(L(1) + 0.2, 0.5, D(1) - 0.2); a(L(1) + 0.6, 'pop', 0.6);
// 2: flapping your arms
for (let k = 0; k < 10; k++) a(L(2) + 0.2 + k * 0.26, 'whoosh', 0.18); a(L(2) + 1.6, 'thud', 0.5);
// 3: brand
bed(3, 'waves', 0.3, 9); gulls(L(3) + 0.4, 0.4, 1.6); a(L(3) + 0.05, 'pop', 0.9); a(L(3) + 0.2, 'chime', 0.5);
// 4: first secret: light
a(L(4) + 0.4, 'tick', 0.3); a(L(4) + 0.5, 'pop', 0.6); a(L(4) + 1.2, 'ping', 0.3);
// 5: hollow bones
bed(5, 'wind', 0.3, 3); a(L(5) + 0.6, 'pop', 0.6); a(L(5) + 1.8, 'pop', 0.5); a(L(5) + 1.0, 'clink', 0.3);
// 6: the frigatebird, lighter skeleton than feathers
bed(6, 'waves', 0.3, 14); a(L(6) + 0.5, 'pop', 0.5); a(L(6) + 1.4, 'creak', 0.3); a(L(6) + 2.0, 'pop', 0.6);
// 7: second secret: the wing's shape
bed(7, 'breeze', 0.3, 30); a(L(7) + 0.4, 'pop', 0.6); a(L(7) + 1.6, 'pop', 0.5);
// 8: the air pushed down, the wing pushed up
rec(L(8), 'wind', 0.4, 9, D(8) + 0.2, 1.2); a(L(8) + 0.8, 'pop', 0.5); a(L(8) + 1.8, 'chime', 0.4);
// 9: airplanes copying birds
rec(L(9) + 0.2, 'jet-flyby', 0.25, 3, D(9) - 0.2, 1.2); a(L(9) + 0.8, 'pop', 0.6);
// 10: the Wright brothers
rec(L(10), 'prop-plane', 0.3, 5, D(10) + 0.2, 1.2); a(L(10) + 0.5, 'pop', 0.6); a(L(10) + 1.6, 'pop', 0.5);
// 11: third secret: muscle
flaps(L(11) + 0.2, 0.5, D(11) - 0.2); a(L(11) + 0.4, 'pop', 0.7);
// 12: a quarter of its weight
for (let k = 0; k < 8; k++) a(L(12) + 0.1 + k * 0.17, 'tick', 0.2); a(L(12) + 1.4, 'chime', 0.45);
// 13: wing down: up and forward
bed(13, 'breeze', 0.3, 55); for (let k = 0; k < 5; k++) a(L(13) + 0.3 + k * 0.6, 'whoosh', 0.35); a(L(13) + 0.8, 'pop', 0.5);
// 14: feathers open like shutters
flaps(L(14) + 0.2, 0.45, D(14) - 0.2); a(L(14) + 0.8, 'pop', 0.6);
// 15: your weak chest muscle
a(L(15) + 0.6, 'pop', 0.5); a(L(15) + 1.6, 'pop', 0.5); a(L(15) + 2.2, 'thud', 0.4);
// 16: fourth secret: breathing
bed(16, 'breeze', 0.3, 75); geese(L(16) + 0.2, 0.35, 1.4); a(L(16) + 0.4, 'pop', 0.7);
// 17: one-way flow, air sacs
for (let k = 0; k < 6; k++) a(L(17) + 0.3 + k * 0.8, 'whoosh', 0.22); a(L(17) + 0.6, 'pop', 0.5); a(L(17) + 1.6, 'pop', 0.5);
// 18: oxygen breathing in and out
a(L(18) + 0.5, 'pop', 0.5); a(L(18) + 1.6, 'pop', 0.5); for (let k = 0; k < 4; k++) a(L(18) + 0.2 + k * 0.8, 'fizz', 0.2);
// 19: high over the mountains
rec(L(19), 'wind', 0.45, 2, D(19) + 0.2, 1.2); geese(L(19) + 0.8, 0.35, 1.6); a(L(19) + 0.6, 'pop', 0.5); a(L(19) + 1.8, 'pop', 0.5);
// 20: the godwit, 13,000 km
bed(20, 'waves', 0.3, 5); rec(L(20) + 0.2, 'clock-ticking', 0.3, 0, D(20) - 0.4, 1.2); a(L(20) + 1.8, 'pop', 0.6);
// 21: the peregrine dives at 300 km/h
rec(L(21) + 0.3, 'whip', 0.5, 0, 1.6, 1.0); a(L(21) + 0.5, 'pop', 0.5); a(L(21) + 2.0, 'pop', 0.6); for (let k = 0; k < 4; k++) a(L(21) + 0.4 + k * 0.4, 'whoosh', 0.3);
// 22: the V formation
bed(22, 'breeze', 0.3, 95); geese(L(22) + 0.3, 0.45, D(22) - 0.5); a(L(22) + 0.5, 'pop', 0.6); a(L(22) + 1.8, 'pop', 0.5);
// 23: sleeping in flight
rec(L(23), 'cicadas', 0.3, 10, D(23) + 0.2, 1.2); a(L(23) + 0.8, 'pop', 0.5); a(L(23) + 2.0, 'chime', 0.35);
// 24: the payoff
flaps(L(24), 0.4, D(24)); for (let k = 0; k < 4; k++) a(L(24) + 0.4 + k * 0.9, 'pop', 0.5);
// 25: outro
rec(L(25), 'waves', 0.35, 1, D(25) + 1.5, 1.0); gulls(L(25) + 0.3, 0.45, 2); a(L(25) + 0.4, 'pop', 0.7);
require('fs').writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: false, cues: c }, null, 1));
console.log(c.length + ' cues');
