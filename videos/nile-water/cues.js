// Sound cues from the line timings: node cues.js → cues.json (synthesized effects only: no recorded clips for this episode)
global.window = {}; eval(require('fs').readFileSync(__dirname + '/timing.js', 'utf8'));
const fs = require('fs');
const T = window.TIMING.lines, L = i => i >= T.length ? window.TIMING.duration : T[i].start, D = i => L(i + 1) - L(i), c = [];
const a = (t, fx, gain, dur) => c.push(Object.assign({ t: +t.toFixed(2), fx, gain }, dur ? { dur } : {}));
for (let i = 1; i < T.length; i++) a(L(i) - 0.08, 'whoosh', 0.3);
// 0: the tap at home, the water runs
a(L(0) + 0.3, 'fill', 0.35, 2.4); a(L(0) + 2.6, 'pop', 0.5);
// 1: the river far away
a(L(1) + 0.4, 'waves', 0.35, 2.4); a(L(1) + 1.0, 'pop', 0.5);
// 2: muddy vs clear
a(L(2) + 0.2, 'slosh', 0.3, 1.2); a(L(2) + 1.2, 'ping', 0.45);
// 3: the question
a(L(3) + 0.05, 'pop', 0.9); a(L(3) + 0.2, 'chime', 0.5);
// 4: the river is very long
for (let k = 0; k < 5; k++) a(L(4) + 0.3 + k * 0.4, 'tick', 0.3); a(L(4) + 2.2, 'chime', 0.4);
// 5: two sources
a(L(5) + 0.3, 'waves', 0.3, 2.5); a(L(5) + 2.0, 'ping', 0.4);
// 6–7: the gauge goes up
a(L(6) + 0.2, 'slosh', 0.3, 1.4); a(L(6) + 1.0, 'ping', 0.45); a(L(7) + 0.2, 'waves', 0.4, 2.6); a(L(7) + 1.0, 'ping', 0.45);
// 8: mud and microbes
a(L(8) + 0.4, 'drip', 0.4); a(L(8) + 1.8, 'pop', 0.5);
// 9: the intake screen
a(L(9) + 0.3, 'clank', 0.4); a(L(9) + 1.4, 'thud', 0.3);
// 10: alum poured in
a(L(10) + 0.2, 'spray', 0.35, 2.4); a(L(10) + 2.4, 'ping', 0.4);
// 11: sedimentation
a(L(11) + 0.2, 'slosh', 0.35, 2.2); a(L(11) + 2.4, 'pop', 0.4);
// 12: the sand filter
a(L(12) + 0.3, 'waves', 0.35, 2.4);
// 13: algae
a(L(13) + 0.3, 'drip', 0.4); a(L(13) + 1.2, 'drip', 0.35);
// 14: chlorine kills the microbes
a(L(14) + 0.1, 'drop', 0.4); a(L(14) + 1.8, 'zap', 0.4); a(L(14) + 2.2, 'spark', 0.3);
// 15: chlorine stays in the pipe
a(L(15) + 0.3, 'hum', 0.25, 2.2);
// 16: the underground tank
a(L(16) + 0.2, 'idle', 0.25, 2.2);
// 17: big pumps
a(L(17) + 0.2, 'motor', 0.35, 3.0);
// 18: the long pipe
a(L(18) + 0.4, 'whoosh', 0.3); a(L(18) + 1.8, 'pop', 0.4);
// 19: booster pumps
a(L(19) + 0.2, 'motor', 0.3, 2.2);
// 20: at home
a(L(20) + 0.2, 'fill', 0.35, 2.4); a(L(20) + 2.6, 'pop', 0.5);
// 21: the lab check
a(L(21) + 1.7, 'ping', 0.45); a(L(21) + 2.1, 'chime', 0.4);
// 22: clean water
a(L(22) + 0.2, 'chime', 0.5); a(L(22) + 0.4, 'fill', 0.3, 2);
// 23: the payoff
a(L(23) + 0.05, 'notify', 0.5); a(L(23) + 0.9, 'chime', 0.4);
// 24: the call to action
a(L(24) + 0.05, 'pop', 0.9); a(L(24) + 0.2, 'chime', 0.5);
fs.writeFileSync(__dirname + '/cues.json', JSON.stringify({ cues: c, duration: window.TIMING.duration }, null, 1));
console.log('cues', c.length);
