// Sound cues from the line timings: node cues.js → cues.json
// Recorded sounds in sfx/px-*.mp3 are Pixabay sound effects (Pixabay Content License) the channel sent for earlier episodes
// (an electric hum, a power buzz, an electric zap, sparks, waves, underwater, bubbles, wind, cicadas, a ticking clock, a night
// street, a breeze, gulls, a light switch, beeps, a ding, an anchor chain, a ship's horn, traffic), kept out of git.
// No recorded sound plays in two shots in a row.
global.window = {}; eval(require('fs').readFileSync(__dirname + '/timing.js', 'utf8'));
const T = window.TIMING.lines, L = i => i >= T.length ? window.TIMING.duration : T[i].start, D = i => L(i + 1) - L(i), c = [];
const a = (t, fx, gain, dur) => c.push(Object.assign({ t: +t.toFixed(2), fx, gain }, dur ? { dur } : {}));
const rec = (t, file, gain, from, dur, duck) => c.push(Object.assign({ t: +Math.max(0, t).toFixed(2), file: 'sfx/px-' + file + '.mp3', gain: +(gain * 1.2).toFixed(2), from: from || 0 }, dur ? { dur: +dur.toFixed(2) } : {}, duck != null ? { duck } : {}));
const bed = (i, file, g, from) => rec(L(i), file, g, from, D(i) + 0.2, 1.2);
for (let i = 1; i < T.length; i++) a(L(i) - 0.08, 'whoosh', 0.3);
// 0: did you know? flags and a humming line
bed(0, 'electric-hum', 0.3, 1); rec(L(0) + 0.4, 'wind', 0.2, 2, D(0) - 0.4, 1.0); a(L(0) + 0.5, 'pop', 0.6); a(L(0) + 1.7, 'pop', 0.6); a(L(0) + 2.6, 'ping', 0.3);
// 1: a cable under the Red Sea
bed(1, 'underwater', 0.35, 20); rec(L(1) + 0.3, 'bubbles', 0.25, 10, D(1) - 0.3, 1.0); a(L(1) + 0.6, 'pop', 0.6);
// 2: brand
rec(L(2), 'breeze', 0.25, 30, D(2), 1.2); a(L(2) + 0.05, 'pop', 0.9); a(L(2) + 0.2, 'chime', 0.5);
// 3: the map, 3000 MW
for (let k = 0; k < 10; k++) a(L(3) + 0.4 + k * 0.26, 'tick', 0.2); a(L(3) + 0.2, 'pop', 0.5); a(L(3) + 0.7, 'pop', 0.5); rec(L(3) + 2.0, 'ding', 0.35, 0, 1.1, 1.0); a(L(3) + 2.0, 'pop', 0.7);
// 4: both ways
bed(4, 'power-buzz', 0.25, 1); a(L(4) + 0.3, 'pop', 0.6); a(L(4) + D(4) / 2 + 0.1, 'pop', 0.6); a(L(4) + D(4) / 2, 'whoosh', 0.35);
// 5: peak time, two clocks
rec(L(5), 'clock-ticking', 0.35, 0, D(5), 1.2); a(L(5) + 0.8, 'pop', 0.6); a(L(5) + 1.8, 'ping', 0.4);
// 6: noon heat, air conditioners
bed(6, 'cicadas', 0.3, 5); a(L(6) + 0.4, 'pop', 0.6); a(L(6) + 1.8, 'pop', 0.6); a(L(6) + 1.0, 'motor', 0.25, 2.0);
// 7: night, lights on
bed(7, 'night-street', 0.3, 20); for (let k = 0; k < 5; k++) rec(L(7) + 0.5 + k * 0.6, 'light-switch', 0.35, 0, 0.5, 1.0); a(L(7) + 0.4, 'pop', 0.6); a(L(7) + 1.8, 'pop', 0.5);
// 8: 3 to 6 hours, lend each other
for (let k = 0; k < 8; k++) a(L(8) + 0.3 + k * 0.35, 'tick', 0.18); a(L(8) + 0.4, 'pop', 0.6); a(L(8) + 2.6, 'pop', 0.6); a(L(8) + 0.6, 'whoosh', 0.3); a(L(8) + 2.4, 'whoosh', 0.3);
// 9: 50 vs 60 Hz, sparks
rec(L(9) + 0.2, 'power-buzz', 0.25, 4, 2.6, 1.2); rec(L(9) + 2.8, 'sparks', 0.4, 1, D(9) - 2.8, 1.0); a(L(9) + 0.3, 'pop', 0.6); a(L(9) + 1.0, 'pop', 0.6); a(L(9) + 3.2, 'boom', 0.3);
// 10: AC into DC
bed(10, 'electric-hum', 0.3, 6); a(L(10) + 0.3, 'pop', 0.5); a(L(10) + 1.2, 'pop', 0.6); a(L(10) + 0.8, 'charge', 0.35); a(L(10) + 2.6, 'pop', 0.5);
// 11: HVDC 500 kV
rec(L(11) + 0.3, 'electricity', 0.4, 0, 2.6, 1.0); a(L(11) + 0.3, 'pop', 0.8); a(L(11) + 1.6, 'pop', 0.6); a(L(11) + 0.4, 'zap', 0.4);
// 12: Badr, east of Cairo
bed(12, 'breeze', 0.3, 60); a(L(12) + 0.4, 'pop', 0.5); a(L(12) + 1.6, 'pop', 0.6); a(L(12) + 1.0, 'whoosh', 0.3);
// 13: the converter station
bed(13, 'electric-hum', 0.35, 12); a(L(13) + 0.4, 'pop', 0.6); a(L(13) + 1.6, 'pop', 0.5); for (let k = 0; k < 3; k++) rec(L(13) + 1.0 + k * 0.7, 'beep', 0.2, 0, 0.3, 1.0);
// 14: towers across Sinai
bed(14, 'wind', 0.35, 6); a(L(14) + 0.4, 'pop', 0.6); a(L(14) + 2.2, 'pop', 0.6);
// 15: the sea
bed(15, 'waves', 0.35, 3); rec(L(15) + 0.2, 'gulls', 0.25, 2, D(15) - 0.2, 1.0); a(L(15) + 0.3, 'pop', 0.5); a(L(15) + 0.7, 'pop', 0.8);
// 16: the cable ship lays 22 km on the seabed
bed(16, 'underwater', 0.35, 90); rec(L(16) + 0.2, 'anchor', 0.3, 2, 2.4, 1.0); a(L(16) + 0.7, 'pop', 0.6); a(L(16) + 2.0, 'pop', 0.5);
// 17: the layers of the cable
for (let k = 0; k < 5; k++) a(L(17) + 0.3 + k * 0.5, 'clink', 0.25); rec(L(17) + 2.6, 'bubbles', 0.3, 40, D(17) - 2.6, 1.0); a(L(17) + 1.0, 'pop', 0.5); a(L(17) + 1.8, 'pop', 0.5); a(L(17) + 2.8, 'pop', 0.6);
// 18: AC leaks, DC gets there
bed(18, 'underwater', 0.3, 200); a(L(18) + 0.6, 'pop', 0.6); a(L(18) + 2.0, 'pop', 0.6); a(L(18) + 2.1, 'chime', 0.35);
// 19: on to Tabuk and East Madinah
for (let k = 0; k < 10; k++) a(L(19) + 0.3 + k * 0.3, 'tick', 0.18); a(L(19) + 0.8, 'pop', 0.6); a(L(19) + 2.6, 'pop', 0.6); rec(L(19) + 2.6, 'ding', 0.3, 0, 1.1, 1.0);
// 20: back to AC at 60 Hz
bed(20, 'electric-hum', 0.3, 3); a(L(20) + 0.4, 'pop', 0.6); a(L(20) + 1.6, 'pop', 0.6); a(L(20) + 1.0, 'charge', 0.3);
// 21: 1,350 km
rec(L(21), 'breeze', 0.25, 80, D(21), 1.2); for (let k = 0; k < 12; k++) a(L(21) + 1.6 + k * 0.13, 'tick', 0.16); a(L(21) + 0.4, 'pop', 0.6); a(L(21) + 2.4, 'pop', 0.6);
// 22: 1.8 billion dollars, 2012
for (let k = 0; k < 18; k++) a(L(22) + 0.15 + k * (D(22) - 0.5) / 18, 'clink', 0.18); a(L(22) + 0.6, 'pop', 0.6); a(L(22) + 1.4, 'pop', 0.5);
// 23: two phases
rec(L(23), 'power-buzz', 0.25, 2, D(23), 1.2); a(L(23) + 0.3, 'pop', 0.5); a(L(23) + 1.0, 'pop', 0.6); a(L(23) + 2.0, 'pop', 0.5); a(L(23) + 2.3, 'pop', 0.6);
// 24: tests almost done, mid-November
for (let k = 0; k < 4; k++) rec(L(24) + 0.9 + k * 0.5, 'beep', 0.25, 0, 0.3, 1.0); a(L(24) + 0.4, 'pop', 0.6); a(L(24) + 2.0, 'pop', 0.7); a(L(24) + 2.1, 'chime', 0.4);
// 25: a shared Arab power market?
bed(25, 'electric-hum', 0.25, 15); a(L(25) + 2.0, 'pop', 0.7); a(L(25) + 2.1, 'chime', 0.4);
// 26: outro
rec(L(26), 'wind', 0.25, 10, D(26) + 1.5, 1.0); a(L(26) + 0.4, 'pop', 0.7); a(L(26) + 0.5, 'chime', 0.5);
require('fs').writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: false, cues: c }, null, 1));
console.log(c.length, 'cues');
