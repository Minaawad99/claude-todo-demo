// Sound cues from the line timings: node cues.js → cues.json
// Recorded sounds in sfx/px-*.mp3 are Pixabay sound effects (Pixabay Content License) the channel sent for earlier episodes
// (frying, a sizzle, a light switch, sparks, a ticking clock, beeps, a ding, a breeze, wind, bubbles, pouring, a tap, a door,
// a thunder clap, a drop), kept out of git. No recorded sound plays in two shots in a row.
global.window = {}; eval(require('fs').readFileSync(__dirname + '/timing.js', 'utf8'));
const T = window.TIMING.lines, L = i => i >= T.length ? window.TIMING.duration : T[i].start, D = i => L(i + 1) - L(i), c = [];
const a = (t, fx, gain, dur) => c.push(Object.assign({ t: +t.toFixed(2), fx, gain }, dur ? { dur } : {}));
const rec = (t, file, gain, from, dur, duck) => c.push(Object.assign({ t: +Math.max(0, t).toFixed(2), file: 'sfx/px-' + file + '.mp3', gain: +(gain * 1.2).toFixed(2), from: from || 0 }, dur ? { dur: +dur.toFixed(2) } : {}, duck != null ? { duck } : {}));
const bed = (i, file, g, from) => rec(L(i), file, g, from, D(i) + 0.2, 1.2);
for (let i = 1; i < T.length; i++) a(L(i) - 0.08, 'whoosh', 0.3);
// 0: stop! the cylinder tips
a(L(0) + 0.05, 'boom', 0.35); a(L(0) + 0.6, 'creak', 0.3); a(L(0) + 2.0, 'clank', 0.5); a(L(0) + 1.6, 'pop', 0.8); a(L(0) + 0.2, 'pop', 0.6);
// 1: the last of the gas, a flare
bed(1, 'frying', 0.25, 10); a(L(1) + 1.8, 'spray', 0.5, 1.6); a(L(1) + 1.9, 'pop', 0.7); a(L(1) + 0.4, 'pop', 0.5);
// 2: brand
a(L(2) + 0.05, 'pop', 0.9); a(L(2) + 0.2, 'chime', 0.5); rec(L(2) + 0.5, 'tap', 0.3, 0, 1.0, 1.0);
// 3: liquid under pressure
a(L(3) + 0.6, 'fill', 0.35); a(L(3) + 0.3, 'pop', 0.6); a(L(3) + 1.6, 'pop', 0.6); a(L(3) + 2.0, 'creak', 0.3);
// 4: liquid below, gas above
rec(L(4) + 0.3, 'bubbles', 0.25, 20, D(4) - 0.3, 1.2); a(L(4) + 0.4, 'pop', 0.5); a(L(4) + 1.4, 'pop', 0.5); a(L(4) + 2.4, 'pop', 0.5);
// 5: cooking, boiling slowly
bed(5, 'frying', 0.25, 40); a(L(5) + 0.6, 'pop', 0.5); a(L(5) + 1.8, 'pop', 0.5);
// 6: the regulator
for (let k = 0; k < 4; k++) a(L(6) + 0.3 + k * 0.25, 'tick', 0.2); a(L(6) + 0.4, 'pop', 0.6); a(L(6) + 1.6, 'pop', 0.5); rec(L(6) + 2.6, 'beep', 0.25, 0, 0.6, 1.0);
// 7: upright, calm blue flame
bed(7, 'sizzle', 0.2, 3); rec(L(7) + 0.4, 'ding', 0.35, 0, 1.1, 1.0); a(L(7) + 0.6, 'pop', 0.5); a(L(7) + 1.8, 'pop', 0.5);
// 8: tipped: the liquid reaches the valve
a(L(8) + 0.3, 'creak', 0.4); a(L(8) + 1.6, 'clank', 0.5); a(L(8) + 1.7, 'slosh', 0.45); a(L(8) + 0.3, 'pop', 0.6); a(L(8) + 2.0, 'pop', 0.7); rec(L(8) + 2.0, 'beep', 0.3, 0, 1.0, 1.0);
// 9: liquid in the regulator and hose
rec(L(9) + 0.4, 'pour', 0.3, 2, D(9) - 0.4, 1.2); a(L(9) + 0.6, 'pop', 0.6); a(L(9) + 1.8, 'pop', 0.5);
// 10: over 200 times its size
a(L(10) + 0.8, 'charge', 0.3); a(L(10) + 1.0, 'spray', 0.35, D(10) - 1.4); for (let k = 0; k < 12; k++) a(L(10) + 1.0 + k * 0.4, 'tick', 0.15); a(L(10) + 0.3, 'pop', 0.5); a(L(10) + 3.4, 'pop', 0.7);
// 11: a cloud in a second
rec(L(11), 'clock-ticking', 0.3, 0, D(11), 1.2); a(L(11) + 0.5, 'spray', 0.4, 1.2); a(L(11) + 1.4, 'pop', 0.7);
// 12: the flame leaps
rec(L(12) + 1.0, 'sizzle', 0.4, 6, D(12) - 1.0, 1.0); a(L(12) + 1.0, 'boom', 0.35); a(L(12) + 1.2, 'pop', 0.7); a(L(12) + 0.2, 'pop', 0.5);
// 13: frost on the valve
bed(13, 'wind', 0.3, 4); for (let k = 0; k < 6; k++) a(L(13) + 1.0 + k * 0.45, 'clink', 0.16); a(L(13) + 0.4, 'pop', 0.5); a(L(13) + 2.4, 'pop', 0.6);
// 14: cracks
for (let k = 0; k < 6; k++) a(L(14) + 0.7 + k * 0.4, 'snip', 0.3); a(L(14) + 0.3, 'pop', 0.5); a(L(14) + 1.8, 'pop', 0.7);
// 15: a hidden leak
bed(15, 'breeze', 0.2, 20); a(L(15) + 0.3, 'spray', 0.25, D(15) - 0.6); a(L(15) + 0.6, 'pop', 0.6); a(L(15) + 1.8, 'pop', 0.5);
// 16: heavier than air, sinks to the floor
a(L(16) + 0.4, 'fill', 0.25); a(L(16) + 0.3, 'pop', 0.6); a(L(16) + 2.0, 'pop', 0.6); rec(L(16) + 1.2, 'drop', 0.25, 0, 1.2, 1.0);
// 17: one spark
rec(L(17) + 1.2, 'light-switch', 0.5, 0, 0.5, 1.0); rec(L(17) + 1.3, 'sparks', 0.35, 1, 0.6, 1.0); rec(L(17) + 1.45, 'thunder-clap', 0.35, 0, D(17) - 1.45, 0.8); a(L(17) + 0.3, 'pop', 0.6); a(L(17) + 2.4, 'pop', 0.7);
// 18: why is the flame weak?
bed(18, 'frying', 0.15, 70); a(L(18) + 0.3, 'pop', 0.5); a(L(18) + 1.4, 'pop', 0.5); a(L(18) + 1.6, 'ping', 0.3);
// 19: the pressure drops
rec(L(19) + 0.3, 'bubbles', 0.2, 60, D(19) - 0.3, 1.2); for (let k = 0; k < 10; k++) a(L(19) + 0.3 + k * 0.45, 'tick', 0.15); a(L(19) + 0.4, 'pop', 0.5); a(L(19) + 1.8, 'pop', 0.6);
// 20: change it, don't tip, shake or heat it
a(L(20) + 0.3, 'pop', 0.7); rec(L(20) + 0.2, 'ding', 0.3, 0, 1.1, 1.0); a(L(20) + 0.7, 'pop', 0.6); a(L(20) + 1.3, 'pop', 0.6); a(L(20) + 1.9, 'pop', 0.6); a(L(20) + 1.0, 'clank', 0.25);
// 21: close the valve, open the windows
a(L(21) + 0.5, 'creak', 0.3); rec(L(21) + 1.8, 'door', 0.3, 0, 1.4, 1.0); rec(L(21) + 2.2, 'breeze', 0.3, 50, D(21) - 2.2, 1.0); a(L(21) + 0.4, 'pop', 0.6); a(L(21) + 1.8, 'pop', 0.6);
// 22: don't touch the light
a(L(22) + 0.6, 'pop', 0.8); a(L(22) + 1.4, 'pop', 0.6); a(L(22) + 0.7, 'ping', 0.3);
// 23: soapy water, not a match
rec(L(23) + 0.4, 'bubbles', 0.3, 100, 2.0, 1.0); a(L(23) + 0.4, 'pop', 0.6); a(L(23) + 1.4, 'pop', 0.5); a(L(23) + 2.4, 'pop', 0.7);
// 24: upright, ventilated, away from the fire
bed(24, 'breeze', 0.25, 80); a(L(24) + 0.3, 'pop', 0.6); a(L(24) + 1.0, 'pop', 0.5); a(L(24) + 1.8, 'pop', 0.6); a(L(24) + 0.35, 'chime', 0.35);
// 25: share it
for (let k = 0; k < 4; k++) a(L(25) + 0.4 + k * 0.3, 'pop', 0.5); rec(L(25) + 0.2, 'ding', 0.3, 0, 1.1, 1.0);
// 26: outro
rec(L(26), 'frying', 0.2, 100, D(26) + 1.5, 1.0); a(L(26) + 0.4, 'pop', 0.7); a(L(26) + 0.5, 'chime', 0.5);
require('fs').writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: false, cues: c }, null, 1));
console.log(c.length + ' cues');
