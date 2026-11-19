// Sound cues for «جريمة بني مزار»: node cues.js → cues.json. Effects only, no music (the user's rule).
// Horror kit made in make_sfx.py (sfx/hz-*.wav): drone, crickets, heartbeats, hit, suck, riser, flicker, knock, breath, siren.
// The three real Al Arabiya 2005 clips (sfx/px-news-*.mp3) play in the gaps clips.py opened, never ducked.
// Every horror cut in film/shots.js gets its sound: smash = suck → hit; flick = a failing bulb; glitch = flicker + low hit; dip = a breath.
global.window = {}; eval(require('fs').readFileSync(__dirname + '/timing.js', 'utf8'));
const T = window.TIMING.lines, END = window.TIMING.duration, L = i => i >= T.length ? END : T[i].start, D = i => L(i + 1) - L(i), c = [];
const a = (t, fx, gain, dur, o) => c.push(Object.assign({ t: +Math.max(0, t).toFixed(2), fx, gain }, dur ? { dur: +dur.toFixed(2) } : {}, o || {}));
const r = (t, file, gain, from, dur, o) => c.push(Object.assign({ t: +Math.max(0, t).toFixed(2), file, gain, from: from || 0 }, dur ? { dur: +dur.toFixed(2) } : {}, o || {}));
// real recordings from Pixabay (the user sent them; Pixabay Content License) replace the synthesized ones by name
const PB = { scream: 'pb-scream.wav', crowd: 'pb-crowd.wav', 'crowd-agitated': 'pb-crowd-agitated.wav', dogs: 'pb-dogs.mp3', rooster: 'pb-rooster.mp3',
  steps: 'pb-steps.mp3', radio: 'pb-radio.wav', shutters: 'pb-shutter.mp3', typewriter: 'pb-typewriter.mp3', 'door-bang': 'pb-door.wav', crickets: 'pb-crickets.mp3' };
const PBDUR = { radio: 2.6, shutters: 2.4, dogs: 6, crowd: 8, 'crowd-agitated': 8, steps: 4, typewriter: 3, crickets: 20 };
const H = n => 'sfx/' + (PB[n] || 'hz-' + n + '.wav');
// the cut each shot opens with (same table as film/shots.js); a shot starts 0.25 s before its line
const TR = { 1: 'flick', 2: 'dip', 4: 'dip', 5: 'smash', 6: 'dip', 8: 'glitch', 9: 'dip', 10: 'flick', 12: 'glitch', 13: 'smash', 15: 'glitch', 14: 'dip', 16: 'flick', 19: 'flick', 20: 'smash', 21: 'dip',
  25: 'smash', 27: 'flick', 28: 'dip', 29: 'dip', 30: 'glitch', 33: 'smash', 34: 'flick', 36: 'dip', 37: 'glitch', 39: 'flick', 40: 'dip', 41: 'smash', 42: 'flick', 43: 'dip',
  45: 'glitch', 46: 'smash', 47: 'flick', 48: 'dip', 49: 'smash', 50: 'dip', 52: 'dip' };
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
r(L(13), H('heart-fast'), 0.5, 0, D(13)); a(L(13) + 0.4, 'creak', 0.4, 2.2);
c.push({ t: +(L(14) + 0.4).toFixed(2), fx: 'bell', gain: 0.3, dur: 2.5, f: 165 }); r(L(14), H('breath'), 0.35, 0, 1.6);
r(L(15), H('heart-slow'), 0.45, 0, D(15)); r(L(15) + D(15) * 0.55, H('knock'), 0.4);
r(L(16) + 0.3, '../_templates/sketch/sfx/px-paper.mp3', 0.4, 0, 0.6); r(L(16) + 1.25, H('knock'), 0.45);
for (let k = 0; k < 6; k++) a(L(17) + 0.4 + k * 0.45, 'beep', 0.08);
r(L(18) - 0.1, H('flicker'), 0.25, 1.2, 1.2);
r(L(20) + 0.3, H('siren'), 0.45); a(L(20) + 1.2, 'snip', 0.3); a(L(20) + 2.3, 'snip', 0.3); a(L(20) + 3.4, 'snip', 0.3); a(L(20), 'wind', 0.15, D(20));
// 19–22 the rumours, in smoke
a(L(21), 'wind', 0.2, D(21) + D(22) + D(23) + D(24));
[0, 0.38, 0.7].forEach(k => r(L(22) + D(22) * k, H('breath'), 0.4, 0, 1.4)); a(L(23) + 0.2, 'wipe', 0.3);
r(L(24), H('heart-slow'), 0.4, 0, D(24) + 0.4);
// 23–27 the arrest, the confession, the calm, the court
r(L(25) - 0.25, H('siren'), 0.5); a(L(25) + 1.0, 'clank', 0.35); a(L(25) + 2.0, 'thud', 0.3);
a(L(27) + 0.3, 'paper', 0.25, D(27) - 0.4); r(L(28), H('crickets'), 0.2, 6, D(28)); a(L(28) + D(28) * 0.6, 'tick', 0.3);
a(L(29), 'wind', 0.2, D(29));
// 28–30 the papers, the cliffhanger, the bio line
r(L(30), '../_templates/sketch/sfx/px-paper.mp3', 0.4, 0, 0.8); r(L(30) + 1.2, '../_templates/sketch/sfx/px-paper.mp3', 0.35, 0, 0.8);
r(L(30), H('heart-fast'), 0.45, 0, D(30) + D(31)); r(L(31) + 0.2, H('riser'), 0.4, 0, D(31) - 0.2); a(L(32) + 0.3, 'pop', 0.3);
// 31–37 the evidence falls apart
a(L(34) + D(34) * 0.6, 'ping', 0.25); a(L(35) + D(35) * 0.5, 'ping', 0.25);
r(L(36), H('heart-slow'), 0.4, 0, D(36)); r(L(37), H('heart-slow'), 0.5, 0, D(37)); a(L(37) + 0.6, 'tick', 0.25);
a(L(38) + 0.8, 'snip', 0.4); a(L(38) + 1.05, 'snip', 0.4);
r(L(39) + D(39) * 0.5, H('knock'), 0.55); r(L(39), H('heart-fast'), 0.35, 0, D(39));
// 38–42 the verdict, the appeals, the final ruling
r(L(40), H('heart-fast'), 0.55, 0, D(40) - 0.3); r(L(40) + 0.3, H('riser'), 0.5, 0, D(40) - 0.6);
r(L(41) - 0.1, H('knock'), 0.9); c.push({ t: +(L(41) + 0.5).toFixed(2), fx: 'bell', gain: 0.25, dur: 2.5, f: 220 });
r(L(42) + 0.1, H('knock'), 0.45); r(L(42) + D(42) * 0.5, H('knock'), 0.45);
a(L(43), 'wind', 0.15, D(43)); r(L(43) + D(43) * 0.5, H('knock'), 0.5); a(L(44) + 0.4, 'ping', 0.2);
// 43–47 who? nobody knows. point zero. against an unknown person
r(L(45), H('heart-slow'), 0.55, 0, D(45) + 0.2); a(L(45), 'creak', 0.5, 2.2);
r(L(48), H('breath'), 0.35, 0, 1.8); a(L(48), 'wind', 0.2, D(48));
r(L(49) + D(49) * 0.55, H('knock'), 1.0); r(L(49) + D(49) * 0.55, H('hit'), 0.5, 0, 2.5);
// 48–50 the hamlet today
r(L(50), H('crickets'), 0.3, 2, D(50) + D(51) + D(52) + 1.5); a(L(50), 'wind', 0.12, D(50) + D(51));
c.push({ t: +(L(51) + 0.6).toFixed(2), fx: 'bell', gain: 0.3, dur: 2.5, f: 220 }); c.push({ t: +(L(52) + 0.2).toFixed(2), fx: 'bell', gain: 0.2, dur: 2.5, f: 330 });
// ── people and place, so every moment is heard (the user's ask): dogs, a rooster, a scream, running, the crowd,
//    women keening, cameras, police radio, the typewriter, the court. All synthesized in make_sfx.py; real recordings,
//    when the user sends them, replace the same names.
r(L(2) + 1.2, H('dogs'), 0.22, 0, 6); r(L(7) + 1.0, H('steps'), 0.35, 0, D(7) - 1.5); r(L(7) + 3.5, H('dogs'), 0.18, 3, 4);
r(L(10) - 0.7, H('rooster'), 0.35); r(L(10) + 0.5, H('scream'), 0.5); r(L(10) + 0.9, H('run'), 0.4);
r(L(11), H('crowd-agitated'), 0.5, 0, D(11) + D(12)); r(L(11) + 0.6, H('wail'), 0.45, 0, D(11) + D(12));
r(L(13), H('wail'), 0.2, 2, 5); r(L(16) + 0.4, H('shutters'), 0.3); r(L(16) + 2.6, H('shutters'), 0.25, 1.2, 1.2);
r(L(17), H('crowd'), 0.25, 0, D(17));
r(L(20), H('crowd-agitated'), 0.45, 0, D(20)); r(L(20) + 0.4, H('radio'), 0.4); r(L(20) + 1.2, H('shutters'), 0.4); r(L(20) + 0.2, H('steps'), 0.3, 0, D(20));
r(L(25) + 0.6, H('radio'), 0.45); r(L(25) + 1.8, H('door-bang'), 0.5); r(L(25) + 0.2, H('crowd'), 0.3, 3, D(25) + D(26)); r(L(25) + 2.4, H('steps'), 0.35, 0, 3);
r(L(27) + 0.2, H('typewriter'), 0.4, 0, D(27));
r(L(29), H('crowd'), 0.25, 6, D(29)); r(L(29) + 0.3, H('steps'), 0.3, 0, D(29));
[30, 31, 33, 34, 35, 37, 38, 39, 40].forEach(k => r(L(k), H('court-murmur'), 0.18, (k * 1.3) % 6, D(k)));
r(L(41) + 0.45, H('crowd-agitated'), 0.5, 2, 3.2); r(L(42), H('wail'), 0.35, 0, D(42) + 1);
r(L(43), H('steps'), 0.25, 0, 3); r(L(43), H('court-murmur'), 0.15, 2, D(43));
r(L(50) + 1.0, H('dogs'), 0.15, 0, 5);
const out = c.filter(q => !(q.fx === 'knock'));
out.forEach(q => { if (!q.file) return; const k = Object.keys(PB).find(n => q.file === 'sfx/' + PB[n]); if (k && !q.dur && PBDUR[k]) q.dur = PBDUR[k]; });
require('fs').writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: false, cues: out }, null, 1)); console.log(out.length, 'cues');
