// Sound cues for «معجزة هدسون»: node cues.js → cues.json. Effects only, no music (the user's rule).
// The three real approach-control clips (sfx/px-atc-*.mp3) play in the gaps clips.py opened; sfx/real-*.wav are real recordings the channel sent (see refs/SOURCES.md); sfx/make.py makes the rest.
global.window = {}; eval(require('fs').readFileSync(__dirname + '/timing.js', 'utf8'));
const T = window.TIMING.lines, END = window.TIMING.duration, L = i => i >= T.length ? END : T[i].start, D = i => L(i + 1) - L(i), c = [];
const a = (t, fx, gain, dur, o) => c.push(Object.assign({ t: +t.toFixed(2), fx, gain }, dur ? { dur: +dur.toFixed(2) } : {}, o || {}));
const r = (t, file, gain, from, dur, o) => c.push(Object.assign({ t: +t.toFixed(2), file, gain, from: from || 0 }, dur ? { dur: +dur.toFixed(2) } : {}, o || {}));
const K = '../_templates/sketch/sfx/', S = 'sfx/';
const loop = (t0, t1, file, gain, len) => { for (let t = t0; t < t1 - .3; t += len - .5) r(t, file, gain, 0, Math.min(len, t1 - t)); };
const CLIP = new Set(window.TIMING.clips.map(q => q.line));
window.TIMING.clips.forEach(q => { r(q.t, 'sfx/px-' + q.file + '.mp3', 1.0, 0, null, { duck: false }); r(Math.max(0, q.t - 0.2), K + 'px-space-drone.mp3', 0.25, 0, D(q.line) + 0.4); });
for (let i = 1; i < T.length; i++) if (!CLIP.has(i)) a(L(i) - 0.1, 'whoosh', 0.07);
// 0–8 the cold open: wind over the river, the gliding plane (no engines), the clock
a(0.05, 'wind', 0.18, L(2)); loop(L(1), L(4), K + 'px-wind-gust.mp3', 0.12, 4);
a(L(2), 'waves', 0.14, D(2) + D(3)); a(L(3) + .5, 'wind', 0.2, D(3));
a(L(4), 'jet', 0.14, D(4)); a(L(4) + D(4) * .4, 'pop', 0.25);
r(L(5), K + 'px-clock-ticking.mp3', 0.45, 0, D(5)); r(L(6) + .2, S + 'real-geese.wav', 0.45, 0, 3); a(L(6), 'jet', 0.1, D(6));
a(L(7) + .3, 'tick', 0.3); a(L(7) + D(7) * .5, 'pop', 0.3); r(L(8), K + 'px-clock-ticking.mp3', 0.35, 0, D(8));
// 9–13 LaGuardia, the cockpit, the takeoff
r(L(8) + .4, S + 'real-cabin.wav', 0.3, 0, D(8) + D(9)); a(L(9) + D(9) * .6, 'pop', 0.25);
loop(L(10), L(12), S + 'real-cabin.wav', 0.4, 12); a(L(10) + .5, 'ding', 0.0); r(L(10) + 1.2, K + 'px-ding.mp3', 0.15, 0, 1.2);
r(L(12) - .3, S + 'real-takeoff.wav', 0.75, 0, D(12) + D(13) + .5); a(L(12) + .5, 'pop', 0.3);
 a(L(13), 'wind', 0.15, D(13));
// 14–19 the geese, the strike, «my aircraft», the APU
a(L(14), 'jet', 0.2, D(14)); r(L(14) + .2, S + 'real-geese.wav', 0.85, 0, D(14)); a(L(14) + D(14) - .6, 'whoosh', 0.2);
a(L(15) + .95, 'thud', 0.9); a(L(15) + 1.05, 'boom', 0.55); a(L(15) + 1.2, 'thud', 0.7); a(L(15) + 1.35, 'thud', 0.6);
r(L(15) + 1.1, S + 'real-spooldown.wav', 0.9, 0, 6); r(L(15) + 1.1, S + 'spooldown.wav', 0.35, 0, 5); a(L(15) + 1.6, 'sizzle', 0.25, 1.6);
r(L(16), S + 'real-crc.wav', 0.25, 0, D(16)); a(L(16), 'wind', 0.25, D(16) + D(17) + D(18) + D(19) + D(20));
a(L(17) + D(17) * .3 + .8, 'clink', 0.5); a(L(17) + D(17) * .3 + .85, 'hum', 0.25, 2.4); a(L(18) + .2, 'ping', 0.3);
r(L(19), S + 'real-crc.wav', 0.18, 0, D(19)); a(L(19) + .3, 'tick', 0.3);
// 21–29 the controller, the glide down, «we can't», the checklist, the city, the river
loop(L(21), L(22), S + 'radar.wav', 0.5, 8); a(L(21) + .5, 'beep', 0.12);
a(L(22), 'wind', 0.3, D(22)); for (let k = 0; k < 4; k++) a(L(22) + .6 + k * D(22) / 4, 'tick', 0.25);
a(L(23), 'wind', 0.2, D(23)); a(L(23) + D(23) * .5, 'pop', 0.3); r(L(24), S + 'real-crc.wav', 0.2, 0, D(24));
a(L(25), 'wind', 0.2, D(25)); for (let k = 0; k < 4; k++) r(L(25) + .4 + k * 1.2, K + 'px-paper.mp3', 0.35, 0, .6);
a(L(26), 'wind', 0.3, D(26) + D(27)); r(L(26) + .3, K + 'px-wind-gust.mp3', 0.2, 0, 3);
a(L(27) + .4, 'whoosh', 0.25); a(L(27) + D(27) * .5, 'pop', 0.3);
a(L(28), 'wind', 0.35, D(28)); loop(L(28), L(29), S + 'real-cabin.wav', 0.35, 12); a(L(28) + 1, 'creak', 0.2, 1.5);
r(L(29), S + 'real-crc.wav', 0.18, 0, D(29)); a(L(29) + D(29) - .5, 'clank', 0.25);
// 30–31 the bio line keeps the tension low, then back in
a(L(30), 'wind', 0.12, D(30)); a(L(30) + .2, 'pop', 0.3); r(L(30), K + 'px-space-drone.mp3', 0.15, 0, D(30) + D(31));
// 32–36 brace, heads down, the bridge, the flare, the water
loop(L(31), L(34), S + 'real-cabin.wav', 0.4, 12); a(L(32) + .3, 'ding', 0); r(L(32), K + 'px-ding.mp3', 0.3, 0, 1.2);
a(L(33), 'wind', 0.3, D(33)); a(L(34), 'wind', 0.4, D(34)); a(L(34) + D(34) * .5, 'whoosh', 0.35);
a(L(35), 'wind', 0.45, D(35)); a(L(35) + D(35) - 1, 'whoosh', 0.3);
a(L(36) + .35, 'boom', 0.6); a(L(36) + .4, 'splash', 0.9, 1.6); r(L(36) + .4, K + 'px-water-rush.mp3', 0.55, 0, 3); a(L(36) + .5, 'slosh', 0.4);
// 37–43 radar lost, the plane afloat, the wings, Sully's walk, the ferries, all alive
loop(L(37), L(39), S + 'radar.wav', 0.45, 8);
a(L(39), 'waves', 0.3, D(39) + D(40) + D(41) + D(42) + D(43)); a(L(39), 'wind', 0.2, D(39) + D(40));
a(L(40) + 1, 'slosh', 0.25); a(L(41), 'drip', 0.3); a(L(41) + .8, 'drip', 0.3); a(L(41) + 1.4, 'slosh', 0.3); for (let k = 0; k < 6; k++) a(L(41) + .3 + k * .55, 'bump', 0.12);
r(L(42) + .6, S + 'real-horn.wav', 0.45); a(L(42), 'idle', 0.18, D(42)); r(L(43) + D(43) * .5, S + 'real-horn.wav', 0.3);
a(L(43) + D(43) * .45, 'chime', 0.18);
// 44–50 the question, the simulator, the button, the tapes, the museum, the end
a(L(44) + .3, 'tick', 0.3); r(L(45), K + 'px-pencil-scribble.mp3', 0.25, 0, 2); a(L(45) + D(45) * .75, 'ding', 0); r(L(45) + D(45) * .75, K + 'px-ding.mp3', 0.25, 0, 1);
r(L(46), K + 'px-clock-ticking.mp3', 0.4, 0, D(46) * .6); a(L(46) + 1 + D(46) * .6, 'thud', 0.5); a(L(46) + 1 + D(46) * .6, 'snip', 0.3);
a(L(47) + .3, 'hum', 0.2, 2); a(L(47) + .4, 'ping', 0.25); r(L(48) + .3, K + 'px-paper.mp3', 0.35, 0, .8);
a(L(49), 'hum', 0.1, D(49)); a(L(49) + D(49) * .5, 'pop', 0.25); a(L(50), 'waves', 0.2, D(50) + 1.5); r(L(50) + .4, S + 'real-horn.wav', 0.2);
require('fs').writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: false, cues: c.filter(q => q.gain > 0) }, null, 0));
console.log(c.length, 'cues');
