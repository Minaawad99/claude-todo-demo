// Sound cues for «جريمة بني مزار»: node cues.js → cues.json. Effects only, no music (the user's rule).
// Horror kit made in make_sfx.py (sfx/hz-*.wav): drone, crickets, heartbeats, hit, suck, riser, flicker, knock, breath, siren.
// The three real Al Arabiya 2005 clips (sfx/px-news-*.mp3) play in the gaps clips.py opened, never ducked.
// Every horror cut in film/shots.js gets its sound: smash = suck → hit; flick = a failing bulb; glitch = flicker + low hit; dip = a breath.
global.window = {}; eval(require('fs').readFileSync(__dirname + '/timing.js', 'utf8'));
const T = window.TIMING.lines, END = window.TIMING.duration, L = i => i >= T.length ? END : T[i].start, D = i => L(i + 1) - L(i), c = [];
const a = (t, fx, gain, dur, o) => c.push(Object.assign({ t: +Math.max(0, t).toFixed(2), fx, gain }, dur ? { dur: +dur.toFixed(2) } : {}, o || {}));
const r = (t, file, gain, from, dur, o) => c.push(Object.assign({ t: +Math.max(0, t).toFixed(2), file, gain, from: from || 0 }, dur ? { dur: +dur.toFixed(2) } : {}, o || {}));
const H = n => 'sfx/hz-' + n + '.wav';
// the cut each shot opens with (same table as film/shots.js); a shot starts 0.25 s before its line
const TR = { 1: 'flick', 2: 'dip', 4: 'dip', 5: 'smash', 6: 'dip', 8: 'glitch', 9: 'dip', 10: 'flick', 12: 'glitch', 13: 'dip', 14: 'flick', 17: 'flick', 18: 'smash', 19: 'dip',
  23: 'smash', 25: 'flick', 26: 'dip', 27: 'dip', 28: 'glitch', 31: 'smash', 32: 'flick', 34: 'dip', 35: 'glitch', 37: 'flick', 38: 'dip', 39: 'smash', 40: 'flick', 41: 'dip',
  43: 'glitch', 44: 'smash', 45: 'flick', 46: 'dip', 47: 'smash', 48: 'dip', 50: 'dip' };
Object.keys(TR).forEach(k => { const t = L(+k) - 0.25, kind = TR[k];
  if (kind === 'smash') { r(t - 1.55, H('suck'), 0.5); r(t, H('hit'), 0.9, 0, null, { duck: 0.3 }); }
  if (kind === 'flick') r(t, H('flicker'), 0.35, 0, 0.9);
  if (kind === 'glitch') { r(t, H('flicker'), 0.4, 0.35, 0.5); r(t, H('hit'), 0.35, 0, 1.6); }
  if (kind === 'dip') r(t - 0.1, H('breath'), 0.25, 0, 1.6); });
// the low drone runs under the whole story in long pieces, and drops out to silence right before each smash
const SM = Object.keys(TR).filter(k => TR[k] === 'smash').map(k => L(+k) - 0.25);
let s = 0.0; SM.concat([END]).forEach(e => { const end = e - 1.7; for (let x = s; x < end - 0.5; x += 22) r(x, H('drone'), 0.32, 0, Math.min(22, end - x), { duck: 0.4 }); s = e + 0.4; });
// the real clips, each over a very low drone
window.TIMING.clips.forEach(q => r(q.t, 'sfx/px-' + q.file + '.mp3', 1.0, 0, null, { duck: false }));
// 0–9 night in the hamlet: crickets, wind, the bulb
r(0, H('crickets'), 0.35, 0, Math.min(20, L(5) - 0.4)); a(0.1, 'wind', 0.12, L(5) - 0.3);
r(L(3) + 0.3, H('breath'), 0.4); a(L(3) + D(3) * 0.4, 'snip', 0.15); a(L(3) + D(3) * 0.6, 'snip', 0.15); a(L(3) + D(3) * 0.8, 'snip', 0.15);
a(L(4) + 0.6, 'tick', 0.3); a(L(4) + 1.1, 'tick', 0.3); a(L(4) + 1.6, 'tick', 0.3);
r(L(5) + 0.2, H('riser'), 0.45, 0, D(5) * 0.55 - 0.2); r(L(5) + D(5) * 0.55, H('hit'), 1.0, 0, null, { duck: 0.3 });   // the lights die on «عشرة»
c.push({ t: +(L(6) + 0.5).toFixed(2), fx: 'bell', gain: 0.25, dur: 2.5, f: 220 });
r(L(7), H('heart-slow'), 0.55, 0, D(7) + D(8)); a(L(7) + 0.4, 'creak', 0.45, 2.6); a(L(7) + D(7) * 0.55, 'wind', 0.2, 2);
a(L(8) + D(8) * 0.45, 'knock', 0.0); r(L(8) + D(8) * 0.45, H('knock'), 0.5);
r(L(9), H('crickets'), 0.25, 3, D(9));
// 10–18 dawn, the doors, the room, the report, the news
a(L(10), 'wind', 0.2, D(10) + D(11)); r(L(11) + 0.5, H('breath'), 0.3);
a(L(12) + 0.2, 'creak', 0.35, 2.4); r(L(12) + 0.2, H('heart-slow'), 0.45, 0, D(12));
c.push({ t: +(L(13) + 0.6).toFixed(2), fx: 'bell', gain: 0.3, dur: 2.5, f: 220 }); c.push({ t: +(L(13) + 3.0).toFixed(2), fx: 'bell', gain: 0.2, dur: 2.5, f: 165 });
r(L(14) + 0.3, '../_templates/sketch/sfx/px-paper.mp3', 0.4, 0, 0.6); r(L(14) + 1.25, H('knock'), 0.45);
for (let k = 0; k < 6; k++) a(L(15) + 0.4 + k * 0.45, 'beep', 0.08);
r(L(16) - 0.1, H('flicker'), 0.25, 1.2, 1.2);
r(L(18) + 0.3, H('siren'), 0.45); a(L(18) + 1.2, 'snip', 0.3); a(L(18) + 2.3, 'snip', 0.3); a(L(18) + 3.4, 'snip', 0.3); a(L(18), 'wind', 0.15, D(18));
// 19–22 the rumours, in smoke
a(L(19), 'wind', 0.2, D(19) + D(20) + D(21) + D(22));
[0, 0.38, 0.7].forEach(k => r(L(20) + D(20) * k, H('breath'), 0.4, 0, 1.4)); a(L(21) + 0.2, 'wipe', 0.3);
r(L(22), H('heart-slow'), 0.4, 0, D(22) + 0.4);
// 23–27 the arrest, the confession, the calm, the court
r(L(23) - 0.25, H('siren'), 0.5); a(L(23) + 1.0, 'clank', 0.35); a(L(23) + 2.0, 'thud', 0.3);
a(L(25) + 0.3, 'paper', 0.25, D(25) - 0.4); r(L(26), H('crickets'), 0.2, 6, D(26)); a(L(26) + D(26) * 0.6, 'tick', 0.3);
a(L(27), 'wind', 0.2, D(27));
// 28–30 the papers, the cliffhanger, the bio line
r(L(28), '../_templates/sketch/sfx/px-paper.mp3', 0.4, 0, 0.8); r(L(28) + 1.2, '../_templates/sketch/sfx/px-paper.mp3', 0.35, 0, 0.8);
r(L(28), H('heart-fast'), 0.45, 0, D(28) + D(29)); r(L(29) + 0.2, H('riser'), 0.4, 0, D(29) - 0.2); a(L(30) + 0.3, 'pop', 0.3);
// 31–37 the evidence falls apart
a(L(32) + D(32) * 0.6, 'ping', 0.25); a(L(33) + D(33) * 0.5, 'ping', 0.25);
r(L(34), H('heart-slow'), 0.4, 0, D(34)); r(L(35), H('heart-slow'), 0.5, 0, D(35)); a(L(35) + 0.6, 'tick', 0.25);
a(L(36) + 0.8, 'snip', 0.4); a(L(36) + 1.05, 'snip', 0.4);
r(L(37) + D(37) * 0.5, H('knock'), 0.55); r(L(37), H('heart-fast'), 0.35, 0, D(37));
// 38–42 the verdict, the appeals, the final ruling
r(L(38), H('heart-fast'), 0.55, 0, D(38) - 0.3); r(L(38) + 0.3, H('riser'), 0.5, 0, D(38) - 0.6);
r(L(39) - 0.1, H('knock'), 0.9); c.push({ t: +(L(39) + 0.5).toFixed(2), fx: 'bell', gain: 0.25, dur: 2.5, f: 220 });
r(L(40) + 0.1, H('knock'), 0.45); r(L(40) + D(40) * 0.5, H('knock'), 0.45);
a(L(41), 'wind', 0.15, D(41)); r(L(41) + D(41) * 0.5, H('knock'), 0.5); a(L(42) + 0.4, 'ping', 0.2);
// 43–47 who? nobody knows. point zero. against an unknown person
r(L(43), H('heart-slow'), 0.55, 0, D(43) + 0.2); a(L(43), 'creak', 0.5, 2.2);
r(L(46), H('breath'), 0.35, 0, 1.8); a(L(46), 'wind', 0.2, D(46));
r(L(47) + D(47) * 0.55, H('knock'), 1.0); r(L(47) + D(47) * 0.55, H('hit'), 0.5, 0, 2.5);
// 48–50 the hamlet today
r(L(48), H('crickets'), 0.3, 2, D(48) + D(49) + D(50) + 1.5); a(L(48), 'wind', 0.12, D(48) + D(49));
c.push({ t: +(L(49) + 0.6).toFixed(2), fx: 'bell', gain: 0.3, dur: 2.5, f: 220 }); c.push({ t: +(L(50) + 0.2).toFixed(2), fx: 'bell', gain: 0.2, dur: 2.5, f: 330 });
const out = c.filter(q => !(q.fx === 'knock'));
require('fs').writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: false, cues: out }, null, 1)); console.log(out.length, 'cues');
