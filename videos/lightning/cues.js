// Sound cues from the line timings: node cues.js → cues.json
// Recorded sounds in sfx/px-*.mp3 are Pixabay sound effects (Pixabay Content License): thunder, rain and storm sent for this
// episode, sparks / hum / buzz / electricity / clock / wind reused from earlier episodes; kept out of git.
// The strike times match the shots in remotion/src/lightning/Lightning.tsx (a shot starts 0.05 s before its line; the
// flash comes `grow` = 0.45 s after the leader starts). No recorded sound plays in two shots in a row.
global.window = {}; eval(require('fs').readFileSync(__dirname + '/timing.js', 'utf8'));
const T = window.TIMING.lines, L = i => i >= T.length ? window.TIMING.duration : (i === 0 ? 0 : T[i].start - 0.05), D = i => L(i + 1) - L(i), c = [];
const a = (t, fx, gain, dur) => c.push(Object.assign({ t: +t.toFixed(2), fx, gain }, dur ? { dur } : {}));
const rec = (t, file, gain, from, dur, duck) => c.push(Object.assign({ t: +Math.max(0, t).toFixed(2), file: 'sfx/px-' + file + '.mp3', gain: +(gain * 1.2).toFixed(2), from: from || 0 }, dur ? { dur: +dur.toFixed(2) } : {}, duck != null ? { duck } : {}));
const clap = (t, g) => rec(t - 0.05, 'thunder-clap', g * 0.8, 0.55, 5.5, 1.0);          // the crack is at 0.58 s in the clip
const far = (t, g, dur) => rec(t, 'distant-thunder', g, 0.45, dur || 4.5, 1.0);
let ro = 0; const rain = (i, g) => { rec(L(i), 'heavy-rain', g, (ro * 7.3) % 22, D(i) + 0.2, 1.2); ro++; };   // the rain bed, a different stretch each shot
for (let i = 1; i < T.length; i++) a(L(i) - 0.03, 'whoosh', 0.25);
// 0: the city in the rain, the first strike
rec(0, 'storm-ambience', 0.5, 0, 1.6, 1.0); rain(0, 0.45); clap(1.45, 0.9);
// 1: questions; a far rumble, then a small spark
rain(1, 0.4); far(L(1) + 0.75, 0.7, 3); rec(L(1) + 2.2, 'sparks', 0.35, 1, 0.5); a(L(1) + 0.35, 'pop', 0.5); a(L(1) + 1.55, 'pop', 0.5);
// 2: light first, the sound after
rain(2, 0.4); clap(L(2) + 1.3, 0.8);
// 3: brand
rain(3, 0.35); a(L(3) + 0.15, 'pop', 0.9); a(L(3) + 0.3, 'chime', 0.5); far(L(3) + 1.55, 0.5, 2);
// 4: the cumulonimbus, the 10 km ruler
rec(L(4), 'storm-ambience', 0.5, 0.5, Math.min(4.4, D(4)), 1.2); for (let k = 0; k < 10; k++) a(L(4) + 0.2 + k * 0.18, 'tick', 0.15); a(L(4) + 0.8, 'pop', 0.5); a(L(4) + 2.2, 'pop', 0.6);
// 5: the hot air rising
rec(L(5), 'wind', 0.55, 3, D(5) + 0.2, 1.2); a(L(5) + 0.4, 'pop', 0.5); a(L(5) + 1.9, 'pop', 0.5);
// 6: ice hitting ice
for (let k = 0; k < 9; k++) a(L(6) + 0.3 + k * 0.37, k % 2 ? 'clink' : 'tick', 0.25); a(L(6) + 0.6, 'pop', 0.5); a(L(6) + 1.8, 'pop', 0.5);
// 7: charges jump from grain to grain
rec(L(7) + 0.2, 'sparks', 0.4, 3, D(7) - 0.2, 1.2); a(L(7) + 0.5, 'pop', 0.5);
// 8: + up, − down
rec(L(8) + 0.3, 'electric-hum', 0.4, 2, D(8) - 0.3, 1.2); a(L(8) + 0.6, 'pop', 0.5); a(L(8) + 2.0, 'pop', 0.5);
// 9: a giant battery
rec(L(9) + 0.2, 'power-buzz', 0.4, 1, D(9) - 0.2, 1.2); a(L(9) + 0.3, 'pop', 0.7);
// 10: the ground charges up
rain(10, 0.3); a(L(10) + 0.3, 'hum', 0.3, D(10) - 0.4); a(L(10) + 1.0, 'pop', 0.6);
// 11: the air can't hold it any more
rain(11, 0.3); rec(L(11) + 0.2, 'power-buzz', 0.45, 4, D(11) - 0.2, 1.2); a(L(11) + 0.4, 'pop', 0.5);
// 12: the stepped leader, a crackle per step
rain(12, 0.3); for (let k = 0; k < 11; k++) a(L(12) + k * (D(12) * 0.92 / 11), 'zap', 0.3); a(L(12) + 0.5, 'pop', 0.5); a(L(12) + 1.8, 'pop', 0.5);
// 13: the streamer rising from the rod
rain(13, 0.3); rec(L(13) + 0.2, 'electricity', 0.5, 0, Math.min(2.7, D(13) - 0.2), 1.2); a(L(13) + 0.7, 'pop', 0.5);
// 14: they meet, the return stroke
rain(14, 0.3); clap(L(14) + 0.25, 1.0); a(L(14) + 0.6, 'pop', 0.6);
// 15: under a second
rain(15, 0.3); rec(L(15), 'clock', 0.4, 0, D(15), 1.2); a(L(15) + 0.7, 'zap', 0.5); a(L(15) + 1.7, 'zap', 0.4);
// 16: 30,000 degrees
rec(L(16) + 0.2, 'electric-hum', 0.45, 8, D(16) - 0.2, 1.2); for (let k = 0; k < 12; k++) a(L(16) + 0.3 + k * 0.2, 'tick', 0.15); a(L(16) + 3.1, 'chime', 0.5);
// 17: the air bursts: thunder
clap(L(17) + 0.3, 1.0); a(L(17) + 0.5, 'pop', 0.6);
// 18: light vs sound: flash now, rumble later
rain(18, 0.35); far(L(18) + 1.6, 0.8, D(18) - 1.4); a(L(18) + 1.0, 'pop', 0.5);
// 19: count the seconds, then the thunder arrives
rain(19, 0.35); rec(L(19) + 0.6, 'clock', 0.45, 2, 3, 1.2); for (let k = 0; k < 3; k++) a(L(19) + k + 0.05, 'pop', 0.5); clap(L(19) + D(19) - 1.5, 0.8);
// 20: the globe, 44 a second
rec(L(20), 'sparks', 0.35, 6, D(20), 1.2); for (let k = 0; k < 10; k++) a(L(20) + 0.2 + k * 0.25, 'tick', 0.15); a(L(20) + 0.2, 'pop', 0.6);
// 21: the Empire State struck again and again
rain(21, 0.3); for (let t = 0; t < D(21); t += 1 / 1.4) a(L(21) + t + 0.05, 'zap', 0.45); a(L(21) + 0.5, 'pop', 0.5); a(L(21) + 1.3, 'pop', 0.5);
// 22: the lightning rod carries it to the ground
rain(22, 0.3); far(L(22) + 0.75, 0.8, 3); rec(L(22) + 0.8, 'electric-hum', 0.4, 12, D(22) - 0.8, 1.2); far(L(22) + 3.75, 0.6, 2.5); a(L(22) + 0.9, 'pop', 0.5); a(L(22) + 3.5, 'chime', 0.4);
// 23: the payoff, one big crack
rain(23, 0.35); clap(L(23) + 0.75, 1.0); a(L(23) + 0.2, 'pop', 0.5); a(L(23) + 1.2, 'pop', 0.5); a(L(23) + 2.2, 'pop', 0.5);
// 24: outro, rain and a far rumble
rec(L(24), 'heavy-rain', 0.4, 3, D(24) + 1.5, 1.0); far(L(24) + 1.65, 0.6, 2.5);
require('fs').writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: false, cues: c }, null, 1));
console.log(c.length + ' cues');
