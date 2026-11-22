// Sound cues for «سالم إكسبريس»: node cues.js → cues.json. Effects only, no music (the user's rule).
// The survivor's four clips (sfx/px-*.mp3) play in the gaps clips.py opened; sfx/real-*.wav are the Pixabay effects the channel sent.
global.window = {}; eval(require('fs').readFileSync(__dirname + '/timing.js', 'utf8'));
const T = window.TIMING.lines, END = window.TIMING.duration, L = i => i >= T.length ? END : T[i].start, D = i => L(i + 1) - L(i), c = [];
const a = (t, fx, gain, dur, o) => c.push(Object.assign({ t: +t.toFixed(2), fx, gain }, dur ? { dur: +dur.toFixed(2) } : {}, o || {}));
const r = (t, file, gain, from, dur, o) => c.push(Object.assign({ t: +t.toFixed(2), file, gain, from: from || 0 }, dur ? { dur: +dur.toFixed(2) } : {}, o || {}));
const K = '../_templates/sketch/sfx/', S = 'sfx/';
const loop = (t0, t1, file, gain, len) => { for (let t = t0; t < t1 - .3; t += len - 1) r(t, file, gain, 0, Math.min(len, t1 - t)); };
const CLIP = new Set(window.TIMING.clips.map(q => q.line));
window.TIMING.clips.forEach(q => { r(q.t, 'sfx/px-' + q.file + '.mp3', 1.0, 0, null, { duck: false }); });
for (let i = 1; i < T.length; i++) if (!CLIP.has(i)) a(L(i) - 0.1, 'whoosh', 0.05);
// 0–2 the storm under the survivor's voice, then the calm night sea
loop(0, L(2), S + 'real-storm.wav', 0.35, 30); loop(L(2), L(3), S + 'real-engine.wav', 0.25, 20); a(L(2), 'waves', 0.2, D(2));
// 3–8 the map, the pilgrims, the stopwatch, the wreck today, Jeddah
r(L(3) + .3, K + 'px-paper.mp3', 0.3, 0, .6); a(L(3) + D(3) * .45, 'pop', 0.3); loop(L(4), L(5), S + 'real-harbor.wav', 0.35, 20);
a(L(5) + .3, 'servo', 0.15); a(L(5) + D(5) * .55, 'thud', 0.35); r(L(6), K + 'px-clock-ticking.mp3', 0.45, 0, D(6));
r(L(7), S + 'real-under.wav', 0.5, 0, D(7)); loop(L(8), L(9), S + 'real-harbor.wav', 0.3, 20); a(L(8) + 1, 'clank', 0.2);
// 9–13 the ship, the bow door, the pilgrims boarding, sailing
r(L(9) + .3, K + 'px-paper.mp3', 0.35, 0, .6); a(L(9), 'waves', 0.15, D(9)); a(L(10) + .6, 'servo', 0.45, 1.6); a(L(10) + 2, 'idle', 0.25, D(10) - 2); a(L(11) + .2, 'ping', 0.3);
loop(L(12), L(13), S + 'real-harbor.wav', 0.3, 20); loop(L(13), L(14), S + 'real-engine.wav', 0.35, 20); r(L(13), S + 'real-gulls.wav', 0.25, 0, D(13));
// 14–21 the map from above, the reefs, the storm, the shortcut
r(L(14), K + 'px-paper.mp3', 0.3, 0, .6); a(L(14), 'hum', 0.08, D(14) + D(15) + D(16)); a(L(16) + D(16) * .3, 'pop', 0.3); a(L(17) + D(17) * .5, 'ping', 0.25);
loop(L(18), L(19), S + 'real-storm.wav', 0.38, 30); r(L(18), S + 'real-engine.wav', 0.2, 0, D(18)); r(L(19), K + 'px-pencil-scribble.mp3', 0.25, 0, 2);
r(L(20) + .5, K + 'px-pencil-scribble.mp3', 0.3, 0, 2.5); a(L(21) + .4, 'thud', 0.4); a(L(21) + .45, 'snip', 0.3);
// 22–27 the impact, the hole, the door, the water, the dark
loop(L(22), L(24), S + 'real-storm.wav', 0.34, 30); r(L(22), K + 'px-clock-ticking.mp3', 0.35, 0, D(22));
r(L(23) + .2, S + 'real-crash.wav', 0.9, 0, 7); a(L(23) + .5, 'boom', 0.5);
r(L(25), S + 'real-groan.wav', 0.7, 0, D(25)); r(L(25) + D(25) * .45, S + 'real-flood.wav', 0.5, 0, D(25) * .55 + D(26));
a(L(26) + D(26) * .55, 'clank', 0.5); a(L(26) + D(26) * .56, 'hum', 0.0); r(L(27), S + 'real-groan.wav', 0.5, 0, D(27)); r(L(27), S + 'real-flood.wav', 0.3, 4, D(27));
// 28–33 the tilt, the cliffhanger, the sinking
r(L(28), S + 'real-groan.wav', 0.25, 0, D(28)); r(L(29), S + 'real-groan.wav', 0.6, 0, D(29)); r(L(29), S + 'real-flood.wav', 0.4, 6, D(29));
r(L(30), S + 'real-storm.wav', 0.3, 0, D(30) + D(31)); r(L(30), K + 'px-space-drone.mp3', 0.3, 0, D(30) + D(31) + D(32));
loop(L(32), L(34), S + 'real-storm.wav', 0.34, 30); r(L(33) + D(33) * .3, S + 'real-groan.wav', 0.7, 0, 6); r(L(33) + D(33) * .45, S + 'real-flood.wav', 0.6, 0, D(33) * .55); a(L(33) + D(33) - 1.2, 'splash', 0.6, 1.2);
// 34–37 the cabins, the people in the waves, dawn
r(L(34), S + 'real-under.wav', 0.4, 5, D(34)); r(L(34), S + 'real-flood.wav', 0.35, 8, D(34));
loop(L(35), L(37), S + 'real-storm.wav', 0.4, 30); for (let k = 0; k < 4; k++) a(L(36) + .5 + k * 1.1, 'slosh', 0.25);
r(L(37), S + 'real-gulls.wav', 0.35, 0, D(37)); r(L(37), S + 'real-harbor.wav', 0.25, 0, D(37)); a(L(37) + 1, 'idle', 0.2, D(37) - 1);
// 38–41 the number, the list, the map
a(L(38), 'waves', 0.15, D(38) + D(39)); a(L(38) + .5, 'pop', 0.25); r(L(39) + .4, K + 'px-paper.mp3', 0.35, 0, .7);
r(L(40), K + 'px-paper.mp3', 0.3, 0, .6); a(L(40) + .6, 'thud', 0.3); a(L(41) + .4, 'tick', 0.3); r(L(41) + D(41) * .45, K + 'px-pencil-scribble.mp3', 0.25, 0, 1.5);
// 42–46 under the sea: the divers, the wreck, the things inside
loop(L(42), L(47), S + 'real-under.wav', 0.42, 30); for (let k = 0; k < 5; k++) a(L(42) + 1 + k * 3.3, 'bubbles', 0);
// 47–50 the ban, the bow door again, Al-Salam 98, the end
r(L(47), K + 'px-pencil-scribble.mp3', 0.25, 0, 1.5); a(L(47) + .7, 'thud', 0.4); a(L(47) + .75, 'snip', 0.3);
loop(L(48), L(49), S + 'real-storm.wav', 0.34, 30); a(L(48) + 1.2, 'servo', 0.4, 1.2); r(L(48) + 1.8, S + 'real-groan.wav', 0.4, 0, 4);
a(L(49), 'waves', 0.2, D(49)); r(L(49), S + 'real-engine.wav', 0.2, 0, D(49)); loop(L(50), END + 1.5, S + 'real-harbor.wav', 0.3, 20); r(L(50), S + 'real-gulls.wav', 0.25, 0, D(50) + 1.5);
require('fs').writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: false, cues: c.filter(q => q.gain > 0) }, null, 0));
console.log(c.length, 'cues');
