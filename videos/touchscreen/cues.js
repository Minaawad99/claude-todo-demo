// Sound cues from the line timings: node cues.js → cues.json
// Recorded sounds in sfx/px-*.mp3 are Pixabay sound effects (Pixabay Content License) downloaded by the channel and kept out of
// git; short UI sounds (whoosh, pop, tick, chime) stay synthesized.
global.window = {}; eval(require('fs').readFileSync(__dirname + '/timing.js', 'utf8'));
const T = window.TIMING.lines, L = i => i >= T.length ? window.TIMING.duration : T[i].start, D = i => L(i + 1) - L(i), c = [];
const a = (t, fx, gain, dur) => c.push(Object.assign({ t: +t.toFixed(2), fx, gain }, dur ? { dur } : {}));
const rec = (t, file, gain, from, dur, duck) => c.push(Object.assign({ t: +Math.max(0, t).toFixed(2), file: 'sfx/px-' + file + '.mp3', gain, from: from || 0 }, dur ? { dur: +dur.toFixed(2) } : {}, duck != null ? { duck } : {}));
const tap = (t, g) => rec(t, 'tap', g || 0.8, 0, 0.3);
let ho = 0; const hum = (i, gain) => { rec(L(i), 'hum', gain, 1 + (ho * 3.7) % 16, D(i) + 0.2, 1.5); ho++; };   // the electric hum is a bed: different stretch each time, ducked under the voice
for (let i = 1; i < T.length; i++) a(L(i) - 0.08, 'whoosh', 0.3);
// 0: the finger taps the phone (tap cycle 1/1.4 s, contact at the half cycle), the counter runs
for (let k = 0; k < 6; k++) tap(L(0) + (k + 0.5) / 1.4, 0.7); a(L(0) + 3.0, 'pop', 0.5);
// 1: bare finger taps, the gloved one gets nothing
for (let k = 0; k < 3; k++) tap(L(1) + 0.1 + k / 1.6, 0.6); a(L(1) + 1.0, 'thud', 0.4); a(L(1) + 1.8, 'pop', 0.5);
// 2: snow in Korea, a sausage taps
rec(L(2), 'wind', 0.6, 2, D(2) + 0.2, 1.2); tap(L(2) + 0.4, 0.7); tap(L(2) + 1.1, 0.7); a(L(2) + 0.6, 'pop', 0.6);
// 3: brand
a(L(3) + 0.05, 'pop', 0.9); a(L(3) + 0.2, 'chime', 0.5); tap(L(3) + 0.6, 0.5);
// 4: the glass lifts off the stack
rec(L(4) + 0.1, 'swipe', 0.8); rec(L(4) + 0.9, 'swipe', 0.6); a(L(4) + 1.6, 'pop', 0.6);
// 5: ITO under the microscope, current flowing
hum(5, 0.45); a(L(5) + 0.5, 'ping', 0.4); a(L(5) + 1.6, 'pop', 0.5);
// 6: two layers come apart
rec(L(6) + 0.2, 'swipe', 0.7); a(L(6) + 0.4, 'pop', 0.5); a(L(6) + 1.2, 'pop', 0.5); a(L(6) + 2.0, 'pop', 0.5);
// 7: a field at each crossing
hum(7, 0.5); a(L(7) + 0.6, 'pop', 0.6);
// 8: thousands of points
for (let k = 0; k < 12; k++) a(L(8) + 0.3 + k * 0.2, 'tick', 0.25); a(L(8) + 2.8, 'chime', 0.4);
// 9: water and salt in the fingertip
a(L(9) + 0.4, 'pop', 0.6); rec(L(9) + 1.0, 'drop', 0.4, 0.4, 0.4); a(L(9) + 1.4, 'pop', 0.6);
// 10: the finger pulls charge
hum(10, 0.5); a(L(10) + 1.6, 'pop', 0.6);
// 11: the controller notices the dip
rec(L(11) + 0.75, 'beep', 0.7, 0, 0.3); a(L(11) + 0.3, 'pop', 0.5); a(L(11) + 1.0, 'pop', 0.6);
// 12: the scan, node by node
for (let k = 0; k < 14; k++) a(L(12) + 0.1 + k * 0.17, 'tick', 0.22); a(L(12) + 0.5, 'pop', 0.5);
// 13: 240 times a second
hum(13, 0.55);
// 14: the position is worked out
rec(L(14) + 1.0, 'beep', 0.6, 0, 0.3); a(L(14) + 1.8, 'pop', 0.6);
// 15: pinch to zoom
rec(L(15) + 0.3, 'swipe', 0.7); rec(L(15) + 1.9, 'swipe', 0.7); a(L(15) + 0.5, 'pop', 0.5);
// 16: the glove: nothing happens
a(L(16) + 1.2, 'thud', 0.5); a(L(16) + 1.4, 'clank', 0.3); a(L(16) + 0.6, 'pop', 0.5);
// 17: conductive thread works
hum(17, 0.5); a(L(17) + 0.8, 'pop', 0.6);
// 18: Korea, winter 2010
rec(L(18), 'wind', 0.7, 6, D(18) + 0.2, 1.2); tap(L(18) + 1.6, 0.6); tap(L(18) + 2.5, 0.6); a(L(18) + 0.6, 'pop', 0.5);
// 19: water and salt, sales +40%
a(L(19) + 0.4, 'pop', 0.6); a(L(19) + 2.1, 'chime', 0.5); for (let k = 0; k < 6; k++) a(L(19) + 1.4 + k * 0.15, 'tick', 0.25);
// 20: Johnson 1965, the CRT
hum(20, 0.4); for (let k = 0; k < 8; k++) a(L(20) + 0.1 + k * 0.16, 'tick', 0.25); a(L(20) + 0.6, 'pop', 0.5);
// 21: the radar, a plane is picked
rec(L(21) + 0.1, 'sonar', 0.7, 0, 1.3); rec(L(21) + 1.7, 'beep', 0.6, 0, 0.3);
// 22: a water drop lands and makes a touch (drip in the clip at 0.48 s, the drop lands 0.8 s in)
rec(L(22) + 0.8 - 0.48, 'drop', 0.8, 0, 0.6); a(L(22) + 1.1, 'pop', 0.6);
// 23: a little charge flows into the finger
hum(23, 0.5); a(L(23) + 0.8, 'pop', 0.5);
// 24: outro
tap(L(24) + 0.3, 0.6); a(L(24) + 0.2, 'pop', 0.7); a(L(24) + 0.4, 'notify', 0.5);
require('fs').writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: true, cues: c }, null, 1)); console.log(c.length, 'cues');
