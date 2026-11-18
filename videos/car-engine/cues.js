// Sound cues for «ازاي تعمل موتور؟» («ازاي نعمل» style): effects only, no music.
// node cues.js → cues.json, then python3 ../audio/sfx.py voice.wav cues.json <scratchpad>/car-engine-mix.wav
const fs = require('fs');
global.window = {}; eval(fs.readFileSync(__dirname + '/timing.js', 'utf8'));
const T = window.TIMING.lines, END = window.TIMING.duration, L = i => i >= T.length ? END : T[i].start, c = [];
const a = (t, fx, gain, dur) => c.push(Object.assign({ t: +Math.max(0, t).toFixed(2), fx, gain }, dur ? { dur: +dur.toFixed(2) } : {}));
const KIT = '../_templates/sketch/sfx/px-';
const rec = (t, n, gain, from, dur) => c.push({ t: +t.toFixed(2), file: (fs.existsSync(__dirname + '/sfx/px-' + n + '.mp3') ? 'sfx/px-' : KIT) + n + '.mp3', gain, from, dur: +dur.toFixed(2) });
// real car recordings the user sent (Pixabay, first used in «أوكتان»; credited in refs/SOURCES.md), in sfx/:
//   engine-idle 2–26 s steady idle · engine-start 0–3.4 s starter + catch · engine-rev 17–21 s climbing revs, 5–6.5 s a hard blip
//   engine-knock from 1 s a steady rattle · ignition-spark crackle (quiet: gain 1.5) · sports-car 1.5–6.5 s a car passing by
const idle = (t, dur, g) => rec(t, 'engine-idle', g || 0.26, 2 + (t * 7.3) % 12, dur);
const sparkR = (t, from) => rec(t, 'ignition-spark', 1.5, from || 1, 0.35);
const tag = (i, dt, good) => a(L(i) + (dt || 0.25), good === false ? 'beep' : 'tick', good === false ? 0.16 : 0.22);
const label = (i) => rec(L(i) + 0.05, 'ding', 0.32, 0.1, 1.2);
const land = (t, heavy) => a(t, heavy ? 'clank' : 'clink', heavy ? 0.4 : 0.35);

// 0–5 · the bottle: shaking, the cap pops, the spray, the spill
a(L(0) + 0.3, 'slosh', 0.35, 1.4);
a(L(1) + 0.33, 'pop', 0.7); a(L(1) + 0.38, 'fizz', 0.45, 2.2);
a(L(2) + 0.2, 'whoosh', 0.25, 0.8);
a(L(4) + 0.3, 'whoosh', 0.3, 0.9);
a(L(5) + 0.1, 'splash', 0.35, 1.0); tag(5, 0.25, false); tag(4, 0.25, false);
tag(0); tag(2, 0.15); tag(3, 0.2);
// 6–8 · the pipe drops, the cap becomes the piston
a(L(6) - 0.35, 'whoosh', 0.25, 0.7); land(L(6) + 0.2, true); a(L(6) + 0.6, 'servo', 0.2, 0.6); tag(6, 0.35);
for (let k = 0; k < 3; k++) a(L(7) + 0.35 + k * 0.75, 'thud', 0.18);
label(8);
// 9–14 · wheel, crank, the first turns, the arm gives up
a(L(9) + 0.1, 'bump', 0.3); tag(9, 0.25); tag(10, 0.15, false);
a(L(11) - 0.1, 'whoosh', 0.25, 0.7); land(L(11) + 0.6, true); a(L(11) + 0.9, 'gear', 0.25, 0.8); tag(11, 0.35);
a(L(12), 'spin', 0.25, L(14) + 1.2 - L(12));
label(13); tag(14, 0.25, false); a(L(14) + 0.3, 'creak', 0.25, 1.0);
// 15–17 · head, injector, spark: the first bang
land(L(15) - 0.05, true); a(L(15) + 0.5, 'spray', 0.3, 0.9); tag(15, 0.35);
land(L(16) - 0.25); a(L(16) + 0.0, 'spark', 0.3); sparkR(L(16) - 0.05, 1); sparkR(L(16) + 0.45, 3); a(L(16) + 0.08, 'boom', 0.45); rec(L(16) + 0.15, 'engine-start', 0.3, 0.9, 2.2); idle(L(16) + 2.0, L(18) - L(16) - 2.0, 0.22); tag(16, 0.25);
label(17);
// 18–22 · old smoke, the valves
tag(18, 0.25, false); tag(19, 0.25, false); idle(L(18), L(20) - L(18), 0.2);
land(L(20) + 0.3); land(L(20) + 0.45); idle(L(20) + 0.5, L(23) - L(20) - 0.5, 0.22); a(L(21) + 0.2, 'intake', 0.3, 0.8); a(L(21) + 1.0, 'exhaust', 0.3, 0.7); tag(20, 0.35);
label(22);
// 23–26 · weak pop, compression, the strong bang
a(L(23) + 0.4, 'pop', 0.25); tag(23, 0.35, false);
a(L(24) + 0.5, 'squeeze', 0.35, 1.2); tag(24, 0.45);
a(L(25) + 0.1, 'boom', 0.7); rec(L(25) + 0.15, 'engine-rev', 0.32, 5.0, 1.4); idle(L(25) + 1.4, L(27) - L(25) - 1.4, 0.28); tag(25, 0.25);
label(26);
// 27–31 · one cylinder shakes; four; a hundred bangs a second
a(L(27) + 0.1, 'clank', 0.25); rec(L(27) + 0.2, 'engine-knock', 0.3, 1.2, L(28) - L(27) - 0.1); tag(27, 0.35, false);
for (let k = 0; k < 3; k++) land(L(28) + 0.35 + k * 0.22, true); tag(28, 0.35);
idle(L(28) + 0.9, L(30) - L(28) - 0.8, 0.3);
rec(L(30), 'engine-rev', 0.42, 16.8, L(32) - L(30) + 0.5);
idle(L(32) + 0.3, L(36) - L(32) - 0.3, 0.2); idle(L(37) + 0.8, L(40) - L(37) - 0.6, 0.12);
// 32–35 · heat, water, radiator
a(L(32) + 0.1, 'sizzle', 0.3, 1.8); tag(32, 0.15);
a(L(33) + 0.3, 'coolant', 0.35, 2.4); tag(33, 0.35);
a(L(34) - 0.1, 'whoosh', 0.25, 0.7); land(L(34) + 0.55, true); label(35);
// 36–38 · loud pipe, muffler
rec(L(36) - 0.05, 'engine-rev', 0.55, 4.9, L(37) - L(36) + 0.2); a(L(36) + 0.5, 'exhaust', 0.3, 0.6); tag(36, 0.25, false);
a(L(37) + 0.05, 'whoosh', 0.25, 0.7); land(L(37) + 0.85, true); tag(37, 0.35);
label(38);
// 39–41 · tank, starter, wheels
land(L(39) + 0.75, true); tag(39, 0.15); rec(L(40) + 0.3, 'engine-start', 0.4, 0, 2.7); tag(40, 0.1);
for (let k = 0; k < 4; k++) a(L(41) + 0.45 + k * 0.12, 'bump', 0.28); tag(41, 0.1);
// 42–44 · the body drops on, the engine revs, the car is done
a(L(42) + 0.0, 'whoosh', 0.35, 1.2); a(L(42) + 1.5, 'thud', 0.4);
rec(L(43) + 0.2, 'engine-rev', 0.45, 7.0, 1.8); rec(L(44) + 0.6, 'sports-car', 0.35, 1.8, 3.2); a(L(44) - 0.1, 'chime', 0.4); a(L(44) + 0.5, 'beep', 0.18); a(L(44) + 0.62, 'beep', 0.18);
c.sort((x, y) => x.t - y.t);
fs.writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: false, cues: c }, null, 1));
console.log(c.length, 'cues');
