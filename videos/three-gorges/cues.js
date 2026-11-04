// Sound cues for the 3D Three Gorges episode, from the line timings: node cues.js → cues.json
// All synthesized (audio/sfx.py) over the original music bed; times follow the widgets in 3d/index.html.
global.window = {}; eval(require('fs').readFileSync(__dirname + '/timing.js', 'utf8'));
const T = window.TIMING.lines, L = i => i >= T.length ? window.TIMING.duration : T[i].start, D = i => L(i + 1) - L(i), c = [];
const a = (t, fx, gain, dur) => c.push(Object.assign({ t: +t.toFixed(2), fx, gain }, dur ? { dur: +dur.toFixed(2) } : {}));
const O = i => i >= 7 ? i + 2 : i;   // lines 7–8 (locks, lift) were inserted; the cues below keep the old numbers
const cuts = [4, 7, 9, 11, 12, 14, 16, 20];
for (let i = 1; i < T.length; i++) a(L(i) - (cuts.includes(i) ? 0.3 : 0.08), cuts.includes(i) ? 'wipe' : 'whoosh', cuts.includes(i) ? 0.45 : 0.3);
// dam at dusk: the spillway roar and wind, lights switching on
for (let i = 0; i < 7; i++) a(L(i), 'waves', i < 4 ? 0.5 : 0.35, D(i));
a(L(O(0)), 'wind', 0.25, L(O(4)) - L(O(0)));
a(5.6, 'clink', 0.35); a(6.3, 'clink', 0.3);
a(L(O(2)) + 0.2, 'pop', 0.7);
a(L(O(3)) + 0.05, 'pop', 0.6); a(L(O(3)) + 0.2, 'chime', 0.45);
a(L(O(4)) + 1.6, 'pop', 0.6); a(L(O(4)), 'hum', 0.2, D(O(4)));
for (let k = 0; k < 10; k++) a(L(O(5)) + 0.2 + k * 0.11, 'tick', 0.22); a(L(O(5)) + 0.9, 'pop', 0.6); a(L(O(5)) + 2.2, 'pop', 0.6);
a(L(O(6)) + 0.3, 'pop', 0.6); for (let k = 0; k < 16; k++) a(L(O(6)) + 0.4 + k * 0.125, 'tick', 0.25); a(L(O(6)) + 2.45, 'chime', 0.45);
// ship locks (line 7) and ship lift (line 8): water filling, gates, the lift's motors
a(L(7) + 0.3, 'fill', 0.45, D(7) - 0.4); a(L(7) + 1.0, 'pop', 0.55); a(L(7) + 0.6, 'clank', 0.35); a(L(7) + 2.4, 'clank', 0.3);
a(L(8) + 0.4, 'motor', 0.35, D(8) - 0.6); a(L(8) + 1.7, 'pop', 0.55); a(L(8) + 1.9, 'pop', 0.5); a(L(8) + D(8) - 0.5, 'clank', 0.45);
// skater: fast spin, then arms open and it slows
a(L(O(7)), 'spin', 0.45, D(O(7)) + 0.3); a(L(O(7)) + 0.3, 'pop', 0.5);
a(L(O(8)) + 0.1, 'whoosh', 0.45); a(L(O(8)) + 0.2, 'spin', 0.3, D(O(8)) - 0.3);
// earth: weights fly out, rotation winds down
for (let k = 0; k < 5; k++) a(L(O(9)) + 0.6 + k * 0.18, 'pop', 0.35);
a(L(O(9)) + 0.3, 'spool', 0.3, D(O(9)) - 0.4);
// cross-section: water rises, the day clock ticks
a(L(O(10)) + 0.2, 'fill', 0.5, D(O(10)) - 0.3); a(L(O(10)) + 0.7, 'pop', 0.5);
for (let k = 0; k < 10; k++) a(L(O(10)) + 1.0 + k * 0.4, 'tick', 0.22);
a(L(O(11)) + 0.05, 'bell', 0.45); a(L(O(11)) + 0.6, 'pop', 0.5);
// number reveal + NASA stamp
for (let k = 0; k < 10; k++) a(L(O(12)) + 0.1 + k * 0.09, 'tick', 0.32); a(L(O(12)) + 1.05, 'ping', 0.5); a(L(O(12)) + 1.35, 'pop', 0.55);
a(L(O(13)), 'paper', 0.4); a(L(O(13)) + 1.2, 'thud', 0.65);
// why wide at the bottom: pressure, dimensions, pyramid
a(L(O(14)) + 0.5, 'pop', 0.65); a(L(O(14)), 'slosh', 0.3, D(O(14)));
for (let k = 0; k < 7; k++) a(L(O(15)) + 0.25 + k * 0.22, 'plunk', 0.35); a(L(O(15)), 'slosh', 0.25, D(O(15)));
a(L(O(16)) + 0.2, 'servo', 0.3, 0.8); a(L(O(16)) + 0.9, 'pop', 0.55); a(L(O(16)) + 1.5, 'servo', 0.25, 0.6); a(L(O(16)) + 2.0, 'pop', 0.5);
a(L(O(17)) + 0.1, 'creak', 0.35); a(L(O(17)) + 0.4, 'thud', 0.45); a(L(O(17)) + 1.4, 'pop', 0.55); a(L(O(17)) + 2.3, 'pop', 0.5);
// payoff + outro
a(L(O(18)) + 0.2, 'wind', 0.25, D(O(18))); a(L(O(18)) + 0.4, 'chime', 0.4);
a(L(O(19)) + 0.15, 'pop', 0.7); a(L(O(19)) + 0.3, 'notify', 0.5);
require('fs').writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: true, cues: c }, null, 1)); console.log(c.length, 'cues');
