// Sound cues for «مثلث برمودا»: node cues.js → cues.json. Effects only, no music (the user's rule).
global.window = {}; eval(require('fs').readFileSync(__dirname + '/timing.js', 'utf8'));
const T = window.TIMING.lines, END = window.TIMING.duration, L = i => i >= T.length ? END : T[i].start, D = i => L(i + 1) - L(i), c = [];
const a = (t, fx, gain, dur, o) => c.push(Object.assign({ t: +t.toFixed(2), fx, gain }, dur ? { dur: +dur.toFixed(2) } : {}, o || {}));
const r = (t, file, gain, from, dur) => c.push({ t: +t.toFixed(2), file, gain, from: from || 0, dur: +dur.toFixed(2) });
const K = '../_templates/sketch/sfx/', S = (i, j) => L(j + 1) - L(i);
// the lightning in the picture flickers on its own clock (bolt(t, …, seed, per) in film/shots.js); thunder follows each strike
const hash = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const strikes = (from, to, seed, per, off, gain, every) => { let n = 0; for (let t = from; t < to; t += 0.02) { const ph = ((t + (off || 0) + hash(seed) * per) % per) / per; if (ph < 0.01) { if (n++ % (every || 1) === 0) { a(t, 'zap', gain * 0.35); r(t + 0.05, 'sfx/thunder.wav', gain, 0, Math.min(4.5, to - t + 1.5)); } t += per * 0.5; } } };
for (let i = 1; i < T.length; i++) a(L(i) - 0.1, 'whoosh', 0.08);
// 0–3: a bright afternoon, five engines over the sea
r(0.0, K + 'px-ocean-waves.mp3', 0.3, 0.2, S(0, 1)); r(0.0, 'sfx/engine.wav', 0.3, 0, 8); a(0.2, 'wind', 0.1, S(0, 2));
r(L(2) + 0.2, 'sfx/engine.wav', 0.22, 0, D(2)); for (let k = 0; k < 6; k++) a(L(2) + 0.5 + k * 0.45, 'thud', 0.1);
r(L(3), K + 'px-clock-ticking.mp3', 0.4, 0, D(3));
// 4–6: the question, the storm, the map
r(L(4), 'sfx/rain.wav', 0.25, 0, D(4)); a(L(4), 'wind', 0.2, D(4)); strikes(L(4) - 0.25, L(5) - 0.25, 4, 2.6, 0, 0.45);
r(L(5), K + 'px-space-drone.mp3', 0.4, 0, D(5) + D(6)); r(L(5) + 0.2, 'sfx/engine.wav', 0.15, 0, D(5) - 0.4);
a(L(6) + 0.3, 'tick', 0.3); a(L(6) + 0.9, 'tick', 0.3); a(L(6) + 1.5, 'tick', 0.3); a(L(6) + 1.9, 'chime', 0.25);
// 7–12: the take-off, Taylor, the refused request, the student
r(L(7), 'sfx/engine.wav', 0.5, 0, D(7)); a(L(7) + 0.3, 'rev', 0.35); a(L(7) + 1.0, 'wind', 0.2, D(7) - 1);
a(L(8) + 0.4, 'wind', 0.08, D(8)); r(L(8) + 0.2, 'sfx/engine.wav', 0.12, 0, D(8));
r(L(9) + 0.6, K + 'px-paper.mp3', 0.4, 0, 0.6); a(L(9) + D(9) - 1.3, 'thud', 0.45);
r(L(10) + 0.5, K + 'px-paper.mp3', 0.3, 0, 0.6); a(L(10) + 1.6, 'creak', 0.25, 1.2);
a(L(11) + 0.2, 'chime', 0.3);
r(L(12), 'sfx/engine.wav', 0.3, 0, D(12)); a(L(12), 'wind', 0.15, D(12)); a(L(12) + 1.6, 'whoosh', 0.3); a(L(12) + 2.2, 'splash', 0.35); a(L(12) + 2.8, 'splash', 0.3);
// 13–18: the radio, the compasses, the wrong islands
r(L(13), 'sfx/engine.wav', 0.25, 0, D(13)); r(L(13) + 1.2, 'sfx/static.wav', 0.3, 0, D(13) - 1.2);
r(L(14), 'sfx/static.wav', 0.35, 1, D(14)); a(L(14) + 0.3, 'spin', 0.3); a(L(14) + 1.4, 'spin', 0.25); r(L(14), K + 'px-space-drone.mp3', 0.3, 0, D(14) + D(15));
a(L(15) + 0.4, 'tick', 0.3); a(L(15) + 1.5, 'zap', 0.25); a(L(15) + 2.0, 'ping', 0.3);
r(L(16), 'sfx/engine.wav', 0.25, 0, D(16)); a(L(16), 'wind', 0.25, D(16));
r(L(17), 'sfx/static.wav', 0.45, 2, D(17)); r(L(17), 'sfx/engine.wav', 0.2, 0, D(17));
r(L(18), 'sfx/engine.wav', 0.25, 0, D(18)); a(L(18), 'wind', 0.25, D(18));
// 19–22: night, the storm, the last words, silence
r(L(19), 'sfx/rain.wav', 0.3, 0, D(19)); a(L(19), 'wind', 0.35, D(19)); strikes(L(19) - 0.25, L(20) - 0.25, 7, 2.2, 0, 0.5); r(L(19), K + 'px-ocean-waves.mp3', 0.3, 3, D(19));
r(L(20), 'sfx/rain.wav', 0.25, 2, D(20)); r(L(20), 'sfx/static.wav', 0.35, 0, D(20)); strikes(L(20) - 0.25, L(21) - 0.25, 11, 3, 0, 0.4);
r(L(21), 'sfx/rain.wav', 0.3, 0, D(21)); r(L(21), 'sfx/static.wav', 0.3, 3, D(21)); strikes(L(21) - 0.25, L(22) - 0.25, 13, 2.8, 0, 0.4); r(L(21), 'sfx/engine.wav', 0.2, 0, D(21));
r(L(22), 'sfx/static.wav', 0.4, 0, 1.8); a(L(22) + 1.8, 'beep', 0.2); r(L(22) + 2.4, 'sfx/rumble.wav', 0.25, 0, 3);
// 23–30: the flying boat, the ship, the fire, the search
a(L(23), 'waves', 0.25, D(23)); r(L(23) + 0.3, 'sfx/engine.wav', 0.5, 0, D(23)); a(L(23) + 0.6, 'spray', 0.3, 1.6); a(L(23) + 1.2, 'rev', 0.3);
r(L(24), 'sfx/rain.wav', 0.2, 0, D(24)); r(L(24) + 0.3, 'sfx/morse.wav', 0.3, 0, 1.8); r(L(24) + 2.0, 'sfx/static.wav', 0.3, 0, 1.2); a(L(24), 'wind', 0.2, D(24));
r(L(25), K + 'px-ocean-waves.mp3', 0.25, 5, D(25) + D(26)); a(L(25), 'motor', 0.12, D(25) + D(26)); r(L(25) + 0.6, K + 'px-space-drone.mp3', 0.4, 0, D(25) + D(26));
a(L(26) + 0.4, 'pop', 0.5);
a(L(27) + 0.2, 'boom', 0.8); a(L(27) + 0.3, 'thud', 0.6); r(L(27) + 0.4, 'sfx/fire.wav', 0.5, 0, D(27)); a(L(27), 'waves', 0.2, D(27));
r(L(28), K + 'px-ocean-waves.mp3', 0.35, 8, D(28)); r(L(28), 'sfx/fire.wav', 0.15, 2, 1.6); a(L(28) + 1.0, 'hum', 0.15, D(28) - 1);
r(L(29), 'sfx/engine.wav', 0.35, 0, D(29)); a(L(29), 'motor', 0.2, D(29)); a(L(29), 'waves', 0.2, D(29));
r(L(30), K + 'px-ocean-waves.mp3', 0.35, 12, D(30)); a(L(30) + 0.4, 'wind', 0.15, D(30));
// 31–36: the dead, the legends, the map, the books
c.push({ t: +(L(31) + 0.3).toFixed(2), fx: 'bell', gain: 0.35, dur: 2.5, f: 220 }); r(L(31), 'sfx/rumble.wav', 0.2, 0, D(31));
r(L(32), K + 'px-space-drone.mp3', 0.45, 0, D(32) + D(33)); for (let k = 0; k < 3; k++) r(L(32) + 0.3 + k * 0.35, K + 'px-paper.mp3', 0.3, 0, 0.5);
a(L(33), 'waves', 0.3, D(33)); a(L(33), 'wind', 0.25, D(33)); a(L(33) + 0.6, 'creak', 0.4, 2.2); a(L(33) + 2.4, 'creak', 0.3, 2);
r(L(34) + 0.3, K + 'px-paper.mp3', 0.45, 0, 0.6); a(L(34) + 2.0, 'thud', 0.35);
a(L(35) + 0.3, 'tick', 0.3); a(L(35) + 0.8, 'tick', 0.3); a(L(35) + 1.3, 'tick', 0.3); r(L(35) + 2.0, K + 'px-ding.mp3', 0.4, 0.1, 1.4);
for (let k = 0; k < 3; k++) a(L(36) + 0.2 + k * 0.5, 'thud', 0.35);
// 37–42: Bruce Gernon's cloud
a(L(37), 'wind', 0.2, D(37)); r(L(37) + 0.4, 'sfx/engine.wav', 0.2, 0, D(37) - 0.4);
r(L(38), 'sfx/engine.wav', 0.4, 0, D(38)); a(L(38), 'wind', 0.15, D(38));
r(L(39), K + 'px-space-drone.mp3', 0.55, 0, D(39)); a(L(39), 'wind', 0.4, D(39)); a(L(39) + 0.5, 'whoosh', 0.35); r(L(39), 'sfx/engine.wav', 0.2, 0, D(39));
a(L(40) + 0.2, 'spin', 0.35); r(L(40) + 0.6, 'sfx/static.wav', 0.3, 0, D(40) - 0.6); for (let k = 0; k * 2.8 < D(40); k++) a(L(40) + 0.8 + k * 2.8, 'ping', 0.25);
r(L(41), K + 'px-clock-ticking.mp3', 0.4, 1, D(41)); r(L(41) + 1.0, K + 'px-ding.mp3', 0.35, 0.1, 1.4);
a(L(42) + 0.5, 'hum', 0.1, D(42) - 0.5);
// 43–51: the truth
a(L(43) + 0.2, 'chime', 0.3); r(L(43), K + 'px-ocean-waves.mp3', 0.25, 4, D(43));
for (let k = 0; k * 0.6 < D(44); k++) a(L(44) + 0.3 + k * 0.6, 'tick', 0.12); a(L(44), 'motor', 0.1, D(44));
r(L(45), K + 'px-water-rush.mp3', 0.4, 3, D(45));
r(L(46), K + 'px-ocean-waves.mp3', 0.25, 2, D(46)); a(L(46) + 0.6, 'wind', 0.4, D(46) - 0.6); strikes(L(46) + 0.6, L(47) - 0.25, 21, 1.8, 0, 0.55, 2); r(L(46) + 1.0, 'sfx/rain.wav', 0.25, 0, D(46) - 1);
r(L(47), K + 'px-space-drone.mp3', 0.5, 0, D(47)); a(L(47) + 0.8, 'drip', 0.3); a(L(47) + 2.0, 'drop', 0.3);
r(L(48), 'sfx/engine.wav', 0.3, 0, D(48)); a(L(48), 'wind', 0.3, D(48)); a(L(48) + 0.5, 'spin', 0.2);
r(L(49), 'sfx/engine.wav', 0.35, 0, D(49)); a(L(49) + 2.2, 'spark', 0.5); a(L(49) + 2.4, 'boom', 0.55);
a(L(50), 'drip', 0.35); a(L(50) + 1.5, 'drip', 0.3); a(L(50), 'hum', 0.15, D(50)); r(L(50) + D(50) - 1.6, K + 'px-pencil-scribble.mp3', 0.3, 0.75, 0.7);
a(L(51), 'waves', 0.3, D(51)); a(L(51) + 0.5, 'motor', 0.2, D(51) - 0.5);
// 52–55: Kosnar, Taylor's mother, the planes still out there
r(L(52) + 0.5, K + 'px-paper.mp3', 0.35, 0, 0.6); a(L(52) + 1.4, 'chime', 0.25);
r(L(53) + 1.0, K + 'px-paper.mp3', 0.35, 0, 0.6); a(L(53) + D(53) * 0.5, 'thud', 0.5);
r(L(54), K + 'px-space-drone.mp3', 0.45, 0, D(54)); a(L(54) + 0.6, 'drip', 0.25); r(L(54) + 0.4, 'sfx/rumble.wav', 0.2, 0, 3);
r(L(55), K + 'px-ocean-waves.mp3', 0.25, 6, D(55) + 1); c.push({ t: +(L(55) + 0.3).toFixed(2), fx: 'bell', gain: 0.3, dur: 2.5, f: 330 });
require('fs').writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: false, cues: c }, null, 1)); console.log(c.length, 'cues');
