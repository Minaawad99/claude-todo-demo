// Sound cues for «إير فلوريدا 90»: node cues.js → cues.json. Effects only, no music (the user's rule).
// Real clips (sfx/px-*.mp3) play in the gaps clips.py opened; sfx/real-*.wav are recordings the channel sent from Pixabay/YouTube.
global.window = {}; eval(require('fs').readFileSync(__dirname + '/timing.js', 'utf8'));
const T = window.TIMING.lines, END = window.TIMING.duration, L = i => i >= T.length ? END : T[i].start, D = i => L(i + 1) - L(i), c = [];
const a = (t, fx, gain, dur, o) => c.push(Object.assign({ t: +t.toFixed(2), fx, gain }, dur ? { dur: +dur.toFixed(2) } : {}, o || {}));
const r = (t, file, gain, from, dur, o) => c.push(Object.assign({ t: +t.toFixed(2), file, gain, from: from || 0 }, dur ? { dur: +dur.toFixed(2) } : {}, o || {}));
const K = '../_templates/sketch/sfx/', S = 'sfx/', H = '../hudson/sfx/';
const loop = (t0, t1, file, gain, len) => { for (let t = t0; t < t1 - .3; t += len - .5) r(t, file, gain, 0, Math.min(len, t1 - t)); };
const CLIP = new Set(window.TIMING.clips.map(q => q.line));
window.TIMING.clips.forEach(q => { r(q.t, 'sfx/px-' + q.file + '.mp3', 1.0, 0, null, { duck: false }); r(Math.max(0, q.t - 0.2), K + 'px-space-drone.mp3', 0.22, 0, D(q.line) + 0.4); });
for (let i = 1; i < T.length; i++) if (!CLIP.has(i)) a(L(i) - 0.1, 'whoosh', 0.06);
// the blizzard runs under most of the film: wind, gusts
a(0, 'wind', 0.22, L(8)); loop(L(1), L(9), K + 'px-wind-gust.mp3', 0.16, 4);
r(L(1), S + 'real-heli.wav', 0.35, 0, D(1)); a(L(2), 'wind', 0.25, D(2) + D(3)); r(L(2) + .3, S + 'real-traffic.wav', 0.2, 0, D(2));
a(L(3) + .3, 'wind', 0.3, D(3)); a(L(4) + .4, 'jet', 0.12, D(4)); a(L(4) + D(4) * .5, 'pop', 0.3);
r(L(5), K + 'px-clock-ticking.mp3', 0.45, 0, D(5)); a(L(6) + .4, 'clink', 0.4); a(L(6) + D(6) * .5, 'pop', 0.25);
a(L(7), 'hum', 0.12, D(7)); a(L(8), 'wind', 0.22, D(8) + D(9) + D(10)); r(L(8), K + 'px-clock-ticking.mp3', 0.3, 0, D(8));
a(L(9), 'idle', 0.25, D(9)); a(L(9) + .6, 'beep', 0.1); a(L(10) + .5, 'ding', 0); r(L(10) + .5, K + 'px-ding.mp3', 0.2, 0, 1);
a(L(11), 'wind', 0.12, D(11) + D(12)); r(L(12) + .2, K + 'px-ding.mp3', 0.18, 0, 1);
a(L(13), 'hum', 0.15, D(13)); a(L(14), 'wind', 0.25, D(14)); a(L(14) + .5, 'jet', 0.12, D(14));
a(L(15), 'spray', 0.4, D(15)); a(L(15), 'idle', 0.25, D(15)); loop(L(16), L(18), K + 'px-wind-gust.mp3', 0.3, 4); r(L(16), K + 'px-clock-ticking.mp3', 0.35, 0, D(16));
a(L(17), 'wind', 0.4, D(17)); r(L(18) + .4, K + 'px-paper.mp3', 0.35, 0, .6); a(L(18), 'hum', 0.15, D(18));
a(L(19) + .3, 'clink', 0.5); a(L(20) + .2, 'ping', 0.3); a(L(21), 'wind', 0.2, D(21)); a(L(21) + .6, 'sizzle', 0.15, 1.5); a(L(22) + .3, 'servo', 0.25); a(L(23) + D(23) * .45, 'servo', 0.3); a(L(23) + D(23) * .5, 'thud', 0.3);
// the takeoff, the warnings, the fall
r(L(24) - .4, S + 'real-takeoff.wav', 0.55, 0, D(24) + D(25) + D(26) + D(27) + D(28) + .5);
r(L(29), S + 'real-shaker.wav', 0.6, 0, D(29)); a(L(29), 'wind', 0.4, D(29) + D(30));
r(L(30), S + 'real-shaker.wav', 0.35, 0, D(30)); r(L(30) + .5, S + 'real-traffic.wav', 0.35, 0, D(30));
r(L(31), S + 'real-shaker.wav', 0.4, 0, D(31)); a(L(32), 'wind', 0.12, D(32)); r(L(32), K + 'px-space-drone.mp3', 0.2, 0, D(32) + D(33));
a(L(33), 'wind', 0.45, D(33)); r(L(33) + .3, S + 'real-traffic.wav', 0.3, 0, D(33));
r(L(34), K + 'px-space-drone.mp3', 0.3, 0, D(34));
a(L(35) + 1.4, 'boom', 0.85); a(L(35) + 1.45, 'clank', 0.6); a(L(35) + 1.5, 'thud', 0.8); a(L(35) + 2.6, 'splash', 0.9, 1.6); r(L(35) + 2.6, K + 'px-water-rush.mp3', 0.5, 0, 3);
// under the water, the survivors, the rescue
a(L(36), 'fill', 0.3, D(36)); a(L(36) + .5, 'bubbles', 0); r(L(36), K + 'px-space-drone.mp3', 0.3, 0, D(36));
a(L(38), 'hum', 0.08, D(38)); a(L(39), 'wind', 0.3, D(39) + D(40)); a(L(39), 'slosh', 0.3); a(L(39) + 1.5, 'creak', 0.25, 1.5);
r(L(40) + D(40) * .4, S + 'real-siren.wav', 0.2, 0, D(40) * .6); a(L(40) + .6, 'pop', 0.25);
loop(L(41), L(46), S + 'real-heli.wav', 0.45, 12.8); a(L(41), 'wind', 0.3, D(41) + D(42) + D(43) + D(44) + D(45));
a(L(43) + .8, 'slosh', 0.3); a(L(43) + 2.4, 'slosh', 0.3); a(L(44) + .5, 'slosh', 0.2);
a(L(45) + .5, 'slosh', 0.35); a(L(45) + 2, 'slosh', 0.3); r(L(46), S + 'real-heli.wav', 0.25, 2, D(46));
a(L(47), 'wind', 0.3, D(47)); a(L(47) + .6, 'slosh', 0.35); r(L(47) + 1, S + 'real-siren.wav', 0.18, 0, D(47) - 1);
a(L(48) + 1, 'whoosh', 0.3); a(L(48) + 2.3, 'splash', 0.8, 1.2); a(L(48), 'wind', 0.3, D(48));
// the causes, the lesson, the bridge, Hudson, the end
a(L(49) + .8, 'thud', 0.45); a(L(49) + .85, 'snip', 0.3); for (let k = 0; k < 3; k++) a(L(50) + .1 + k * D(50) * .31, 'pop', 0.3);
a(L(51) + D(51) * .6, 'ding', 0); r(L(51) + D(51) * .6, K + 'px-ding.mp3', 0.25, 0, 1); a(L(52), 'wind', 0.15, D(52)); r(L(52) + .3, S + 'real-traffic.wav', 0.12, 0, D(52));
a(L(53), 'waves', 0.25, D(53)); r(L(53) + .5, H + 'real-horn.wav', 0.3); a(L(54), 'wind', 0.15, D(54) + 1.5);
require('fs').writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: false, cues: c.filter(q => q.gain > 0) }, null, 0));
console.log(c.length, 'cues');
