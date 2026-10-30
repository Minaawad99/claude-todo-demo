// Sound cues from the line timings: node cues.js → cues.json
// Recorded sounds in sfx/px-*.mp3 are Pixabay sound effects (Pixabay Content License) the channel sent for earlier episodes
// (waves, a ship's horn, metal clang, bubbles, underwater, a drop, a splash, pouring water, a generator, a breeze, a clock),
// kept out of git. No recorded sound plays in two shots in a row.
global.window = {}; eval(require('fs').readFileSync(__dirname + '/timing.js', 'utf8'));
const T = window.TIMING.lines, L = i => i >= T.length ? window.TIMING.duration : T[i].start, D = i => L(i + 1) - L(i), c = [];
const a = (t, fx, gain, dur) => c.push(Object.assign({ t: +t.toFixed(2), fx, gain }, dur ? { dur } : {}));
const rec = (t, file, gain, from, dur, duck) => c.push(Object.assign({ t: +Math.max(0, t).toFixed(2), file: 'sfx/px-' + file + '.mp3', gain: +(gain * 1.2).toFixed(2), from: from || 0 }, dur ? { dur: +dur.toFixed(2) } : {}, duck != null ? { duck } : {}));
const bed = (i, file, g, from) => rec(L(i), file, g, from, D(i) + 0.2, 1.2);
for (let i = 1; i < T.length; i++) a(L(i) - 0.08, 'whoosh', 0.3);
// 0: a nail dropped into a basin sinks
bed(0, 'breeze', 0.3, 5); rec(L(0) + 0.95, 'drop', 0.7, 0.4, 0.5, 0.8); rec(L(0) + 1.05, 'bubbles', 0.4, 20, 1.4, 1.0); a(L(0) + 1.8, 'pop', 0.6);
// 1: a 200,000-ton steel ship floats
bed(1, 'waves', 0.4, 2); rec(L(1) + 0.8, 'horn', 0.45, 0, 2.1, 1.2); a(L(1) + 0.6, 'pop', 0.6); a(L(1) + 1.8, 'pop', 0.6);
// 2: one big hole
rec(L(2) + 0.3, 'pour', 0.45, 0.9, D(2) - 0.3, 1.2); rec(L(2) + 0.2, 'metal-clang', 0.4, 0, 1.0); a(L(2) + 0.8, 'pop', 0.5);
// 3: brand
bed(3, 'waves', 0.35, 9); a(L(3) + 0.05, 'pop', 0.9); a(L(3) + 0.2, 'chime', 0.5);
// 4: steel is eight times heavier; a solid block sinks
a(L(4) + 0.2, 'creak', 0.3); a(L(4) + 1.0, 'thud', 0.5); rec(L(4) + 1.6, 'rock-splash', 0.5, 0, 1.6, 1.0); a(L(4) + 0.9, 'pop', 0.5); a(L(4) + 3.0, 'pop', 0.5);
// 5: hollow inside, full of air
bed(5, 'breeze', 0.3, 30); for (let k = 0; k < 5; k++) a(L(5) + 0.4 + k * 0.25, 'tick', 0.2); a(L(5) + 1.0, 'pop', 0.5); a(L(5) + 2.2, 'pop', 0.5);
// 6: lowered into the tank, the water rises
rec(L(6) + 0.4, 'pour', 0.35, 3, D(6) - 0.6, 1.2); a(L(6) + 0.9, 'pop', 0.5); a(L(6) + 1.6, 'pop', 0.5);
// 7: the buoyant force pushes up
bed(7, 'waves', 0.35, 14); a(L(7) + 0.3, 'whoosh', 0.25); a(L(7) + 0.9, 'pop', 0.7);
// 8: equal to the weight of the water pushed aside
a(L(8) + 0.4, 'creak', 0.3); a(L(8) + 1.4, 'clink', 0.4); a(L(8) + 1.6, 'pop', 0.6);
// 9: the ship settles until the two weigh the same
bed(9, 'breeze', 0.3, 55); for (let k = 0; k < 10; k++) a(L(9) + 0.2 + k * 0.25, 'tick', 0.15); a(L(9) + D(9) * 0.75, 'chime', 0.45);
// 10: 200,000 tons each side
rec(L(10) + 0.3, 'metal-clang', 0.4, 0, 1.0); a(L(10) + 0.5, 'pop', 0.5); a(L(10) + 1.6, 'pop', 0.5); a(L(10) + 2.4, 'clink', 0.3);
// 11: eighty Olympic pools
bed(11, 'waves', 0.25, 4); for (let k = 0; k < 16; k++) a(L(11) + k * 0.125, 'pop', 0.25); a(L(11) + 2.1, 'chime', 0.4);
// 12: a wide, flat bottom
rec(L(12), 'underwater', 0.4, 30, D(12) + 0.2, 1.2); a(L(12) + 1.2, 'pop', 0.6);
// 13: try it with foil
rec(L(13) + 0.6, 'drop', 0.55, 0.4, 0.5, 0.8); rec(L(13) + 0.75, 'bubbles', 0.35, 60, 1.2, 1.0); a(L(13) + 1.2, 'pop', 0.5); a(L(13) + 2.6, 'pop', 0.5);
// 14: Archimedes, 2,000 years ago
bed(14, 'breeze', 0.3, 70); a(L(14) + 0.6, 'pop', 0.6); a(L(14) + 1.8, 'chime', 0.4);
// 15: the bath overflows
rec(L(15) + 0.4, 'pour', 0.5, 6, D(15) - 0.4, 1.2); a(L(15) + 1.5, 'pop', 0.6);
// 16: «Eureka!»
for (let t = 0.1; t < D(16) - 0.2; t += 0.22) a(L(16) + t, 'thud', 0.12); a(L(16) + 0.3, 'pop', 0.8); a(L(16) + 0.5, 'chime', 0.4);
// 17: the load line
bed(17, 'waves', 0.35, 17); a(L(17) + 0.8, 'pop', 0.6);
// 18: the water covers the line: overloaded
for (let k = 0; k < 4; k++) a(L(18) + 1.8 + k * 0.32, 'beep', 0.25); a(L(18) + 1.9, 'pop', 0.6);
// 19: deeper in the Nile than in the sea
bed(19, 'breeze', 0.3, 85); a(L(19) + 0.5, 'pop', 0.5); a(L(19) + 1.4, 'pop', 0.5); a(L(19) + 2.2, 'pop', 0.5);
// 20: salt water is heavier
rec(L(20), 'bubbles', 0.3, 100, D(20) + 0.2, 1.2); a(L(20) + 0.4, 'pop', 0.5); a(L(20) + 1.2, 'pop', 0.5); a(L(20) + 2.0, 'clink', 0.3);
// 21: ballast tanks fill
rec(L(21) + 0.4, 'pour', 0.4, 8, D(21) - 0.6, 1.2); rec(L(21), 'generator', 0.25, 3, D(21), 1.2); a(L(21) + 0.9, 'pop', 0.5); a(L(21) + 2.2, 'pop', 0.5);
// 22: Ever Given across the canal
bed(22, 'waves', 0.35, 6); rec(L(22) + 0.4, 'horn', 0.4, 0, 2.1, 1.2); a(L(22) + 0.6, 'pop', 0.6); a(L(22) + 1.8, 'pop', 0.5); a(L(22) + 2.8, 'pop', 0.5);
// 23: six days stuck, ships queueing
rec(L(23), 'clock-ticking', 0.35, 0, D(23), 1.2); a(L(23) + 0.6, 'pop', 0.6); a(L(23) + 1.6, 'pop', 0.5);
// 24: water gets in, the ship sinks
rec(L(24), 'underwater', 0.35, 120, D(24) + 0.2, 1.2); rec(L(24) + 0.3, 'metal-clang', 0.45, 0, 1.2); a(L(24) + 0.9, 'pop', 0.5);
// 25: the payoff
bed(25, 'waves', 0.35, 1); a(L(25) + 0.5, 'pop', 0.5); a(L(25) + 1.0, 'pop', 0.5); a(L(25) + 1.4, 'chime', 0.5);
// 26: outro
rec(L(26), 'breeze', 0.35, 100, D(26) + 1.5, 1.0); rec(L(26) + 0.3, 'horn', 0.35, 0, 2.1, 1.0); a(L(26) + 0.4, 'pop', 0.7);
require('fs').writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: false, cues: c }, null, 1));
console.log(c.length + ' cues');
