// Sound cues for «المد والجزر» from the line timings: node cues.js → cues.json, then
// python3 ../audio/sfx.py voice.wav cues.json <scratchpad>/tides-mix.wav
// Diagram style: soft. Paper swipes on shot changes, ticks for labels, the sea on the beach shots, a quiet space drone
// under the globes, a clock for the 50 minutes. Recorded clips go in sfx/px-<name>.mp3 (Pixabay, sent by the user,
// gitignored); while a clip is missing its synthesized stand-in from audio/sfx.py plays instead.
const fs = require('fs');
global.window = {}; eval(fs.readFileSync(__dirname + '/timing.js', 'utf8'));
const T = window.TIMING.lines, L = i => i >= T.length ? window.TIMING.duration : T[i].start, D = i => L(i + 1) - L(i), c = [];
const has = n => fs.existsSync(__dirname + '/sfx/px-' + n + '.mp3');
const a = (t, fx, gain, dur) => c.push(Object.assign({ t: +Math.max(0, t).toFixed(2), fx, gain }, dur ? { dur: +dur.toFixed(2) } : {}));
// a recorded clip, or the stand-in effect when the clip isn't here yet
const rec = (t, file, gain, from, dur, duck, alt, altGain) => has(file)
  ? c.push(Object.assign({ t: +Math.max(0, t).toFixed(2), file: 'sfx/px-' + file + '.mp3', gain: +gain.toFixed(2), from: from || 0 }, dur ? { dur: +dur.toFixed(2) } : {}, duck != null ? { duck } : {}))
  : alt && a(t, alt, altGain == null ? gain : altGain, dur);
const lab = (i, dt) => a(L(i) + dt, 'tick', 0.2);
const swipe = i => rec(L(i) - 0.12, 'swipe', 0.22, 0, 0.6, 1.0, 'whoosh', 0.2);

// shot changes (the panel starts at line 4; the intro and summary cards get their own sounds)
[4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24].forEach(swipe);

// 0–2 · opening card: the beach. Waves the whole time, the sea rushing in and out, then wind that stops (crossed out)
a(L(0) + 0.1, 'chime', 0.3);
rec(L(0), 'ocean-waves', 0.32, 2, L(3) - L(0), 1.2, 'waves', 0.3);
rec(L(1) + 0.3, 'water-rush', 0.35, 0, D(1) - 0.3, 1.0, 'slosh', 0.3);
rec(L(2) + 0.1, 'wind-gust', 0.3, 0, 1.4, 1.0, 'wind', 0.25);
rec(L(2) + 0.6, 'pencil-scribble', 0.4, 0, 0.6, 1.0, 'snip', 0.3);
// 3 · bumper: the ring fills
a(L(3) + 0.15, 'ping', 0.3); for (let k = 0; k < 5; k++) a(L(3) + 0.4 + k * 0.32, 'tick', 0.14);
// 4 · the Moon, 384,000 km: space drone, the distance counts up, a ding on the number
rec(L(4), 'space-drone', 0.18, 0, D(4) + 0.2, 1.2, 'hum', 0.12);
lab(4, 0.5); rec(L(4) + 2.0, 'ding', 0.3, 0, 1.2, 1.0, 'chime', 0.3);
// 5 · the rule card is pinned
rec(L(5) + 0.3, 'paper', 0.3, 0, 0.7, 1.0, 'paper', 0.3); a(L(5) + 0.45, 'pop', 0.4);
// 6, 8, 9 · balls on the strip, pull arrows
for (const i of [6, 8, 9]) { a(L(i) + 0.1, 'pop', 0.3); a(L(i) + 0.35, 'pop', 0.3); a(L(i) + 0.6, 'pop', 0.3); a(L(i) + 0.9, 'whoosh', 0.12); lab(i, 1.2); }
// 7 · the Earth's width counts up
lab(7, 0.4); rec(L(7) + 1.6, 'ding', 0.28, 0, 1.2, 1.0, 'chime', 0.25);
// 10–11 · the water stretches into two bulges
rec(L(10) + 0.3, 'water-rush', 0.25, 0, 1.6, 1.0, 'slosh', 0.25); a(L(10) + 1.0, 'pop', 0.35);
lab(11, 0.3); lab(11, 1.1); rec(L(11), 'space-drone', 0.15, 6, D(11), 1.2, 'hum', 0.1);
// 12, 14 · back to the beach: waves again
rec(L(12), 'ocean-waves', 0.3, 12, D(12) + 0.3, 1.2, 'waves', 0.25); a(L(12) + 0.5, 'pop', 0.4);
a(L(13) + 0.3, 'whoosh', 0.18, 1.0);
rec(L(14), 'ocean-waves', 0.22, 20, D(14), 1.2, 'waves', 0.2); a(L(14) + 0.3, 'pop', 0.3); lab(14, 1.4);
// 15–16 · the 24-hour dial, then the clock running 50 minutes on
for (let k = 0; k < 4; k++) lab(15, 0.3 + k * 0.28);
rec(L(15) + 0.2, 'clock-ticking', 0.25, 0, D(15) + D(16) - 0.2, 1.2, null);
if (!has('clock-ticking')) for (let s = L(15) + 0.2; s < L(17) - 0.1; s += 0.5) a(s, 'tick', 0.16);
rec(L(16) + 2.0, 'ding', 0.3, 0, 1.2, 1.0, 'chime', 0.3);
// 17 · the Moon moves along its orbit
rec(L(17), 'space-drone', 0.16, 12, D(17), 1.2, 'hum', 0.1); a(L(17) + 0.8, 'whoosh', 0.15, 1.5); lab(17, 1.0);
// 18–20 · the Sun: a warm swell, the alignment, the weak tide
rec(L(18), 'space-drone', 0.16, 18, D(18) + D(19) + D(20), 1.2, 'hum', 0.1);
a(L(18) + 0.5, 'whoosh', 0.15); a(L(18) + 1.3, 'pop', 0.4);
a(L(19) + 0.2, 'whoosh', 0.15); a(L(19) + 1.1, 'pop', 0.35); rec(L(19) + 1.6, 'ding', 0.25, 0, 1.0, 1.0, 'ping', 0.25);
a(L(20) + 0.2, 'whoosh', 0.12); a(L(20) + 1.1, 'pop', 0.3);
// 21 · the myth is crossed out
a(L(21) + 0.3, 'whoosh', 0.12); rec(L(21) + D(21) * 0.55, 'pencil-scribble', 0.45, 0, 0.7, 1.0, 'snip', 0.35);
// 22 · the whole Earth stretches
rec(L(22) + 0.3, 'water-rush', 0.2, 0, 1.4, 1.0, 'slosh', 0.2); lab(22, 0.9); lab(22, 1.4);
// 23 · recap labels
lab(23, 0.3); lab(23, 0.9); lab(23, 1.4);
// 24 · the brake and the Moon drifting away
rec(L(24) + 0.6, 'brake-squeak', 0.2, 0, 0.8, 1.0, 'creak', 0.18); a(L(24) + 1.2, 'whoosh', 0.15, 2.0); rec(L(24) + 2.6, 'ding', 0.25, 0, 1.0, 1.0, 'chime', 0.25);
// 25–26 · summary card and ask box
a(L(25) + 0.1, 'chime', 0.35); for (let k = 0; k < 5; k++) a(L(25) + 0.3 + k * 0.15, 'tick', 0.16);
rec(L(26) + 0.1, 'paper', 0.25, 0, 0.6, 1.0, 'paper', 0.25); a(L(26) + 0.3, 'pop', 0.4);

// music: the recorded bed when it's here, otherwise sfx.py's own bed (both ~8 dB under the voice, the whole video)
if (has('music-bed')) rec(0, 'music-bed', 0.35, 0, window.TIMING.duration + 2.5, 0.6);
fs.writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: !has('music-bed'), cues: c }, null, 1));
console.log(c.length + ' cues; recorded clips here: ' + (['ocean-waves', 'water-rush', 'wind-gust', 'swipe', 'pencil-scribble', 'clock-ticking', 'ding', 'space-drone', 'paper', 'brake-squeak', 'music-bed'].filter(has).join(', ') || 'none'));
