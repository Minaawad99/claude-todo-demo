// Sound cues for «ليه بنحتاج ننام؟» (both versions share the voice and the timing): node cues.js → cues.json
// Softer than the cartoon videos: paper-like whooshes, clock ticks, a low hum, fluid for the washing, few big hits.
global.window = {}; eval(require('fs').readFileSync(__dirname + '/timing.js', 'utf8'));
const T = window.TIMING.lines, L = i => i >= T.length ? window.TIMING.duration : T[i].start, c = [];
const a = (t, fx, gain, dur) => c.push(Object.assign({ t: +t.toFixed(2), fx, gain }, dur ? { dur } : {}));
for (let i = 1; i < T.length; i++) a(L(i) - 0.08, i % 2 ? 'wipe' : 'whoosh', 0.22);
for (let k = 0; k < 12; k++) a(0.4 + k * 0.5, 'tick', 0.16);                                     // the clock at night
a(0.3, 'hum', 0.16, L(3) - 0.5); a(2.6, 'pop', 0.4);
a(L(1) + 0.3, 'pop', 0.45); a(L(1) + 0.7, 'ping', 0.3);
a(L(2) + 0.4, 'pop', 0.4); a(L(2) + 0.9, 'chime', 0.3);
a(L(3) + 0.3, 'pop', 0.45); a(L(3) + 0.8, 'pop', 0.4); a(L(3) + 1.3, 'pop', 0.4); a(L(3) + 1.6, 'chime', 0.35);
a(L(4), 'idle', 0.14, L(5) - L(4)); for (let k = 0; k < 6; k++) a(L(4) + 0.8 + k * 0.45, 'plunk', 0.22); a(L(4) + 1.7, 'pop', 0.4);
a(L(5), 'hum', 0.18, L(6) - L(5)); for (let k = 0; k < 8; k++) a(L(5) + 0.4 + k * 0.42, 'tick', 0.18); a(L(5) + 0.4, 'pop', 0.4); a(L(5) + 2.1, 'pop', 0.4);
a(L(6) + 0.3, 'drop', 0.3); a(L(6) + 1.0, 'pop', 0.45); a(L(6) + 2.3, 'zap', 0.16);
a(L(7) + 0.4, 'chime', 0.3); a(L(7) + 0.8, 'creak', 0.18); a(L(7) + 2.7, 'ping', 0.38); a(L(7) + 3.5, 'pop', 0.35);
a(L(8), 'waves', 0.22, L(9) - L(8)); a(L(8) + 0.4, 'slosh', 0.3); a(L(8) + 0.6, 'fill', 0.16, 3.2); a(L(8) + 2.5, 'pop', 0.4);
a(L(9), 'fill', 0.14, L(10) - L(9)); a(L(9) + 0.5, 'pop', 0.4); a(L(9) + 1.3, 'pop', 0.35); a(L(9) + 2.1, 'ping', 0.38);
a(L(10) + 0.2, 'servo', 0.2); a(L(10) + 1.5, 'tick', 0.3); a(L(10) + 2.1, 'ping', 0.38);
a(L(11), 'paper', 0.25, 1.2); for (let k = 0; k < 5; k++) a(L(11) + 0.3 + k * 0.5, 'tick', 0.16); a(L(11) + 0.6, 'pop', 0.4);
a(L(12) + 0.3, 'pop', 0.4); a(L(12) + 0.8, 'paper', 0.22, 1.0); a(L(12) + 2.5, 'pop', 0.4); a(L(12) + 2.6, 'chime', 0.28);
a(L(13), 'hum', 0.16, L(14) - L(13)); for (let k = 0; k < 8; k++) a(L(13) + 0.1 + k * 0.22, 'tick', 0.18); a(L(13) + 1.8, 'ping', 0.35);
a(L(14) + 0.2, 'pop', 0.4); a(L(14) + 1.0, 'pop', 0.4); a(L(14) + 2.0, 'pop', 0.45);
a(L(15) + 0.3, 'chime', 0.3); a(L(15) + 1.3, 'clink', 0.3); a(L(15) + 1.6, 'clink', 0.3); a(L(15) + 2.7, 'pop', 0.35);
a(L(16) + 0.3, 'pop', 0.35); a(L(16) + 1.25, 'thud', 0.35);
a(L(17), 'hum', 0.16, L(18) - L(17)); a(L(17) + 0.7, 'servo', 0.2); a(L(17) + 1.2, 'pop', 0.35);
for (let k = 0; k < 20; k++) a(L(18) + 0.3 + k * 0.24, 'tick', 0.2); a(L(18) + 0.3, 'paper', 0.2, 4.0); a(L(18) + 2.6, 'pop', 0.4);
a(L(19), 'hum', 0.14, L(20) - L(19)); a(L(19) + 0.4, 'pop', 0.4); a(L(19) + 1.7, 'zap', 0.14); a(L(19) + 2.1, 'pop', 0.35);
a(L(20) + 0.4, 'pop', 0.35); a(L(20) + 1.1, 'pop', 0.35); for (let k = 0; k < 6; k++) a(L(20) + 0.3 + k * 0.5, 'tick', 0.14); a(L(20) + 2.3, 'ping', 0.35);
a(L(21) + 0.2, 'pop', 0.45); a(L(21) + 0.5, 'chime', 0.4); a(L(21) + 1.2, 'notify', 0.3);
require('fs').writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: true, cues: c }, null, 1)); console.log(c.length, 'cues');
