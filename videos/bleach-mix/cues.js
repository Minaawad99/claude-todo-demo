// Sound cues from the line timings: node cues.js → cues.json
// Synthesized effects only (audio/sfx.py): the channel's Pixabay clips are not in this container.
global.window = {}; eval(require('fs').readFileSync(__dirname + '/timing.js', 'utf8'));
const T = window.TIMING.lines, L = i => i >= T.length ? window.TIMING.duration : T[i].start, D = i => L(i + 1) - L(i), c = [];
const a = (t, fx, gain, dur) => c.push(Object.assign({ t: +t.toFixed(2), fx, gain }, dur ? { dur: +dur.toFixed(2) } : {}));
for (let i = 1; i < T.length; i++) a(L(i) - 0.08, 'whoosh', 0.3);
// 0: stop! the acid cleaner tips over the bucket
a(L(0) + 0.05, 'boom', 0.35); a(L(0) + 0.1, 'pop', 0.8); a(L(0) + 0.8, 'drip', 0.4); a(L(0) + 0.9, 'fizz', 0.3, 1.0); a(L(0) + 1.6, 'pop', 0.8); a(L(0) + 2.0, 'pop', 0.6);
// 1: stronger? a poison cloud
a(L(1) + 0.3, 'pop', 0.6); a(L(1) + 1.2, 'fizz', 0.4, D(1) - 1.4); a(L(1) + 1.2, 'steam', 0.25, 1.5); a(L(1) + 1.8, 'pop', 0.8); for (let k = 0; k < 6; k++) a(L(1) + 0.5 + k * 0.5, 'tick', 0.15);
// 2: brand
a(L(2) + 0.05, 'pop', 0.9); a(L(2) + 0.2, 'chime', 0.5);
// 3: the molecule in water
a(L(3) + 0.6, 'pop', 0.6); a(L(3) + 0.8, 'plunk', 0.4); a(L(3) + 1.0, 'plunk', 0.35); a(L(3) + 1.2, 'plunk', 0.3); a(L(3) + 2.2, 'pop', 0.6);
// 4: holds the chlorine, kills germs
a(L(4) + 0.3, 'pop', 0.6); for (let g = 0; g < 4; g++) a(L(4) + 1.6 + g * 0.3, 'zap', 0.25); a(L(4) + 1.6, 'pop', 0.5);
// 5: acidic cleaners pop in
a(L(5) + 0.4, 'pop', 0.7); a(L(5) + 0.6, 'clink', 0.3); a(L(5) + 1.4, 'clink', 0.3); a(L(5) + 2.2, 'clink', 0.3); a(L(5) + 2.4, 'pop', 0.6);
// 6: the acid frees the chlorine
a(L(6) + 0.2, 'pop', 0.5); a(L(6) + 1.3, 'snip', 0.5); a(L(6) + 1.35, 'spark', 0.3); a(L(6) + 1.4, 'steam', 0.3, 1.6); a(L(6) + 1.8, 'pop', 0.7);
// 7: yellow-green, Greek name
a(L(7) + 0.2, 'fizz', 0.25, D(7) - 0.4); a(L(7) + 0.3, 'pop', 0.6); a(L(7) + 1.6, 'pop', 0.7); a(L(7) + 1.7, 'bell', 0.25); a(L(7) + 2.4, 'pop', 0.5);
// 8: ammonia spray → chloramine
a(L(8) + 0.3, 'pop', 0.5); a(L(8) + 0.5, 'spray', 0.4, 0.8); a(L(8) + 1.4, 'fizz', 0.35, D(8) - 1.6); a(L(8) + 2.2, 'pop', 0.7);
// 9: eyes, throat, chest
a(L(9) + 0.3, 'pop', 0.6); a(L(9) + 1.2, 'pop', 0.6); a(L(9) + 2.1, 'pop', 0.6); a(L(9) + 0.2, 'hum', 0.15, D(9) - 0.4);
// 10: chlorine + water = acids
a(L(10) + 0.4, 'pop', 0.6); a(L(10) + 1.4, 'sizzle', 0.25, D(10) - 1.6); a(L(10) + 1.8, 'pop', 0.7);
// 11: burns inside, coughs and tears
a(L(11) + 0.3, 'pop', 0.6); for (let k = 0; k < 4; k++) a(L(11) + 0.6 + k * 0.7, 'thud', 0.25); a(L(11) + 1.6, 'drip', 0.4); a(L(11) + 1.6, 'pop', 0.5);
// 12: fine now, hours later breathing gets heavy
for (let k = 0; k < 14; k++) a(L(12) + 0.4 + k * 0.3, 'tick', 0.16); a(L(12) + 0.3, 'pop', 0.6); a(L(12) + 1.2, 'pop', 0.5); a(L(12) + D(12) * 0.55, 'boom', 0.3); a(L(12) + D(12) * 0.55, 'pop', 0.6);
// 13: the scale tips, ×2.5
a(L(13) + 0.5, 'creak', 0.4); a(L(13) + 1.6, 'clank', 0.5); a(L(13) + 0.6, 'pop', 0.6); a(L(13) + 1.6, 'pop', 0.7);
// 14: small room, gas pools fast
a(L(14) + 0.3, 'pop', 0.6); a(L(14) + 0.3, 'steam', 0.25, D(14) - 0.6); a(L(14) + 1.6, 'pop', 0.5);
// 15: kids and cats
a(L(15) + 0.3, 'pop', 0.6); a(L(15) + 1.0, 'pop', 0.6); a(L(15) + 1.05, 'squeeze', 0.25); a(L(15) + 1.8, 'pop', 0.5);
// 16: a weapon in WWI
a(L(16) + 0.1, 'wind', 0.3, D(16) - 0.2); a(L(16) + 0.6, 'boom', 0.35); a(L(16) + 0.6, 'pop', 0.7); a(L(16) + 1.4, 'pop', 0.5);
// 17: 1915, 150+ tonnes in Belgium
a(L(17) + 0.2, 'pop', 0.6); for (let k = 0; k < 8; k++) a(L(17) + 0.4 + k * 0.12, 'spray', 0.18, 0.6); for (let k = 0; k < 10; k++) a(L(17) + 0.5 + k * 0.2, 'tick', 0.15); a(L(17) + 1.6, 'pop', 0.7); a(L(17) + 2.6, 'thud', 0.4);
// 18: mixing doesn't clean better, the gauge drops
a(L(18) + 0.3, 'pop', 0.7); a(L(18) + 0.4, 'fizz', 0.2, D(18) - 0.6); a(L(18) + 1.6, 'pop', 0.5); a(L(18) + 1.0, 'beep', 0.25);
// 19: one cleaner, rinse
a(L(19) + 0.3, 'pop', 0.6); a(L(19) + 0.35, 'chime', 0.35); a(L(19) + 1.0, 'splash', 0.3); a(L(19) + 1.0, 'drip', 0.35); a(L(19) + 1.2, 'pop', 0.5); a(L(19) + 2.2, 'pop', 0.5);
// 20: fan, window, no hot water
a(L(20) + 0.5, 'motor', 0.2, D(20) - 0.7); a(L(20) + 0.4, 'pop', 0.5); a(L(20) + 1.0, 'creak', 0.3); a(L(20) + 1.0, 'pop', 0.5); a(L(20) + 2.0, 'steam', 0.25, 1.0); a(L(20) + 2.2, 'pop', 0.6);
// 21: get out, leave the door open
a(L(21) + 0.2, 'pop', 0.6); a(L(21) + 0.8, 'creak', 0.4); for (let k = 0; k < 6; k++) a(L(21) + 1.1 + k * 0.3, 'bump', 0.2); a(L(21) + 1.0, 'pop', 0.6); a(L(21) + 2.2, 'pop', 0.5);
// 22: wash with water, ambulance 123
a(L(22) + 0.1, 'drip', 0.35); a(L(22) + 0.2, 'splash', 0.25); a(L(22) + 0.3, 'pop', 0.6); a(L(22) + 1.0, 'beep', 0.3); a(L(22) + 1.3, 'beep', 0.3); a(L(22) + 1.4, 'pop', 0.6); a(L(22) + D(22) * 0.5, 'rev', 0.2, 1.0);
// 23: the most dangerous room
a(L(23) + 0.4, 'pop', 0.7); a(L(23) + 0.4, 'boom', 0.25); a(L(23) + 1.6, 'pop', 0.6); a(L(23) + 1.0, 'clink', 0.3);
// 24: share it
for (let k = 0; k < 4; k++) a(L(24) + 0.4 + k * 0.3, 'pop', 0.5); a(L(24) + 0.2, 'notify', 0.35);
// 25: outro
a(L(25) + 0.1, 'motor', 0.15, D(25) + 1.2); a(L(25) + 0.3, 'pop', 0.6); a(L(25) + 0.4, 'pop', 0.7); a(L(25) + 0.5, 'chime', 0.5);
require('fs').writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: false, cues: c }, null, 1));
console.log(c.length + ' cues');
