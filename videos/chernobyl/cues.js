// Sound cues for «تشيرنوبل»: node cues.js → cues.json. Effects only, no music (the user's rule).
// Synthesized here: sfx/geiger.wav (clicks rising), sfx/alarm.wav (two-tone klaxon), sfx/static.wav; phone ring and siren
// from earlier episodes; the rest are audio/sfx.py voices and the series kit clips.
global.window = {}; eval(require('fs').readFileSync(__dirname + '/timing.js', 'utf8'));
const T = window.TIMING.lines, END = window.TIMING.duration, L = i => i >= T.length ? END : T[i].start, D = i => L(i + 1) - L(i), c = [];
const a = (t, fx, gain, dur, o) => c.push(Object.assign({ t: +t.toFixed(2), fx, gain }, dur ? { dur: +dur.toFixed(2) } : {}, o || {}));
const r = (t, file, gain, from, dur) => c.push({ t: +t.toFixed(2), file, gain, from: from || 0, dur: +dur.toFixed(2) });
const K = '../_templates/sketch/sfx/';
for (let i = 1; i < T.length; i++) a(L(i) - 0.1, 'whoosh', 0.07);
// night, the city, the plant's hum
a(0.1, 'wind', 0.14, L(3)); a(L(2), 'hum', 0.25, D(2));
r(L(3), K + 'px-clock-ticking.mp3', 0.5, 0, D(3)); a(L(4) + D(4) * .58, 'clank', 0.5); r(L(4) + D(4) * .62, K + 'px-space-drone.mp3', 0.4, 0, D(4) * .4 + D(5));
a(L(6) + 0.5, 'boom', 0.3); a(L(7), 'wind', 0.12, D(7)); for (let k = 0; k < 4; k++) a(L(8) + 0.3 + k * 0.5, 'tick', 0.35);
// 25 April: the plant by day, the test, the turbine and pumps
a(L(9), 'hum', 0.2, D(9) + D(10) + D(11)); a(L(10) + 0.5, 'spool', 0.3); a(L(10) + 1.5, 'motor', 0.25, D(10) - 1.5);
r(L(12) + 0.3, 'sfx/phone.wav', 0.45, 0, 3.6); for (let k = 0; k < 6; k++) a(L(13) + 0.3 + k * 0.5, 'tick', 0.3);
a(L(14), 'hum', 0.3, D(14) + D(15)); a(L(15) + 0.5, 'beep', 0.35); a(L(15) + 1.6, 'beep', 0.35);
a(L(16), 'hum', 0.3, D(16)); a(L(17), 'servo', 0.45); a(L(17) + 0.8, 'servo', 0.45); a(L(17) + 1.6, 'servo', 0.45); a(L(18), 'hum', 0.3, D(18));
a(L(20) + 0.6, 'thud', 0.35); r(L(21), K + 'px-clock-ticking.mp3', 0.45, 0, D(21));
a(L(22), 'motor', 0.4, D(22)); a(L(22) + 0.3, 'spool', 0.3); a(L(23), 'fill', 0.35, D(23)); a(L(23) + 0.6, 'slosh', 0.3); a(L(24), 'hum', 0.4, D(24)); a(L(24) + 1.2, 'beep', 0.4);
// AZ-5, the surge, the explosions
r(L(25), K + 'px-space-drone.mp3', 0.5, 0, D(25) + D(26) + D(27) + D(28) + D(29)); a(L(25) + 1.8, 'clank', 0.6);
for (let k = 0; k < 4; k++) a(L(26) + 0.2 + k * 0.5, 'servo', 0.5); a(L(27) + 0.6, 'creak', 0.45, 2);
a(L(28), 'hum', 0.5, D(28)); a(L(28) + 1.0, 'zap', 0.5); r(L(29), 'sfx/alarm.wav', 0.45, 0, Math.min(4, D(29))); a(L(29), 'rev', 0.4, D(29));
a(L(30) + 0.2, 'boom', 1.0); a(L(30) + 0.25, 'thud', 0.9); r(L(30) + 0.5, K + 'px-wind-gust.mp3', 0.6, 0, D(30) + 0.6);
a(L(31) + 0.2, 'boom', 1.0); a(L(31) + 0.3, 'thud', 0.9); for (let k = 0; k < 8; k++) a(L(31) + 0.8 + k * 0.25, 'clank', 0.25);
a(L(32), 'creak', 0.6, 2.2); a(L(32) + D(32) - 1.0, 'thud', 0.6); a(L(33), 'sizzle', 0.4, D(33) + D(34)); a(L(33), 'wind', 0.3, D(33) + D(34)); a(L(34), 'hum', 0.3, D(34));
a(L(35), 'wind', 0.15, D(35) + D(36));
// the firemen
r(L(37), 'sfx/siren.wav', 0.5, 0, Math.min(6, D(37))); a(L(37), 'motor', 0.3, D(37));
a(L(38), 'sizzle', 0.55, D(38) + D(39)); a(L(38), 'spray', 0.35, D(38)); a(L(38), 'wind', 0.3, D(38) + D(39));
r(L(40), 'sfx/geiger.wav', 0.5, 0, Math.min(6, D(40) + 0.3)); a(L(41), 'wind', 0.2, D(41)); a(L(41), 'sizzle', 0.2, D(41));
// Pripyat's ordinary morning, the evacuation
a(L(42), 'wind', 0.12, D(42) + D(43) + D(44)); a(L(43) + 0.4, 'chime', 0.25); a(L(43) + 1.6, 'bell', 0.25, null, { f: 784 });
r(L(45), 'sfx/static.wav', 0.35, 0, 1.2); r(L(45) + D(45) - 1.2, 'sfx/static.wav', 0.3, 1, 1.0);
a(L(46), 'idle', 0.45, D(46)); a(L(46), 'motor', 0.25, D(46)); a(L(47), 'wind', 0.1, D(47)); a(L(47) + 0.8, 'tick', 0.25); a(L(47) + 2.4, 'creak', 0.2);
// the world finds out
a(L(48), 'hum', 0.2, D(48)); r(L(49) + 0.8, 'sfx/alarm.wav', 0.4, 0, Math.min(3.5, D(49) - 0.8)); r(L(50) + 0.3, 'sfx/geiger.wav', 0.45, 1, Math.min(4, D(50)));
r(L(51) + 0.2, 'sfx/static.wav', 0.3, 0, 0.8); a(L(51) + 0.8, 'hum', 0.15, D(51) - 0.8);
a(L(52) + D(52) * .4, 'clank', 0.6); a(L(52) + D(52) * .4 + 0.05, 'thud', 0.4);
a(L(53), 'rotor', 0.45, D(53)); a(L(53) + 1.5, 'fill', 0.25, 2); a(L(54), 'wind', 0.25, D(54) + D(55)); a(L(54) + 1.0, 'clank', 0.3);
a(L(55) + 0.6, 'creak', 0.3, 2.4); a(L(56), 'wind', 0.2, D(56) + D(57)); a(L(57) + 1.0, 'thud', 0.15); a(L(57) + 1.4, 'thud', 0.15); a(L(57) + 1.8, 'thud', 0.15);
a(L(58) + 0.5, 'clank', 0.35); a(L(58) + 1.6, 'gear', 0.3); a(L(59), 'wind', 0.12, D(59)); c.push({ t: +(L(60) + 0.3).toFixed(2), fx: 'bell', gain: 0.3, dur: 2.5, f: 330 });
require('fs').writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: false, cues: c }, null, 1)); console.log(c.length, 'cues');
