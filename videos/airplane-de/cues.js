// Sound cues from the line timings: node cues.js → cues.json (all synthesized in ../audio/sfx.py; no recorded clips yet)
global.window = {}; eval(require('fs').readFileSync(__dirname + '/timing.js', 'utf8'));
const T = window.TIMING.lines, L = i => i >= T.length ? window.TIMING.duration : T[i].start, D = i => L(i + 1) - L(i), c = [];
const a = (t, fx, gain, dur) => c.push(Object.assign({ t: +t.toFixed(2), fx, gain }, dur ? { dur: +dur.toFixed(2) } : {}));
const wind = (i, g) => a(L(i), 'wind', g, D(i) + 0.2);
for (let i = 1; i < T.length; i++) a(L(i) - 0.08, 'whoosh', 0.3);
// 0: the A380 rolls and lifts off
a(L(0), 'spool', 0.4, 1.4); a(L(0) + 0.6, 'jet', 0.45, D(0) - 0.6); a(L(0) + 0.5, 'pop', 0.6); a(L(0) + 2.1, 'pop', 0.7);
// 1: cars pile up on the balance, the counter ticks
for (let k = 0; k < 14; k++) a(L(1) + 0.35 + k * (D(1) - 0.8) / 14, 'tick', 0.22); a(L(1) + 0.2, 'creak', 0.35); a(L(1) + D(1) - 1.0, 'chime', 0.5);
// 2: it just stays up?
wind(2, 0.3); a(L(2) + 0.9, 'pop', 0.6); a(L(2) + 1.2, 'notify', 0.35);
// 3: brand
wind(3, 0.25); a(L(3) + 0.05, 'pop', 0.9); a(L(3) + 0.25, 'chime', 0.5);
// 4–6: the four forces pop in
wind(4, 0.25); [0.3, 0.7, 1.1, 1.5].forEach((o, k) => a(L(4) + o, 'pop', 0.45 + k * 0.05)); a(L(4) + 1.9, 'chime', 0.4);
wind(5, 0.25); a(L(5) + 0.1, 'thud', 0.5); a(L(5) + 1.4, 'pop', 0.6);
wind(6, 0.3); a(L(6) + 0.2, 'jet', 0.3, 1.6); a(L(6) + 1.3, 'wipe', 0.4);
// 7: push in to the engine
a(L(7), 'spool', 0.5, D(7)); a(L(7) + 0.9, 'pop', 0.6);
// 8: the fan sucks in air
a(L(8), 'intake', 0.5, D(8)); a(L(8) + 0.5, 'pop', 0.5); a(L(8) + 1.4, 'pop', 0.6);
// 9: compress, burn, blast out
a(L(9) + 0.2, 'squeeze', 0.45); a(L(9) + 1.2, 'boom', 0.35); a(L(9) + 1.3, 'exhaust', 0.45, D(9) - 1.4); a(L(9) + 0.3, 'pop', 0.5); a(L(9) + 2.1, 'pop', 0.5);
// 10: the fan does most of the work
a(L(10), 'jet', 0.4, D(10)); a(L(10) + 0.6, 'pop', 0.6); a(L(10) + 2.0, 'pop', 0.5);
// 11: down the runway, the speed gauge climbs
a(L(11), 'jet', 0.55, D(11)); for (let k = 0; k < 8; k++) a(L(11) + 0.3 + k * 0.35, 'tick', 0.2); a(L(11) + 1.6, 'pop', 0.6);
// 12: the wing
a(L(12), 'jet', 0.4, D(12)); a(L(12) + 0.5, 'ping', 0.45);
// 13–18: the air around the wing
wind(13, 0.35); a(L(13) + 0.3, 'pop', 0.5); a(L(13) + 1.3, 'servo', 0.3); a(L(13) + 1.5, 'pop', 0.5);
wind(14, 0.4); a(L(14) + 0.9, 'wipe', 0.4); a(L(14) + 1.0, 'pop', 0.5);
wind(15, 0.4); a(L(15) + 0.4, 'pop', 0.5); a(L(15) + 1.2, 'wipe', 0.4); a(L(15) + 1.5, 'pop', 0.6);
wind(16, 0.45); a(L(16) + 0.4, 'pop', 0.5); a(L(16) + 1.6, 'pop', 0.5);
wind(17, 0.4); a(L(17) + 0.3, 'pop', 0.5); a(L(17) + 0.9, 'pop', 0.5); a(L(17) + 1.5, 'wipe', 0.4);
wind(18, 0.3); a(L(18) + 1.8, 'beep', 0.35); a(L(18) + 2.4, 'chime', 0.5);
// 19: 1 m² and the weights stacking
wind(19, 0.25); a(L(19) + 0.6, 'pop', 0.5); for (let k = 0; k < 4; k++) a(L(19) + 0.9 + k * 0.35, 'clank', 0.4); a(L(19) + 1.8, 'pop', 0.6);
// 20: hand out of the car window
a(L(20), 'motor', 0.3, D(20)); a(L(20) + 0.1, 'wind', 0.45, D(20)); a(L(20) + 1.6, 'pop', 0.5);
// 21: flaps slide out
wind(21, 0.3); a(L(21) + 0.5, 'servo', 0.5); a(L(21) + 0.8, 'pop', 0.6); a(L(21) + 2.0, 'pop', 0.5);
// 22: sidestick, rotation, lift-off
a(L(22) + 0.3, 'servo', 0.35); a(L(22) + D(22) * 0.42, 'jet', 0.6, D(22) * 0.58); a(L(22) + D(22) * 0.42 + 0.6, 'pop', 0.6);
// 23: control surfaces
wind(23, 0.25); a(L(23) + 0.3, 'servo', 0.35); a(L(23) + D(23) * 0.45, 'servo', 0.35); a(L(23) + D(23) * 0.7, 'servo', 0.35); a(L(23) + 0.4, 'pop', 0.5);
// 24: thin air at 11 km
wind(24, 0.3); a(L(24) + 0.5, 'pop', 0.5); a(L(24) + 1.6, 'pop', 0.5);
// 25: the wing bends in the test rig
a(L(25), 'hum', 0.25, D(25)); a(L(25) + 0.5, 'creak', 0.4); a(L(25) + 1.6, 'creak', 0.4); a(L(25) + 1.8, 'pop', 0.6);
// 26: payoff
a(L(26), 'jet', 0.35, D(26)); a(L(26) + 0.6, 'pop', 0.5); a(L(26) + 1.8, 'pop', 0.5);
// 27: outro
wind(27, 0.25); a(L(27) + 0.4, 'pop', 0.8); a(L(27) + 0.6, 'chime', 0.5);
require('fs').writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: true, cues: c }, null, 0));
console.log(c.length, 'cues');
