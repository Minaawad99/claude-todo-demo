// Sound cues for «كوستا كونكورديا»: node cues.js → cues.json. Effects only, no music (the user's rule).
// The three real clips (sfx/px-*.mp3, cut from the call and the passenger video the channel sent) play in the gaps clips.py opened.
global.window = {}; eval(require('fs').readFileSync(__dirname + '/timing.js', 'utf8'));
const T = window.TIMING.lines, END = window.TIMING.duration, L = i => i >= T.length ? END : T[i].start, D = i => L(i + 1) - L(i), c = [];
const a = (t, fx, gain, dur, o) => c.push(Object.assign({ t: +t.toFixed(2), fx, gain }, dur ? { dur: +dur.toFixed(2) } : {}, o || {}));
const r = (t, file, gain, from, dur, o) => c.push(Object.assign({ t: +t.toFixed(2), file, gain, from: from || 0 }, dur ? { dur: +dur.toFixed(2) } : {}, o || {}));
const K = '../_templates/sketch/sfx/';
const CLIP = new Set(window.TIMING.clips.map(q => q.line));
window.TIMING.clips.forEach(q => { r(q.t, 'sfx/px-' + q.file + '.mp3', 1.0, 0, null, { duck: false }); r(Math.max(0, q.t - 0.2), K + 'px-space-drone.mp3', 0.3, 0, D(q.line) + 0.4); });
for (let i = 1; i < T.length; i++) if (!CLIP.has(i)) a(L(i) - 0.1, 'whoosh', 0.08);
// 0–7 night sea, the island, the ship
r(0.05, K + 'px-ocean-waves.mp3', 0.22, 0.2, Math.min(21, L(5))); a(0.1, 'wind', 0.1, L(2)); a(L(0) + 2.0, 'creak', 0.3, 2.2);
a(L(1) + 0.3, 'beep', 0.15); a(L(2), 'motor', 0.16, D(2) + D(3)); a(L(3) + D(3) * 0.6, 'pop', 0.3);
a(L(4), 'clink', 0.2); a(L(4) + 1.2, 'clink', 0.15, null, { f: 2100 }); [0, 1, 2, 3].forEach(k => a(L(4) + 0.4 + k * 0.6, 'bell', 0.12, null, { f: [523, 659, 784, 659][k] }));
a(L(5) + 0.6, 'creak', 0.4, 2.2); r(L(6) + 0.2, K + 'px-space-drone.mp3', 0.3, 0, D(6)); r(L(7), K + 'px-clock-ticking.mp3', 0.4, 0, D(7));
// 8–14 the port, the captain, the salute, the bridge
a(L(8), 'motor', 0.2, D(8)); r(L(9) + 0.3, K + 'px-paper.mp3', 0.3, 0, 0.6); a(L(9) + D(9) * 0.6, 'snip', 0.3); a(L(10) + 0.4, 'ping', 0.25);
a(L(11), 'waves', 0.15, D(11)); a(L(11) + 1.0, 'bell', 0.2, null, { f: 784 }); a(L(12), 'hum', 0.1, D(12) + D(13));
for (let k = 0; k < 4; k++) a(L(13) + 0.3 + k * 0.35, 'beep', 0.15); a(L(13) + D(13) * 0.35, 'snip', 0.4); r(L(14) + 0.3, K + 'px-paper.mp3', 0.3, 0, 0.5); a(L(14) + D(14) * 0.5, 'ping', 0.2);
// 15–19 the rocks, the impact, the blackout, the dining room
r(L(15), K + 'px-ocean-waves.mp3', 0.35, 4, D(15)); a(L(15) + D(15) * 0.6, 'creak', 0.4, 2);
a(L(16) + 0.6, 'boom', 0.8); a(L(16) + 0.65, 'clank', 0.6); a(L(16) + 0.8, 'creak', 0.8, 2.4); a(L(16) + 1.0, 'thud', 0.5);
a(L(17), 'fill', 0.5, D(17)); a(L(17) + D(17) * 0.45, 'zap', 0.5); a(L(17) + D(17) * 0.45 + 0.1, 'thud', 0.3);
for (let k = 0; k < 6; k++) a(L(18) + 0.4 + k * 0.5, 'clink', 0.3, null, { f: 1500 + k * 120 }); a(L(18) + 1.0, 'thud', 0.3);
a(L(19) + 0.3, 'bell', 0.3, null, { f: 440 }); a(L(19) + 1.0, 'bell', 0.25, null, { f: 330 });
// 20–26 the speakers, the coast guard, the muster, the water
a(L(20) + 0.4, 'beep', 0.2); a(L(21), 'hum', 0.12, D(21) + D(22)); a(L(21) + 0.6, 'notify', 0.3); a(L(22) + 0.3, 'ping', 0.3);
a(L(23), 'wind', 0.08, D(23)); r(L(25), K + 'px-water-rush.mp3', 0.3, 3, D(25)); a(L(25) + 0.5, 'creak', 0.3, 2);
a(L(26), 'hum', 0.1, D(26)); a(L(26) + 0.6, 'notify', 0.25);
// 27–32 the order, the stuck boats, the deck, the cliffhanger
r(L(27), K + 'px-clock-ticking.mp3', 0.35, 0, D(27)); a(L(27) + 1.0, 'beep', 0.3); a(L(27) + 1.4, 'beep', 0.3); a(L(27) + 1.8, 'beep', 0.3);
a(L(28) + 0.4, 'creak', 0.5, 2.4); a(L(28) + 1.6, 'clank', 0.4); a(L(28) + D(28) * 0.6, 'snip', 0.3);
a(L(29), 'wind', 0.2, D(29)); a(L(29) + 1.0, 'creak', 0.6, 2.6); a(L(29) + 3.0, 'thud', 0.3);
r(L(30), K + 'px-space-drone.mp3', 0.45, 0, D(30)); a(L(30) + 0.8, 'creak', 0.6, 2.4); a(L(31) + 0.35, 'pop', 0.35); a(L(32), 'wind', 0.15, D(32));
// 33–40 the shore, the policeman, the call
r(L(33), K + 'px-ocean-waves.mp3', 0.25, 0.2, D(33) + D(34) + D(35)); a(L(34) + D(34) * 0.6, 'snip', 0.3);
a(L(35) + 0.4, 'rotor', 0.25, D(35) - 0.5); a(L(36), 'beep', 0.25); a(L(36) + 0.4, 'beep', 0.25); a(L(37), 'hum', 0.08, D(37) + D(38));
a(L(37) + D(37) * 0.7, 'beep', 0.3); a(L(38), 'wind', 0.15, D(38)); a(L(40) + 0.6, 'snip', 0.35); a(L(40), 'waves', 0.2, D(40));
// 41–48 the island, the deputy mayor, the couple, the dead, the sentence, the wreck, De Falco
a(L(41), 'wind', 0.1, D(41)); a(L(41) + 0.6, 'bell', 0.2, null, { f: 392 }); a(L(42), 'rotor', 0.15, D(42)); a(L(42) + 1.2, 'clank', 0.2);
a(L(43) + D(43) * 0.45, 'thud', 0.35); a(L(43) + D(43) * 0.45 + 0.3, 'thud', 0.35);
c.push({ t: +(L(44) + 0.4).toFixed(2), fx: 'bell', gain: 0.4, dur: 2.5, f: 220 }); a(L(44), 'waves', 0.2, D(44));
a(L(45) + D(45) * 0.3, 'clank', 0.6); a(L(45) + D(45) * 0.3 + 0.2, 'thud', 0.4);
a(L(46), 'waves', 0.2, D(46)); a(L(46) + D(46) * 0.45, 'creak', 0.5, 2.6); a(L(46) + D(46) * 0.45 + 1.0, 'servo', 0.3);
a(L(47) + 0.4, 'ping', 0.2); c.push({ t: +(L(48) + 0.3).toFixed(2), fx: 'bell', gain: 0.3, dur: 2.5, f: 330 }); a(L(48), 'waves', 0.2, D(48));
require('fs').writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: false, cues: c }, null, 1)); console.log(c.length, 'cues');
