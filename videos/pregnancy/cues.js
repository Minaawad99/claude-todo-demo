// Sound cues from the line timings: node cues.js → cues.json
// A whoosh before every line, a pop on every tag, synthesized effects matched to the action (audio/sfx.py), and recorded
// sounds the channel sent for this episode in sfx/px-*.mp3 (Pixabay, kept out of git; credited in refs/SOURCES.md):
// the fetal heartbeat on an ultrasound, an underwater rumble for the inside of the womb, a newborn crying, a baby giggling,
// a yawn, a heart monitor, a phone ringing, a pen on paper. Missing clips fall back to synthesized sounds (see HAVE).
global.window = {}; eval(require('fs').readFileSync(__dirname + '/timing.js', 'utf8'));
const T = window.TIMING.lines, L = i => i >= T.length ? window.TIMING.duration : T[i].start, D = i => L(i + 1) - L(i), c = [];
const a = (t, fx, gain, dur) => c.push(Object.assign({ t: +t.toFixed(2), fx, gain }, dur ? { dur } : {}));
const tagPop = (i, u0, g) => a(L(i) + u0 + 0.05, 'pop', g || 0.55);
const fs = require('fs'), HAVE = n => fs.existsSync(__dirname + '/sfx/px-' + n + '.mp3');
const rec = (t, file, gain, from, dur, duck) => c.push(Object.assign({ t: +Math.max(0, t).toFixed(2), file: 'sfx/px-' + file + '.mp3', gain: +gain.toFixed(2), from: from || 0 }, dur ? { dur: +dur.toFixed(2) } : {}, duck != null ? { duck } : {}));
// the inside of the womb: a low muffled rumble under the shot (the clip has 4.2 s of sound, so long shots get it twice)
const womb = i => { if (!HAVE('underwater')) return a(L(i) + 0.1, 'hum', 0.15, D(i) - 0.2); for (let k = 0; k * 4.0 < D(i) - 0.3; k++) rec(L(i) + k * 4.0, 'underwater', 0.28, 0, Math.min(4.1, D(i) - k * 4.0), 1.2); };
const heart = (t0, dur, bpm, g) => { for (let k = 0, p = 60 / bpm; k * p < dur; k++) { a(t0 + k * p, 'thud', g); a(t0 + k * p + 0.16, 'thud', g * 0.6); } };
for (let i = 1; i < T.length; i++) a(L(i) - 0.08, 'whoosh', 0.3);
// 0: the pen writes a dot, the magnifier shows the cell
if (HAVE('pen')) rec(L(0) + 0.45, 'pen', 0.4, 1.0, 0.7, 1.0); else { a(L(0) + 0.5, 'tick', 0.5); a(L(0) + 0.7, 'paper', 0.3, 0.4); } a(L(0) + 1.45, 'pop', 0.6); a(L(0) + 1.6, 'chime', 0.35); tagPop(0, 0.9); tagPop(0, 2.4);
// 1: cell → baby
womb(1); tagPop(1, 0.3); a(L(1) + 0.65, 'pop', 0.6); tagPop(1, 1.4); a(L(1) + 1.5, 'ping', 0.35);
// 2: sick, then fine
a(L(2) + 0.3, 'slosh', 0.35, 0.8); tagPop(2, 0.4); a(L(2) + D(2) * 0.52, 'chime', 0.45); tagPop(2, D(2) * 0.52 + 0.1, 0.6);
// 3: brand
a(L(3) + 0.05, 'pop', 0.9); a(L(3) + 0.2, 'chime', 0.5);
// 4: three stages
tagPop(4, 0.1); tagPop(4, 0.7); tagPop(4, 1.3); a(L(4) + 0.4, 'tick', 0.4); a(L(4) + 1.0, 'tick', 0.4); a(L(4) + 1.6, 'tick', 0.4);
// 5: the egg travels down the tube and digs into the wall
womb(5); for (let k = 0; k < 4; k++) a(L(5) + 0.7 + k * 0.85, 'plunk', 0.3); tagPop(5, 0.5); a(L(5) + D(5) * 0.82, 'drop', 0.5); tagPop(5, D(5) * 0.8);
// 6: the heart starts beating (≈110 a minute) + the monitor
if (HAVE('fetal-heartbeat')) rec(L(6) + 0.2, 'fetal-heartbeat', 0.7, 2.0, D(6) - 0.2, 0.9); else heart(L(6) + 0.3, D(6) - 0.5, 110, 0.4); for (let k = 0; k < 7; k++) a(L(6) + 0.5 + k * 0.55, 'beep', 0.08); tagPop(6, 0.3); tagPop(6, 1.2); tagPop(6, 2.6);
// 7: organs light up, then the hand
womb(7); tagPop(7, 0.1); tagPop(7, 0.5); a(L(7) + 0.6, 'ping', 0.35); tagPop(7, 1.2); a(L(7) + 1.3, 'ping', 0.35); tagPop(7, 1.9); a(L(7) + 2.0, 'ping', 0.35); a(L(7) + 2.65, 'pop', 0.6); tagPop(7, 3.0);
// 8: 6 cm, a lime
a(L(8) + 0.85, 'pop', 0.7); tagPop(8, 1.8); a(L(8) + 1.9, 'plunk', 0.4);
// 9: nausea, the hormone curve climbs
a(L(9) + 0.2, 'slosh', 0.3, 1.0); tagPop(9, 0.6); a(L(9) + 0.4, 'spool', 0.25, 2.6); tagPop(9, 2.6); a(L(9) + 2.7, 'ping', 0.35);
// 10: the study, then GDF15 flows from the placenta to the brain
tagPop(10, 0.4); for (let k = 0; k < 5; k++) a(L(10) + 0.55 + k * 0.15, 'tick', 0.35); a(L(10) + 1.65, 'notify', 0.4); tagPop(10, 1.8);
a(L(10) + 3.2, 'wipe', 0.4); a(L(10) + 3.3, 'fill', 0.25, D(10) - 3.5); tagPop(10, 3.3); tagPop(10, 4.2); a(L(10) + 5.3, 'zap', 0.3); tagPop(10, 5.4);
// 11: sleepy, progesterone
a(L(11) + 0.1, 'hum', 0.15, D(11) - 0.3); if (HAVE('yawn')) rec(L(11) + 0.2, 'yawn', 0.7, 2.0, 0.85, 0.5); tagPop(11, 0.6); for (let k = 0; k < 3; k++) a(L(11) + 0.8 + k * 1.3, 'bell', 0.12); tagPop(11, 2.6);
// 12: stage two, the placenta takes over
a(L(12) + 0.1, 'chime', 0.45); womb(12); tagPop(12, 1.0); a(L(12) + 1.4, 'spool', 0.2, 2.0); a(L(12) + 3.6, 'ping', 0.3);
// 13: the fingerprint draws itself
tagPop(13, 0.3); for (let k = 0; k < 13; k++) a(L(13) + 0.35 + k * 0.2, 'tick', 0.22); tagPop(13, 2.4); a(L(13) + 2.5, 'chime', 0.35);
// 14: it hears, then the first kick
for (let k = 0; k < 4; k++) a(L(14) + 0.2 + k * 0.5, 'ping', 0.12); tagPop(14, 0.5); a(L(14) + 2.25, 'bump', 0.7); a(L(14) + 2.35, 'thud', 0.6); a(L(14) + 2.9, 'bump', 0.5); tagPop(14, 2.4, 0.7); tagPop(14, 3.1);
// 15: eyes open, the scale counts up
womb(15); a(L(15) + 1.3, 'ping', 0.35); tagPop(15, 1.4); for (let k = 0; k < 8; k++) a(L(15) + 0.1 + k * 0.28, 'tick', 0.25); a(L(15) + 2.3, 'beep', 0.35); tagPop(15, 2.4);
// 16: the valve relaxes, acid comes up
a(L(16) + 0.8, 'servo', 0.3); tagPop(16, 0.9); a(L(16) + 1.2, 'fizz', 0.35, D(16) - 1.4); tagPop(16, 2.0, 0.7);
// 17: weight forward, then the pelvis and its ligaments
a(L(17) + 0.5, 'whoosh', 0.3); tagPop(17, 0.8); a(L(17) + 1.2, 'creak', 0.3); a(L(17) + 2.45, 'pop', 0.6); a(L(17) + 2.9, 'creak', 0.35); tagPop(17, 3.0);
// 18: stage three, fat fills the cells
a(L(18) + 0.1, 'chime', 0.45); womb(18); tagPop(18, 1.2); for (let k = 0; k < 6; k++) a(L(18) + 1.0 + k * 0.4, 'plunk', 0.25); tagPop(18, 2.6);
// 19: the brain grows ×3
a(L(19) + 0.1, 'spool', 0.3, 2.8); tagPop(19, 0.6); a(L(19) + 2.45, 'pop', 0.8); a(L(19) + 2.5, 'chime', 0.4);
// 20: lungs breathing, then the incubator
a(L(20) + 0.2, 'wind', 0.2, 1.6); tagPop(20, 0.4); if (HAVE('monitor-beep')) rec(L(20) + 1.3, 'monitor-beep', 0.45, 0.0, D(20) - 1.3, 0.8); else for (let k = 0; k < 5; k++) a(L(20) + 1.4 + k * 0.4, 'beep', 0.18); tagPop(20, 1.8);
// 21: panting, then swollen feet
for (let k = 0; k < 4; k++) a(L(21) + 0.3 + k * 0.65, 'steam', 0.18, 1.0); tagPop(21, 0.4); tagPop(21, 1.2); a(L(21) + 2.7, 'wipe', 0.4); a(L(21) + 2.8, 'drip', 0.35); a(L(21) + 3.4, 'drip', 0.3); tagPop(21, 3.0); tagPop(21, 3.7);
// 22: warning signs, the phone rings
a(L(22) + 0.25, 'drop', 0.5); tagPop(22, 0.4); a(L(22) + 0.95, 'zap', 0.35); tagPop(22, 1.1); a(L(22) + 1.65, 'pop', 0.6); tagPop(22, 1.8); if (HAVE('phone-ring')) rec(L(22) + 2.45, 'phone-ring', 0.4, 0.0, 1.85, 0.8); else { a(L(22) + 2.45, 'bell', 0.4); a(L(22) + 3.0, 'bell', 0.4); } tagPop(22, 2.8, 0.7);
// 23: it turns head-down, half a metre, three kilos
womb(23); a(L(23) + 0.3, 'slosh', 0.3, 2.0); tagPop(23, 1.6); tagPop(23, 3.0); a(L(23) + 3.1, 'tick', 0.4); tagPop(23, 4.0); a(L(23) + 4.1, 'beep', 0.35);
// 24: payoff: the cell flashes into the baby in her arms
a(L(24) + 0.1, 'hum', 0.2, 1.2); a(L(24) + 1.1, 'charge', 0.35); a(L(24) + 1.4, 'chime', 0.6); if (HAVE('baby-cry')) rec(L(24) + 1.5, 'baby-cry', 0.3, 6.0, Math.min(3.1, D(24) - 1.5), 1.0); tagPop(24, 1.8, 0.6);
// 25: outro
a(L(25) + 0.3, 'pop', 0.8); a(L(25) + 0.5, 'chime', 0.45); if (HAVE('baby-giggle')) rec(L(25) + 0.6, 'baby-giggle', 0.55, 0.0, 3.1, 0.6);
require('fs').writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: true, cues: c.sort((x, y) => x.t - y.t) }, null, 1));
console.log(c.length, 'cues');
