// Sound cues from the line timings: node cues.js → cues.json
// Recorded sounds in sfx/px-*.mp3 are Pixabay sound effects (Pixabay Content License) the channel sent for earlier episodes
// (rain, thunder, breeze, cicadas, wind, a water drop, a jet), kept out of git. Shots start 0.05 s before their line, as in
// remotion/src/rainbow/Rainbow.tsx. No recorded sound plays in two shots in a row.
global.window = {}; eval(require('fs').readFileSync(__dirname + '/timing.js', 'utf8'));
const T = window.TIMING.lines, L = i => i >= T.length ? window.TIMING.duration : (i === 0 ? 0 : T[i].start - 0.05), D = i => L(i + 1) - L(i), c = [];
const a = (t, fx, gain, dur, f) => c.push(Object.assign({ t: +t.toFixed(2), fx, gain }, dur ? { dur } : {}, f ? { f } : {}));
const rec = (t, file, gain, from, dur, duck) => c.push(Object.assign({ t: +Math.max(0, t).toFixed(2), file: 'sfx/px-' + file + '.mp3', gain: +(gain * 1.2).toFixed(2), from: from || 0 }, dur ? { dur: +dur.toFixed(2) } : {}, duck != null ? { duck } : {}));
const bed = (i, file, g, from) => rec(L(i), file, g, from, D(i) + 0.2, 1.2);
const drip = (t, g) => rec(t - 0.48, 'drop', g, 0, 0.6, 0.8);        // the drip sits at 0.48 s in the clip
const SCALE = [523, 587, 659, 698, 784, 880, 988];                    // do re mi fa sol la si
for (let i = 1; i < T.length; i++) a(L(i) - 0.03, 'whoosh', 0.25);
// 0: after the rain, the bow fades in
bed(0, 'heavy-rain', 0.3, 12); a(1.0, 'chime', 0.45);
// 1: one clear drop
drip(L(1) + 0.4, 0.7); a(L(1) + 0.35, 'pop', 0.5); a(L(1) + 1.45, 'pop', 0.5);
// 2: rain with no sun
bed(2, 'heavy-rain', 0.45, 3); rec(L(2) + 0.5, 'distant-thunder', 0.5, 0.45, 2.6, 1.0); a(L(2) + 0.85, 'pop', 0.4);
// 3: brand
bed(3, 'breeze', 0.4, 10); a(L(3) + 0.15, 'pop', 0.9); a(L(3) + 0.3, 'chime', 0.5);
// 4: white light opens into seven colours
for (let k = 0; k < 7; k++) a(L(4) + 1.3 + k * 0.12, 'bell', 0.25, 0.8, SCALE[k]); a(L(4) + 0.3, 'pop', 0.5); a(L(4) + 1.85, 'pop', 0.5);
// 5: the light goes into the drop and bends
drip(L(5) + 0.6, 0.6); a(L(5) + 0.85, 'pop', 0.5); a(L(5) + 1.85, 'pop', 0.5);
// 6: each colour bends its own way
for (let k = 0; k < 7; k++) a(L(6) + 0.9 + k * 0.15, 'tick', 0.2); a(L(6) + 1.0, 'pop', 0.5); a(L(6) + 2.4, 'pop', 0.5);
// 7: like a prism
bed(7, 'breeze', 0.35, 40); a(L(7) + 1.5, 'chime', 0.4); a(L(7) + 0.6, 'pop', 0.5);
// 8: reflects off the back, comes out the front
drip(L(8) + 0.3, 0.5); a(L(8) + 1.6, 'ping', 0.3); a(L(8) + 1.4, 'pop', 0.5); a(L(8) + 2.8, 'pop', 0.5);
// 9: back towards you at 42°
a(L(9) + 0.6, 'pop', 0.8); a(L(9) + 0.7, 'ping', 0.3);
// 10: millions of drops, one colour each
bed(10, 'cicadas', 0.3, 5); for (let k = 0; k < 8; k++) a(L(10) + 0.3 + k * 0.38, 'bell', 0.12, 0.5, SCALE[k % 7] * 2); a(L(10) + 0.8, 'pop', 0.5);
// 11: red from the higher drops, violet from the lower ones
bed(11, 'breeze', 0.35, 60); a(L(11) + 0.5, 'bell', 0.3, 0.9, 523); a(L(11) + 2.0, 'bell', 0.3, 0.9, 988); a(L(11) + 0.5, 'pop', 0.5); a(L(11) + 2.0, 'pop', 0.5);
// 12: the cone around the head's shadow
bed(12, 'cicadas', 0.3, 30); a(L(12) + 0.8, 'pop', 0.5); for (let k = 0; k < 6; k++) a(L(12) + 1.0 + k * 0.25, 'tick', 0.18); a(L(12) + 2.4, 'pop', 0.5);
// 13: sun behind you, rain ahead
bed(13, 'wind', 0.35, 4); a(L(13) + 0.4, 'pop', 0.5); a(L(13) + 1.6, 'pop', 0.5);
// 14: the sun climbs, the bow sinks
bed(14, 'breeze', 0.35, 80); for (let k = 0; k < 14; k++) a(L(14) + 0.4 + k * 0.2, 'tick', 0.15); a(L(14) + D(14) - 0.6, 'thud', 0.3);
// 15: early morning, before sunset
bed(15, 'cicadas', 0.35, 50); a(L(15) + 0.4, 'pop', 0.5); a(L(15) + 1.6, 'pop', 0.5);
// 16: it is a full circle
bed(16, 'wind', 0.4, 10); a(L(16) + 1.2, 'chime', 0.5);
// 17: from an airplane
rec(L(17), 'jet-flyby', 0.25, 4, D(17) + 0.2, 1.2); a(L(17) + 0.6, 'pop', 0.5);
// 18: a second bow, colours reversed
bed(18, 'breeze', 0.35, 20); a(L(18) + 1.0, 'pop', 0.5); for (let k = 0; k < 7; k++) a(L(18) + 1.2 + k * 0.12, 'bell', 0.18, 0.8, SCALE[6 - k]);
// 19: two reflections, 51°
drip(L(19) + 0.5, 0.5); a(L(19) + 1.3, 'ping', 0.3); a(L(19) + 2.2, 'ping', 0.3); a(L(19) + 1.0, 'pop', 0.5); a(L(19) + 2.6, 'pop', 0.6);
// 20: everyone sees their own bow
bed(20, 'cicadas', 0.3, 65); a(L(20) + 0.6, 'pop', 0.5); a(L(20) + 1.4, 'pop', 0.5);
// 21: it walks with you
bed(21, 'breeze', 0.35, 95); for (let t = 0.2; t < D(21) - 0.2; t += 0.39) a(L(21) + t, 'thud', 0.12); a(L(21) + 0.8, 'pop', 0.5);
// 22: Newton: seven colours for seven notes
for (let k = 0; k < 7; k++) a(L(22) + 0.6 + k * 0.35, 'bell', 0.3, 0.9, SCALE[k]);
// 23: the payoff
bed(23, 'heavy-rain', 0.25, 20); a(L(23) + 0.2, 'pop', 0.5); a(L(23) + 1.2, 'pop', 0.5); a(L(23) + 2.2, 'chime', 0.5);
// 24: outro
rec(L(24), 'cicadas', 0.35, 10, D(24) + 1.5, 1.0); a(L(24) + 0.2, 'pop', 0.6);
require('fs').writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: false, cues: c }, null, 1));
console.log(c.length + ' cues');
