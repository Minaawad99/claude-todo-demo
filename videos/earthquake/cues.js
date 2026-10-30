// Sound cues from the line timings: node cues.js → cues.json
// Recorded sounds in sfx/px-*.mp3 are Pixabay sound effects (Pixabay Content License) the channel sent (a far rumble from the
// thunder clip, sparks, a splash, a drop, a warning beep, a clock, breeze, wind, metal, ceramic rattling, city traffic), kept
// out of git; the earthquake rumble and the dog barks the user sent for this episode.
// No recorded sound plays in two shots in a row.
global.window = {}; eval(require('fs').readFileSync(__dirname + '/timing.js', 'utf8'));
const fs = require('fs'), HAVE = n => fs.existsSync(__dirname + '/sfx/px-' + n + '.mp3');
const T = window.TIMING.lines, L = i => i >= T.length ? window.TIMING.duration : T[i].start, D = i => L(i + 1) - L(i), c = [];
const a = (t, fx, gain, dur) => c.push(Object.assign({ t: +t.toFixed(2), fx, gain }, dur ? { dur } : {}));
const rec = (t, file, gain, from, dur, duck) => c.push(Object.assign({ t: +Math.max(0, t).toFixed(2), file: 'sfx/px-' + file + '.mp3', gain: +(gain * 1.2).toFixed(2), from: from || 0 }, dur ? { dur: +dur.toFixed(2) } : {}, duck != null ? { duck } : {}));
const bed = (i, file, g, from) => rec(L(i), file, g, from, D(i) + 0.2, 1.2);
let qo = 0;
// the ground rumbling: the earthquake clip if the user sent one, else the low rumble of the distant-thunder clip
// the earthquake clip rumbles for 5.2 s; longer stretches chain it
const rumble = (t, g, dur) => HAVE('quake') ? (() => { for (let x = 0; x < dur - 0.3; x += 4.8) rec(t + x, 'quake', g, (qo++ % 3) * 0.3, Math.min(4.8, dur - x), 1.0); })() : rec(t, 'distant-thunder', g, 1 + (qo++ * 2.1) % 8, dur, 1.0);
const rattle = (t, g, dur) => rec(t, 'ceramic', g, 5 + (qo * 7.7) % 50, dur, 1.0);
const bark = (t, g) => HAVE('dog') ? rec(t, 'dog', g, 0, 2.3, 0.8) : (a(t, 'pop', g * 0.6), a(t + 0.25, 'pop', g * 0.5));
for (let i = 1; i < T.length; i++) a(L(i) - 0.08, 'whoosh', 0.3);
// 0: the ground under you is moving right now
bed(0, 'breeze', 0.3, 5); a(L(0) + 0.6, 'hum', 0.2, D(0) - 0.8); a(L(0) + 2.0, 'pop', 0.6);
// 1: why does everything suddenly shake?
rumble(L(1) + 0.6, 0.55, D(1) - 0.6); rattle(L(1) + 0.8, 0.4, D(1) - 0.8); a(L(1) + 1.0, 'pop', 0.5);
// 2: felt in Egypt from Turkey
for (let k = 0; k < 4; k++) a(L(2) + 0.2 + k * 0.7, 'ping', 0.3); a(L(2) + 0.4, 'pop', 0.5); a(L(2) + 1.2, 'pop', 0.5);
// 3: brand
bed(3, 'traffic-bridge', 0.3, 10); a(L(3) + 0.05, 'pop', 0.9); a(L(3) + 0.2, 'chime', 0.5);
// 4: thin as an apple skin
a(L(4) + 0.6, 'pop', 0.6); a(L(4) + 1.6, 'pop', 0.6); a(L(4) + 1.2, 'snip', 0.3);
// 5: fifteen plates
bed(5, 'wind', 0.25, 4); a(L(5) + 1.0, 'pop', 0.6); for (let k = 0; k < 6; k++) a(L(5) + 0.3 + k * 0.3, 'tick', 0.2);
// 6: floating on hot, heavy rock
a(L(6) + 0.3, 'hum', 0.3, D(6) - 0.4); a(L(6) + 1.0, 'pop', 0.6);
// 7: as fast as your fingernails grow
rec(L(7), 'clock-ticking', 0.3, 0, D(7), 1.2); a(L(7) + 0.8, 'pop', 0.6); a(L(7) + 1.6, 'pop', 0.5);
// 8: two plates grind against each other
rec(L(8) + 0.2, 'sparks', 0.35, 2, D(8) - 0.2, 1.2); a(L(8) + 0.4, 'creak', 0.4); a(L(8) + 0.8, 'pop', 0.6);
// 9: the stress builds up for years
for (let k = 0; k < 4; k++) a(L(9) + 0.3 + k * 0.7, 'creak', 0.25 + k * 0.05); a(L(9) + 0.8, 'pop', 0.5);
// 10: the ruler bends and snaps
a(L(10) + 0.4, 'creak', 0.3); a(L(10) + D(10) * 0.8, 'snip', 0.8); a(L(10) + D(10) * 0.8 + 0.02, 'thud', 0.6);
// 11: the rock slips, all the energy at once
rumble(L(11) + 0.1, 0.7, D(11) - 0.1); a(L(11) + 0.1, 'boom', 0.5); a(L(11) + 0.6, 'pop', 0.5);
// 12: waves like a stone in water
rec(L(12) + 0.1, 'rock-splash', 0.5, 0, 1.8, 1.0); a(L(12) + 0.8, 'pop', 0.5); a(L(12) + 1.6, 'pop', 0.5);
// 13: the first wave, fast
for (let k = 0; k < 8; k++) a(L(13) + 0.2 + k * 0.3, 'tick', 0.25); a(L(13) + 0.6, 'pop', 0.6);
// 14: the small jolt, the dog feels it first
a(L(14) + 0.3, 'thud', 0.5); rattle(L(14) + 0.3, 0.3, 0.8); bark(L(14) + 1.6, 0.6); a(L(14) + 0.6, 'pop', 0.5);
// 15: the slower wave, side to side
rumble(L(15), 0.5, D(15)); a(L(15) + 0.6, 'pop', 0.5);
// 16: surface waves bring houses down
rattle(L(16), 0.45, D(16)); a(L(16) + 0.8, 'thud', 0.6); a(L(16) + 1.4, 'clank', 0.5); a(L(16) + 0.6, 'pop', 0.5);
// 17: the gap between the waves tells the distance
for (let k = 0; k < 10; k++) a(L(17) + 0.2 + k * 0.22, 'tick', 0.15); a(L(17) + 1.6, 'pop', 0.6);
// 18: the phone warns you seconds early
rec(L(18) + 0.6, 'beep-warning', 0.5, 0, 1.75, 0.8); rec(L(18) + 2.4, 'beep-warning', 0.4, 0, 1.2, 0.8); a(L(18) + 1.4, 'pop', 0.5);
// 19: each step is 32 times more energy
for (let m = 0; m < 5; m++) a(L(19) + 0.3 + m * 0.5, 'pop', 0.3 + m * 0.08); a(L(19) + 2.4, 'chime', 0.4);
// 20: a 7 is 32 sixes
for (let k = 0; k < 16; k++) a(L(20) + 0.1 + k * 0.14, 'tick', 0.18); a(L(20) + 0.6, 'pop', 0.6);
// 21: Chile 1960, 9.5
rumble(L(21) + 0.2, 0.55, D(21) - 0.2); a(L(21) + 0.5, 'pop', 0.6); a(L(21) + 1.6, 'pop', 0.7);
// 22: Egypt 1992
bed(22, 'traffic-bridge', 0.3, 40); a(L(22) + 0.5, 'pop', 0.6); a(L(22) + 1.6, 'pop', 0.5);
// 23: why the tenth floor feels it more
rumble(L(23) + 0.2, 0.35, D(23) - 0.2); a(L(23) + 0.5, 'pop', 0.5); a(L(23) + 1.3, 'pop', 0.5);
// 24: the stick shaken from its end
for (let k = 0; k < 6; k++) a(L(24) + 0.3 + k * 0.7, 'whoosh', 0.2); a(L(24) + 0.6, 'pop', 0.5); a(L(24) + 1.8, 'pop', 0.5);
// 25: the swing grows the higher you go: the lamp, the cup
rattle(L(25) + 0.3, 0.35, D(25) - 0.4); for (let k = 0; k < 4; k++) a(L(25) + 0.5 + k * 0.9, 'creak', 0.25); a(L(25) + 1.5, 'pop', 0.5);
// 26: flexible towers, the 660-ton ball
rec(L(26), 'wind', 0.35, 8, D(26) + 0.2, 1.2); a(L(26) + 0.6, 'pop', 0.5); a(L(26) + 1.6, 'clank', 0.4); a(L(26) + 1.7, 'pop', 0.7);
// 27: years of stress let go in seconds
rumble(L(27) + 0.6, 0.6, D(27) - 0.6); a(L(27) + 0.3, 'pop', 0.5); a(L(27) + 1.2, 'pop', 0.6);
// 28: outro
rec(L(28), 'breeze', 0.35, 90, D(28) + 1.5, 1.0); a(L(28) + 0.4, 'pop', 0.7);
require('fs').writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: false, cues: c }, null, 1));
console.log(c.length + ' cues');
