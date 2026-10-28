// Sound cues from the line timings: node cues.js → cues.json
// Real recordings in sfx/: the boom is a US Navy F-14 pass (public domain); px-*.mp3 are Pixabay sound effects (Pixabay Content
// License, downloaded by the channel, not committed). Short UI sounds (whoosh, pop, tick, chime) stay synthesized.
global.window = {}; eval(require('fs').readFileSync(__dirname + '/timing.js', 'utf8'));
const T = window.TIMING.lines, L = i => i >= T.length ? window.TIMING.duration : T[i].start, c = [];
const a = (t, fx, gain, dur) => c.push(Object.assign({ t: +t.toFixed(2), fx, gain }, dur ? { dur } : {}));
const rec = (t, file, gain, from, dur, hit) => c.push(Object.assign({ t: +Math.max(0, t).toFixed(2), file: 'sfx/' + file, gain, from: from || 0 }, dur ? { dur: +dur.toFixed(2) } : {}, hit ? { duck: false } : {}));
// the boom's first hit is 0.12 s into the clip
const LONG = new Set([0, 2, 19]), boomAt = (t, gain, line) => rec(t - 0.12, LONG.has(line) ? 'f14-boom-long.wav' : 'f14-boom-short.wav', gain * 1.5, 0, LONG.has(line) ? 2.0 : 0, true);   // booms are not ducked under the voice
let jo = 0; const jet = (t, gain, dur) => { rec(t, 'px-fighter-jets-overhead.mp3', gain * 2.0, 2 + (jo * 4.3) % 22, dur); jo++; };
for (let i = 1; i < T.length; i++) a(L(i) - 0.08, 'whoosh', 0.35);
rec(L(0), 'px-jet-flyby.mp3', 0.9, 1.5, 6.0); boomAt(L(0) + 2.8, 0.85, 0); a(L(0) + 4.2, 'pop', 0.6);
rec(L(1), 'px-jet-flyby.mp3', 1.1, 4.0, 1.7); a(L(1) + 0.3, 'pop', 0.6);
boomAt(L(2) + 0.02, 0.9, 2); a(L(2) + 1.4, 'zap', 0.3); a(L(2) + 1.5, 'creak', 0.35); a(L(2) + 1.8, 'pop', 0.6);
a(L(3) + 0.05, 'pop', 0.9); a(L(3) + 0.2, 'chime', 0.5);
a(L(4) + 0.1, 'wind', 0.25, 3.6); for (let k = 0; k < 6; k++) a(L(4) + 0.2 + k * 0.32, 'tick', 0.25); a(L(4) + 0.5, 'pop', 0.6); a(L(4) + 2.8, 'beep', 0.4);
jet(L(5), 0.3, 3.5); a(L(5) + 1.0, 'pop', 0.6);
jet(L(6), 0.35, 4.9); a(L(6) + 2.6, 'pop', 0.6);
a(L(7) + 0.15, 'thud', 0.6); jet(L(7), 0.4, 3.1); a(L(7) + 0.6, 'pop', 0.7);
rec(L(8), 'px-prop-plane.mp3', 0.72, 10, 5.9); a(L(8) + 0.4, 'pop', 0.6); a(L(8) + 0.8, 'creak', 0.4); a(L(8) + 2.0, 'creak', 0.35);
for (let k = 0; k < 3; k++) rec(L(8) + 0.6 + k * 1.8, 'px-beep-warning.mp3', 0.42); a(L(8) + 2.6, 'pop', 0.6);
for (let k = 0; k < 8; k++) a(L(9) + 0.1 + k * 0.17, 'tick', 0.3); a(L(9) + 1.5, 'chime', 0.45); a(L(9) + 1.6, 'pop', 0.6); a(L(9) + 3.4, 'pop', 0.6);
a(L(10) + 0.4, 'pop', 0.6); a(L(10) + 1.6, 'pop', 0.6); a(L(10) + 1.9, 'creak', 0.5); a(L(10) + 3.0, 'clank', 0.6);
rec(L(11), 'px-prop-plane.mp3', 0.72, 30, 2.1); a(L(11) + 0.3, 'pop', 0.6); a(L(11) + 1.0, 'clank', 0.6);
rec(L(11) + 1.6, 'px-rocket.mp3', 0.96, 0, 3.0); a(L(11) + 1.9, 'pop', 0.6); boomAt(L(11) + 3.1, 0.7, 11);
jet(L(12), 0.3, 4.7); a(L(12) + 0.7, 'pop', 0.6); a(L(12) + 2.3, 'pop', 0.6);
rec(L(13), 'px-afterburner.mp3', 0.66, 1.0, 3.6); a(L(13), 'wind', 0.3, 3.5); a(L(13) + 0.4, 'pop', 0.6); a(L(13) + 1.8, 'pop', 0.6);
{ const q = (L(15) - L(14)) / 4; rec(L(14), 'px-engine.mp3', 0.64, 2, 6.0); a(L(14) + 0.05, 'intake', 0.35); a(L(14) + 2 * q, 'spark', 0.3);
  for (let k = 0; k < 4; k++) a(L(14) + k * q + 0.1, 'pop', 0.6); }
rec(L(15) + 0.5, 'px-afterburner-ramp.mp3', 0.96, 5.8, 5.0); a(L(15) + 1.8, 'pop', 0.6);   // the ramp jumps 1.1 s in → lands as the flame lights
rec(L(16), 'px-afterburner.mp3', 0.77, 0, 4.2); a(L(16) + 0.2, 'pop', 0.6); a(L(16) + 1.4, 'pop', 0.6); for (let k = 0; k < 6; k++) a(L(16) + 1.6 + k * 0.6, 'drip', 0.3);
jet(L(17), 0.35, 5.2); boomAt(L(17) + 1.0, 0.7, 17); a(L(17) + 1.2, 'pop', 0.6); a(L(17) + 2.4, 'pop', 0.6);
rec(L(18), 'px-waves.mp3', 0.63, 3.5, 3.9); jet(L(18), 0.2, 3.8); a(L(18) + 0.6, 'pop', 0.6);
{ const d = L(20) - L(19), mu = Math.asin(1 / 1.6), th = (320 + 200 / Math.tan(mu) - 250) / (390 / d); jet(L(19), 0.3, d); boomAt(L(19) + th, 0.9, 19); }
jet(L(20), 0.25, 3.8); a(L(20) + 0.4, 'pop', 0.6); a(L(20) + 1.0, 'pop', 0.6); boomAt(L(20) + 1.08, 0.75, 20); boomAt(L(20) + 2.12, 0.75, 20);
jet(L(21), 0.35, 3.9); for (let k = 0; k < 6; k++) a(L(21) + 0.5 + k * 0.5, 'bump', 0.35); a(L(21) + 0.8, 'pop', 0.6);
a(L(22), 'wind', 0.2, 3.8); for (let k = 0; k < 3; k++) rec(L(22) + 0.97 + k / 0.7 - 0.27, 'px-whip.mp3', 0.98, 0, 0, true); a(L(22) + 1.4, 'pop', 0.6);
jet(L(23), 0.25, 3.1); for (let k = 0; k < 2; k++) boomAt(L(23) + k * 1.5 + 0.02, 0.45, 23); a(L(23) + 0.6, 'pop', 0.6);
a(L(24) + 0.2, 'pop', 0.7); a(L(24) + 0.3, 'notify', 0.5);
require('fs').writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: true, cues: c }, null, 1)); console.log(c.length, 'cues');
