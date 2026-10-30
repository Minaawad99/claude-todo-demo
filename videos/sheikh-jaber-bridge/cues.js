// Sound cues from the line timings: node cues.js → cues.json
// Recorded sounds in sfx/px-*.mp3 are Pixabay sound effects (Pixabay Content License) the channel sent for earlier episodes
// (waves, gulls, breeze, wind, bridge traffic, a passing car, a crane, a water pump, a concrete mixer, pouring, a generator,
// underwater, bubbles, a metal clang, a ship's horn, a night street, a ticking clock), kept out of git.
// No recorded sound plays in two shots in a row.
global.window = {}; eval(require('fs').readFileSync(__dirname + '/timing.js', 'utf8'));
const T = window.TIMING.lines, L = i => i >= T.length ? window.TIMING.duration : T[i].start, D = i => L(i + 1) - L(i), c = [];
const a = (t, fx, gain, dur) => c.push(Object.assign({ t: +t.toFixed(2), fx, gain }, dur ? { dur } : {}));
const rec = (t, file, gain, from, dur, duck) => c.push(Object.assign({ t: +Math.max(0, t).toFixed(2), file: 'sfx/px-' + file + '.mp3', gain: +(gain * 1.2).toFixed(2), from: from || 0 }, dur ? { dur: +dur.toFixed(2) } : {}, duck != null ? { duck } : {}));
const bed = (i, file, g, from) => rec(L(i), file, g, from, D(i) + 0.2, 1.2);
for (let i = 1; i < T.length; i++) a(L(i) - 0.08, 'whoosh', 0.3);
// 0: driving 36 km over the sea
bed(0, 'waves', 0.35, 1); rec(L(0) + 1.0, 'car-pass', 0.4, 0, 3.2, 1.0); a(L(0) + 1.2, 'pop', 0.6); a(L(0) + 2.4, 'pop', 0.6);
// 1: the Sheikh Jaber causeway, Kuwait
bed(1, 'traffic-bridge', 0.3, 10); rec(L(1) + 0.3, 'gulls', 0.3, 2, D(1) - 0.3, 1.0); a(L(1) + 0.6, 'pop', 0.6); a(L(1) + 1.8, 'pop', 0.5);
// 2: how, in the middle of the sea?
bed(2, 'breeze', 0.3, 5); a(L(2) + 0.6, 'ping', 0.3); a(L(2) + 1.0, 'pop', 0.6); a(L(2) + 1.4, 'ping', 0.3);
// 3: brand
bed(3, 'waves', 0.3, 9); a(L(3) + 0.05, 'pop', 0.9); a(L(3) + 0.2, 'chime', 0.5);
// 4: the map, across the bay
for (let k = 0; k < 8; k++) a(L(4) + 0.5 + k * 0.28, 'tick', 0.2); a(L(4) + 0.3, 'pop', 0.5); a(L(4) + 0.8, 'pop', 0.5); a(L(4) + 2.4, 'pop', 0.6);
// 5: over an hour round the bay, under half an hour across
rec(L(5), 'clock-ticking', 0.3, 0, D(5), 1.2); a(L(5) + 0.6, 'pop', 0.5); a(L(5) + 1.6, 'pop', 0.6); a(L(5) + 2.6, 'chime', 0.4);
// 6: 2013, Hyundai, the first spans
rec(L(6) + 0.2, 'crane', 0.35, 1, D(6) - 0.2, 1.2); a(L(6) + 0.5, 'pop', 0.7); a(L(6) + 2.4, 'pop', 0.5);
// 7: how do the piers stand on the seabed?
bed(7, 'underwater', 0.35, 20); a(L(7) + 1.2, 'pop', 0.5); a(L(7) + 2.0, 'ping', 0.3);
// 8: the piles
rec(L(8) + 0.4, 'bubbles', 0.3, 4, D(8) - 0.4, 1.2); for (let k = 0; k < 3; k++) a(L(8) + 0.7 + k * 0.4, 'thud', 0.4); a(L(8) + 1.6, 'pop', 0.6);
// 9: drill, steel, concrete
rec(L(9), 'generator', 0.35, 2, 2.0, 1.2); a(L(9) + 1.9, 'clank', 0.4); rec(L(9) + 2.9, 'pour', 0.4, 1, D(9) - 2.9, 1.0); a(L(9) + 0.3, 'pop', 0.5); a(L(9) + 1.9, 'pop', 0.5); a(L(9) + 3.0, 'pop', 0.5);
// 10: 60 metres down to dense sand
bed(10, 'underwater', 0.3, 80); for (let k = 0; k < 7; k++) a(L(10) + 0.4 + k * 0.4, 'tick', 0.2); a(L(10) + 1.2, 'pop', 0.6); a(L(10) + 2.4, 'pop', 0.5);
// 11: more than 1,500 piles
for (let k = 0; k < 18; k++) a(L(11) + 0.2 + k * 0.17, 'tick', 0.16); a(L(11) + D(11) - 1.2, 'chime', 0.45); a(L(11) + D(11) - 1.1, 'pop', 0.6);
// 12: a base under the water?
rec(L(12), 'bubbles', 0.35, 30, D(12), 1.2); a(L(12) + 0.8, 'ping', 0.3); a(L(12) + 1.0, 'pop', 0.6);
// 13: the shell goes down, the water is pumped out
rec(L(13), 'crane', 0.3, 5, 2.2, 1.2); rec(L(13) + 2.2, 'water-pump', 0.35, 3, D(13) - 2.2, 1.0); a(L(13) + 2.0, 'thud', 0.5); a(L(13) + 0.6, 'pop', 0.5); a(L(13) + D(13) - 1.0, 'pop', 0.7);
// 14: poured dry below sea level
rec(L(14) + 0.3, 'concrete-mixer', 0.35, 2, D(14) - 0.3, 1.2); a(L(14) + 0.6, 'pop', 0.5); a(L(14) + 1.6, 'pop', 0.6);
// 15: the piers rise in a long row
bed(15, 'waves', 0.3, 5); for (let k = 0; k < 10; k++) a(L(15) + 0.1 + k * 0.18, 'thud', 0.18); a(L(15) + 1.4, 'pop', 0.6);
// 16: made on land
bed(16, 'breeze', 0.3, 40); rec(L(16) + 1.2, 'metal-clang', 0.3, 0, 1.6, 1.0); a(L(16) + 0.8, 'pop', 0.7); a(L(16) + 0.4, 'servo', 0.3);
// 17: one piece between two piers, up to 60 m
rec(L(17) + 0.4, 'pour', 0.35, 4, 3.0, 1.2); rec(L(17) + 3.4, 'concrete-mixer', 0.25, 12, D(17) - 3.4, 1.0); a(L(17) + 0.6, 'pop', 0.6); a(L(17) + 2.0, 'pop', 0.6);
// 18: 1,800 tonnes, more than a thousand cars
a(L(18) + 0.3, 'creak', 0.4); for (let k = 0; k < 14; k++) a(L(18) + 0.6 + k * 0.28, 'clink', 0.2); a(L(18) + 0.5, 'pop', 0.6); a(L(18) + 2.0, 'pop', 0.6); rec(L(18) + D(18) - 0.9, 'metal-clang', 0.25, 0, 0.9, 1.0);
// 19: the floating crane sets the span on two piers
bed(19, 'waves', 0.3, 12); rec(L(19) + 0.4, 'crane', 0.4, 3, D(19) - 1.2, 1.2); a(L(19) + 0.8, 'pop', 0.6); a(L(19) + 5.2, 'thud', 0.7); a(L(19) + 4.5, 'pop', 0.7);
// 20: the sail tower, 151 m
rec(L(20), 'wind', 0.35, 3, D(20) + 0.2, 1.2); rec(L(20) + 0.6, 'gulls', 0.25, 9, 2.2, 1.0); a(L(20) + 1.4, 'pop', 0.5); a(L(20) + 2.8, 'pop', 0.7); a(L(20) + 2.9, 'chime', 0.4);
// 21: the cables, a 120 m channel for ships
bed(21, 'traffic-bridge', 0.3, 40); rec(L(21) + 1.0, 'horn', 0.35, 0, 2.4, 0.8); a(L(21) + 0.4, 'pop', 0.5); a(L(21) + 1.8, 'pop', 0.6);
// 22: two artificial islands
bed(22, 'breeze', 0.3, 70); a(L(22) + 0.4, 'pop', 0.6); a(L(22) + 0.9, 'pop', 0.6); a(L(22) + 1.7, 'pop', 0.6);
// 23: opened May 2019, about 3 billion dollars
bed(23, 'night-street', 0.3, 20); for (let k = 0; k < 5; k++) a(L(23) + 0.3 + k * 1.1, 'boom', 0.25); a(L(23) + 0.4, 'pop', 0.6); a(L(23) + 1.8, 'pop', 0.6); a(L(23) + 2.0, 'chime', 0.4);
// 24: the payoff, from the car down to the piles
bed(24, 'underwater', 0.25, 150); rec(L(24) + 0.3, 'car-pass', 0.35, 0, 3.0, 1.0); a(L(24) + 0.5, 'pop', 0.5); a(L(24) + 2.2, 'pop', 0.5); a(L(24) + 3.6, 'pop', 0.6);
// 25: outro
rec(L(25), 'waves', 0.35, 14, D(25) + 1.5, 1.0); rec(L(25) + 0.3, 'gulls', 0.35, 5, 2.4, 1.0); a(L(25) + 0.4, 'pop', 0.7);
require('fs').writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: false, cues: c }, null, 1));
console.log(c.length + ' cues');
