// Sound cues from the line timings: node cues.js → cues.json. Sound effects only, no music.
// Recorded sounds (sfx/px-*.mp3) are Pixabay sound effects (Pixabay Content License) from the sketch kit
// (videos/_templates/sketch/sfx): ocean waves, a ding, a wind gust, rushing water, a ticking clock, a swipe.
global.window = {}; eval(require('fs').readFileSync(__dirname + '/timing.js', 'utf8'));
const T = window.TIMING.lines, L = i => i >= T.length ? window.TIMING.duration : T[i].start, D = i => L(i + 1) - L(i), c = [];
const a = (t, fx, gain, dur) => c.push(Object.assign({ t: +t.toFixed(2), fx, gain }, dur ? { dur } : {}));
const rec = (t, file, gain, from, dur, duck) => c.push(Object.assign({ t: +Math.max(0, t).toFixed(2), file: 'sfx/px-' + file + '.mp3', gain: +(gain * 1.2).toFixed(2), from: from || 0 }, dur ? { dur: +dur.toFixed(2) } : {}, duck != null ? { duck } : {}));
for (let i = 1; i < T.length; i++) a(L(i) - 0.08, 'whoosh', 0.3);
// 0 boat, sacks carried ashore
rec(L(0), 'ocean-waves', 0.18, 0, D(0), 1.2); a(L(0) + 1.0, 'thud', 0.3); a(L(0) + 2.1, 'thud', 0.3); a(L(0) + 3.2, 'pop', 0.6); rec(L(0) + 3.3, 'ding', 0.25, 0, 1.1, 1.0);
// 1 days of carrying
rec(L(1) + 0.4, 'clock-ticking', 0.25, 0, D(1) - 0.6, 1.0); a(L(1) + 1.2, 'pop', 0.6); a(L(1) + 3.0, 'thud', 0.35);
// 2 the box slides in, goods in, doors shut
a(L(2) + 0.1, 'slosh', 0.15, 0.8); a(L(2) + 0.9, 'clank', 0.45); for (let k = 0; k < 5; k++) a(L(2) + 1.4 + k * 0.45, 'thud', 0.18); a(L(2) + 1.6, 'pop', 0.6); a(L(2) + 4.0, 'chime', 0.45);
// 3 thirty tonnes, can't lift
a(L(3) + 0.4, 'creak', 0.3, 1.2); a(L(3) + 0.8, 'pop', 0.6); a(L(3) + 2.6, 'thud', 0.35); a(L(3) + 2.7, 'pop', 0.5);
// 4 the crane rises, the boom runs out, one box across
a(L(4) + 0.2, 'servo', 0.3, 1.2); a(L(4) + 1.4, 'clank', 0.4); a(L(4) + 2.4, 'pop', 0.6); a(L(4) + 3.0, 'motor', 0.25, 1.0); a(L(4) + 3.6, 'clank', 0.35); a(L(4) + 4.0, 'servo', 0.25, 2.2); a(L(4) + 4.2, 'pop', 0.6); a(L(4) + 6.4, 'thud', 0.4);
// 5 it sinks
a(L(5) + 0.6, 'pop', 0.6); a(L(5) + 0.9, 'creak', 0.4, 2.2); a(L(5) + 1.4, 'thud', 0.4); a(L(5) + 2.3, 'pop', 0.5); a(L(5) + 2.8, 'thud', 0.35);
// 6 piles hammered, deck poured, crane back up
for (let k = 0; k < 5; k++) a(L(6) + 0.5 + k * 0.52, 'clank', 0.4); a(L(6) + 0.8, 'pop', 0.6); a(L(6) + 3.0, 'fill', 0.25, 1.4); a(L(6) + 3.6, 'pop', 0.6); a(L(6) + 3.9, 'servo', 0.25, 0.9); a(L(6) + 4.4, 'chime', 0.4);
// 7 the full ship grounds
rec(L(7), 'ocean-waves', 0.2, 3, 2.6, 1.2); a(L(7) + 1.0, 'pop', 0.6); a(L(7) + 2.6, 'boom', 0.35); a(L(7) + 2.6, 'creak', 0.4, 1.2); a(L(7) + 2.8, 'pop', 0.5);
// 8 the dredger sucks and sprays, the ship comes in
a(L(8) + 0.2, 'vac', 0.3, 3.4); rec(L(8) + 0.4, 'water-rush', 0.2, 1, 3.2, 1.2); a(L(8) + 2.0, 'pop', 0.6); a(L(8) + 4.2, 'chime', 0.45);
// 9 silt drifts in
rec(L(9) + 0.2, 'ocean-waves', 0.2, 6, D(9) - 0.3, 1.2); a(L(9) + 0.8, 'pop', 0.6); a(L(9) + 2.4, 'pop', 0.5); a(L(9) + 2.5, 'thud', 0.3);
// 10 dredge again
a(L(10) + 0.2, 'vac', 0.3, 2.4); a(L(10) + 0.6, 'pop', 0.6); a(L(10) + 2.0, 'chime', 0.4);
// 11 boxes pile up, the crane waits
for (let k = 0; k < 5; k++) a(L(11) + 0.4 + k * 0.4, 'thud', 0.3); a(L(11) + 2.0, 'pop', 0.6); a(L(11) + 2.6, 'beep', 0.25); a(L(11) + 2.9, 'beep', 0.25);
// 12 the yard and the gantry
a(L(12) + 0.3, 'motor', 0.2, 3.8); for (let k = 0; k < 6; k++) a(L(12) + 0.6 + k * 0.55, 'clank', 0.25); a(L(12) + 2.4, 'pop', 0.6); a(L(12) + 3.6, 'chime', 0.4);
// 13 which one is mine?
rec(L(13) + 0.3, 'wind-gust', 0.18, 0, 1.6, 1.0); a(L(13) + 1.2, 'pop', 0.6); a(L(13) + 2.8, 'tick', 0.3);
// 14 the number, the screen, found
a(L(14) + 0.6, 'pop', 0.6); a(L(14) + 2.0, 'beep', 0.25); a(L(14) + 2.2, 'notify', 0.35); a(L(14) + 2.4, 'ping', 0.3); rec(L(14) + 2.8, 'ding', 0.25, 0, 1.1, 1.0);
// 15 oranges get hot
a(L(15) + 0.4, 'pop', 0.6); a(L(15) + 1.4, 'sizzle', 0.25, 2.0); a(L(15) + 3.4, 'pop', 0.5); a(L(15) + 3.5, 'thud', 0.3);
// 16 reefers plugged in, cold
for (let k = 0; k < 3; k++) a(L(16) + 0.2 + k * 0.4, 'clank', 0.25); for (let k = 0; k < 3; k++) a(L(16) + 1.5 + k * 0.45, 'clink', 0.3); a(L(16) + 1.4, 'pop', 0.6); a(L(16) + 2.6, 'hum', 0.15, 2.0); a(L(16) + 3.6, 'pop', 0.6); a(L(16) + 3.8, 'chime', 0.35);
// 17 heavy on top, the ship lists
a(L(17) + 0.6, 'pop', 0.6); a(L(17) + 1.2, 'creak', 0.45, 2.0); a(L(17) + 2.6, 'pop', 0.5); a(L(17) + 2.7, 'thud', 0.35);
// 18 the plan
for (let k = 0; k < 4; k++) a(L(18) + 0.4 + k * 0.25, 'beep', 0.2); a(L(18) + 1.2, 'servo', 0.25, 1.4); a(L(18) + 3.0, 'pop', 0.5); a(L(18) + 3.0, 'chime', 0.4);
// 19 sails away
rec(L(19), 'ocean-waves', 0.2, 2, D(19), 1.2); a(L(19) + 1.0, 'pop', 0.6); a(L(19) + 0.4, 'bell', 0.2);
// 20 the storm, boxes overboard
rec(L(20), 'wind-gust', 0.35, 0, D(20), 1.2); rec(L(20) + 0.2, 'ocean-waves', 0.3, 8, D(20) - 0.2, 1.2); a(L(20) + 1.4, 'creak', 0.4, 1.0); a(L(20) + 2.4, 'splash', 0.45); a(L(20) + 2.0, 'pop', 0.6); a(L(20) + 0.8, 'boom', 0.25);
// 21 corner locks and lashing bars
for (let k = 0; k < 5; k++) a(L(21) + 0.9 + k * 0.45, 'clink', 0.35); a(L(21) + 1.2, 'pop', 0.6); a(L(21) + 2.2, 'clank', 0.35); a(L(21) + 3.0, 'pop', 0.6); a(L(21) + 3.7, 'chime', 0.4);
// 22 gate, X-ray, train
a(L(22) + 0.4, 'pop', 0.6); a(L(22) + 0.5, 'beep', 0.25); a(L(22) + 2.0, 'pop', 0.6); a(L(22) + 2.0, 'hum', 0.2, 1.4); a(L(22) + 3.0, 'motor', 0.25, 2.4); a(L(22) + 3.4, 'pop', 0.6); a(L(22) + 3.6, 'bell', 0.25);
// 23 congratulations, 24 outro
a(L(23) + 0.4, 'chime', 0.5); for (let k = 0; k < 6; k++) a(L(23) + 0.3 + k * 0.25, 'pop', 0.35);
a(L(24) + 0.4, 'pop', 0.7); a(L(24) + 0.5, 'chime', 0.5);
require('fs').writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: false, cues: c }, null, 1));
console.log(c.length + ' cues');
