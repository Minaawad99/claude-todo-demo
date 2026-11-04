// Sound cues for «الإيرباج بيتفتح إزاي؟» (21 lines, ≈1:33), from the line timings: node cues.js → cues.json
// Synthesized effects (audio/sfx.py) plus the clips the user sent in sfx/px-*.mp3 (Pixabay / Freesound community, kept out
// of git): crash (peak at 0.5 s), explosion (short bang), olenchic (a burst peaking near 4 s), tire-squeal (peaks 6.5 s, 9.5 s),
// sparks, air-release (hiss 0–2 s and 6–14 s), car-interior (cabin drive bed).
global.window = {}; eval(require('fs').readFileSync(__dirname + '/timing.js', 'utf8'));
const T = window.TIMING.lines, L = i => i >= T.length ? window.TIMING.duration : T[i].start, D = i => L(i + 1) - L(i), c = [];
const a = (t, fx, gain, dur) => c.push(Object.assign({ t: +t.toFixed(2), fx, gain }, dur ? { dur: +dur.toFixed(2) } : {}));
const rec = (t, file, gain, from, dur, duck) => c.push(Object.assign({ t: +Math.max(0, t).toFixed(2), file: 'sfx/px-' + file + '.mp3', gain: +gain.toFixed(2), from: from || 0 }, dur ? { dur: +dur.toFixed(2) } : {}, duck != null ? { duck } : {}));
for (let i = 1; i < T.length; i++) a(L(i) - 0.08, 'whoosh', 0.3);
// 0: driving, the crash, the bag fills in 1/30 s
rec(L(0), 'car-interior', 0.35, 4, 0.95, 1.2); rec(L(0) + 0.9 - 0.5, 'crash', 0.6, 0, 1.6, 1.0); rec(L(0) + 0.92, 'explosion', 0.6, 0, 0.6, 1.0); a(L(0) + 2.0, 'pop', 0.5);
// 1: the folded bag in the hub; 2: the car heads for the wall
a(L(1) + 0.8, 'hum', 0.15, 1.2); a(L(1) + 1.4, 'pop', 0.45); a(L(1) + 0.5, 'pop', 0.35);
rec(L(2), 'car-interior', 0.3, 20, D(2) + 0.1, 1.2); a(L(2) + 0.6, 'pop', 0.45);
// 3: «إيه الحكاية؟», the bag bursts out
rec(L(3) + 0.15, 'olenchic', 0.5, 3.6, 1.3, 1.0); rec(L(3) + 0.25, 'explosion', 0.5, 0, 0.6, 1.0); a(L(3) + 0.6, 'chime', 0.4);
// 4–7: the sensor, braking vs crash, the decision
a(L(4) + 1.0, 'pop', 0.5); a(L(4) + 0.6, 'hum', 0.15, 1.6);
for (let k = 0; k < 10; k++) a(L(5) + 0.3 + k * 0.3, 'tick', 0.2); a(L(5) + 0.6, 'pop', 0.45);
rec(L(6) + 0.3, 'tire-squeal', 0.4, 6.1, 1.6, 1.0); a(L(6) + 0.9, 'pop', 0.45); a(L(6) + 2.0, 'thud', 0.55); a(L(6) + 2.2, 'pop', 0.45);
rec(L(7), 'car-interior', 0.25, 40, 1.0, 1.2); rec(L(7) + 0.5, 'crash', 0.55, 0, 1.6, 1.0); for (let k = 0; k < 8; k++) a(L(7) + 1.05 + k * 0.1, 'tick', 0.25); a(L(7) + 1.9, 'beep', 0.45); a(L(7) + 2.0, 'pop', 0.55);
// 8–10: the spark, the pellets, the gas
rec(L(8) + 0.3, 'sparks', 0.6, 0.5, 1.6, 1.0); a(L(8) + 0.8, 'pop', 0.45); a(L(8) + 1.6, 'pop', 0.5);
a(L(9) + 0.5, 'pop', 0.45); rec(L(9) + 1.4, 'sparks', 0.4, 3, 0.5, 1.0); rec(L(9) + 1.6, 'explosion', 0.5, 0, 0.6, 1.0); a(L(9) + 2.0, 'pop', 0.5);
rec(L(10), 'explosion', 0.45, 0, 0.6, 1.0); rec(L(10) + 0.2, 'air-release', 0.35, 0, 2.2, 1.0); a(L(10) + 1.4, 'pop', 0.45);
// 11–12: air, old vs new pellets
a(L(11), 'wind', 0.2, D(11)); a(L(11) + 0.4, 'pop', 0.45); a(L(11) + 1.6, 'chime', 0.35);
a(L(12) + 0.4, 'pop', 0.45); a(L(12) + 1.2, 'beep', 0.4); a(L(12) + 2.2, 'pop', 0.45); a(L(12) + 2.6, 'ping', 0.45);
// 13–16: out through the cover, venting, softly, powder
rec(L(13) + 0.45, 'olenchic', 0.5, 3.6, 1.3, 1.0); rec(L(13) + 0.55, 'explosion', 0.45, 0, 0.6, 1.0); a(L(13) + 1.6, 'pop', 0.45);
rec(L(14) + 0.3, 'air-release', 0.4, 9, 2.8, 1.0); a(L(14) + 1.0, 'pop', 0.45);
rec(L(15), 'air-release', 0.28, 11.5, 2.6, 1.0); a(L(15) + 0.8, 'pop', 0.45);
a(L(16), 'fizz', 0.2, 2.0); a(L(16) + 1.0, 'pop', 0.45);
// 17–19: safety, Takata, the timeline
a(L(17) + 0.4, 'servo', 0.25, 0.8); a(L(17) + 1.2, 'pop', 0.45); a(L(17) + 2.0, 'ping', 0.45);
a(L(18), 'drip', 0.3, 1.2); a(L(18) + 0.4, 'pop', 0.5); rec(L(18) + 1.4, 'explosion', 0.6, 0, 0.6, 1.0); a(L(18) + 1.45, 'clank', 0.4); for (let k = 0; k < 12; k++) a(L(18) + 2.2 + k * 0.13, 'tick', 0.2); a(L(18) + 2.6, 'pop', 0.5);
for (let k = 0; k < 5; k++) a(L(19) + 0.6 + k * 0.7, 'ping', 0.3); a(L(19) + 0.6, 'pop', 0.45);
// 20: outro
rec(L(20), 'car-interior', 0.25, 60, D(20) + 0.2, 1.2); a(L(20) + 0.4, 'pop', 0.65); a(L(20) + 0.5, 'notify', 0.5);
require('fs').writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: true, cues: c }, null, 1)); console.log(c.length, 'cues');
