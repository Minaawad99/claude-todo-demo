// Sound cues from the line timings: node cues.js → cues.json
// A quiet, sad story: the series music box under the calm part, a low drone while the bomb falls, near-silence after the
// flash, the music back from the aftermath to the end. Recorded clips come from the «اسكتش» kit (../_templates/sketch/sfx).
global.window = {}; eval(require('fs').readFileSync(__dirname + '/timing.js', 'utf8'));
const T = window.TIMING.lines, END = window.TIMING.duration, L = i => i >= T.length ? END : T[i].start, D = i => L(i + 1) - L(i), c = [];
const a = (t, fx, gain, dur) => c.push(Object.assign({ t: +t.toFixed(2), fx, gain }, dur ? { dur: +dur.toFixed(2) } : {}));
const r = (t, file, gain, from, dur) => c.push({ t: +t.toFixed(2), file, gain, from: from || 0, dur: +dur.toFixed(2) });
const K = '../_templates/sketch/sfx/';
const sh = i => L(i) - 0.25;                                  // when shot i starts on screen
for (let i = 1; i < T.length; i++) if (![15, 16, 17].includes(i)) a(L(i) - 0.1, 'whoosh', 0.12);
// music: the music box from the start to the drop, then from the aftermath to the end
r(0, K + 'px-music-soft.mp3', 0.55, 0, L(13) + 0.5);
r(L(21) - 0.3, K + 'px-music-soft.mp3', 0.5, 40, END - L(21) + 2.5);
// 0: the watch ticks… and stops
r(0.1, K + 'px-clock-ticking.mp3', 0.7, 0, D(0) * 0.55); a(sh(0) + D(0) * 0.55 + 0.25, 'thud', 0.5);
// 2, 5, 6: the city morning, the tram's bell and motor
a(L(2), 'wind', 0.12, D(2)); a(L(5) + 0.3, 'bell', 0.35); a(L(5) + 0.6, 'bell', 0.3); a(L(5), 'motor', 0.15, D(5));
a(L(6), 'idle', 0.15, D(6)); a(L(6) + 1.2, 'bell', 0.25);
a(L(7) + 0.4, 'gear', 0.25); a(L(7) + 1.6, 'bell', 0.25);
// 8–9: the air-raid siren, a far plane, the all-clear
r(L(8), 'sfx/siren.wav', 0.5, 0, Math.min(6, D(8) + 0.5)); a(L(8) + 1.0, 'idle', 0.12, D(8) - 1);
a(L(9) + 0.5, 'chime', 0.3);
a(L(10) + 0.3, 'bell', 0.25); a(L(10) + 1.2, 'steam', 0.15, 1.2);
// 11–14: the bomber above the clouds, the doors, the fall
a(L(11), 'idle', 0.35, D(11) + D(12)); a(L(11), 'wind', 0.25, D(11));
a(L(12) + 0.4, 'clank', 0.3);
a(L(13) + 0.1, 'servo', 0.45); a(L(13) + 0.6, 'servo', 0.4); a(sh(13) + 1.0, 'clank', 0.4); a(sh(13) + 1.1, 'whoosh', 0.35);
r(L(13), K + 'px-space-drone.mp3', 0.55, 0, L(15) + D(15) * 0.72 - L(13));
r(L(14), K + 'px-clock-ticking.mp3', 0.5, 0, D(14));
// 15–17: the flash, the blast, then almost nothing
const flash = sh(15) + D(15) * 0.72;
a(flash, 'boom', 1.0); a(flash + 0.05, 'thud', 0.8); r(flash + 0.3, K + 'px-wind-gust.mp3', 0.6, 0, 4.5);
a(L(16), 'wind', 0.3, D(16) + D(17));
// 18: the shadow on the steps
a(sh(18) + D(18) * 0.35, 'boom', 0.4);
// 19–20: the pressure wave, then fire
a(L(19) + 0.1, 'boom', 0.7); r(L(19) + 0.2, K + 'px-wind-gust.mp3', 0.7, 0, 4.0); for (let k = 0; k < 5; k++) a(L(19) + 0.6 + k * 0.5, 'clank', 0.18);
a(L(20), 'sizzle', 0.45, D(20)); a(L(20), 'wind', 0.3, D(20));
// 22: black rain
r(L(22), K + 'px-water-rush.mp3', 0.25, 5, D(22));
// 25: Nagasaki, a far rumble
a(L(25) + 0.4, 'boom', 0.4);
// 26–29: Sadako's cranes
a(L(26) + 1.0, 'bell', 0.2); for (let k = 0; k < 6; k++) r(L(28) + 0.3 + k * 0.8, K + 'px-paper.mp3', 0.45, 0, 0.6);
a(L(29) + 0.5, 'chime', 0.2);
// 30–32: the trams again
a(L(30), 'idle', 0.12, D(30)); a(L(31) + 0.5, 'bell', 0.35); a(L(31) + 0.8, 'bell', 0.3); a(L(31), 'motor', 0.15, D(31));
a(L(32) + 0.4, 'bell', 0.3); a(L(32), 'motor', 0.12, D(32));
// 33: the peace bell at 8:15
c.push({ t: +(L(33) + 0.4).toFixed(2), fx: 'bell', gain: 0.6, dur: 2.5, f: 220 }, { t: +(L(33) + 3.0).toFixed(2), fx: 'bell', gain: 0.5, dur: 2.5, f: 220 });
a(L(34) + 0.3, 'chime', 0.3);
require('fs').writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: false, cues: c }, null, 1)); console.log(c.length, 'cues');
