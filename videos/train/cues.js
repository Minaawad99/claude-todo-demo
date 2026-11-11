// «اسكتش» starter sound cues: copy to videos/<episode>/cues.js, fill in the per-line section, then
//   node cues.js && python3 ../audio/sfx.py voice.wav cues.json <scratchpad>/<episode>-mix.wav
// The kit (Pixabay clips the channel sent for «المد والجزر») is committed in videos/_templates/sketch/sfx/ and found from there;
// a one-off clip for one episode goes in <episode>/sfx/ (gitignored) and wins over the kit. The slices below are
// the clean parts measured with silencedetect. A missing clip falls back to its synthesized stand-in from audio/sfx.py.
//   swipe           «Paper Flipping» (koiroylers 351981)            one page flip 0.60–1.02 s   → every shot change
//   paper           «Paper Slide Short» (oxidvideos 478835)         0–0.5 s                     → a card or note laid down
//   pencil-scribble «Pencil on Paper Scribble 2» (68772)            0.75–1.5 s                  → ✗ and ✓ being written
//   ding            «Minimal Ding SFX» (virtual_vibes 383725)       0.1–1.5 s                   → a key number lands
//   clock-ticking   «Clock Ticking Down» (Dragon Studio 376897)     up to 8.6 s                 → time, clocks
//   space-drone     «Industrial Pulse Drone» (27456)                0.3–29.9 s, very low        → globes, space
//   ocean-waves     «Ocean Waves» (Dragon Studio 376898)            0.2–22 s                    → sea, beach
//   water-rush      «Above Rushing Water» (61158)                   from 3 s                    → water moving
//   wind-gust       «Wind Gust» (Dragon Studio 386158)              0.25–4.76 s                 → wind
//   music-soft      «Mysterious Music Box – The Midnight Hour»      the series' music (the user's pick): make it with
//                   ffmpeg -i px-music-box.mp3 -af "highshelf=f=3000:g=-5,volume='if(lt(t,12),0.6+0.4*t/12,1)':eval=frame" px-music-soft.mp3
//                   and keep gain 0.42 (≈22 dB under the narrator while he speaks; the user approved this level)
const fs = require('fs');
global.window = {}; eval(fs.readFileSync(__dirname + '/timing.js', 'utf8'));
const T = window.TIMING.lines, L = i => i >= T.length ? window.TIMING.duration : T[i].start, D = i => L(i + 1) - L(i), c = [];
// a clip lives in the episode's sfx/ (gitignored, one-off sounds) or in the shared «اسكتش» kit (committed)
const KIT = '../_templates/sketch/sfx/', where = n => fs.existsSync(__dirname + '/sfx/px-' + n + '.mp3') ? 'sfx/px-' + n + '.mp3' : fs.existsSync(__dirname + '/' + KIT + 'px-' + n + '.mp3') ? KIT + 'px-' + n + '.mp3' : null;
const has = n => !!where(n);
const a = (t, fx, gain, dur) => c.push(Object.assign({ t: +Math.max(0, t).toFixed(2), fx, gain }, dur ? { dur: +dur.toFixed(2) } : {}));
const rec = (t, file, gain, from, dur, duck, alt, altGain) => has(file)
  ? c.push(Object.assign({ t: +Math.max(0, t).toFixed(2), file: where(file), gain: +gain.toFixed(2), from: from || 0 }, dur ? { dur: +dur.toFixed(2) } : {}, duck != null ? { duck } : {}))
  : alt && a(t, alt, altGain == null ? gain : altGain, dur);
// the kit as one-liners
const lab = (i, dt) => a(L(i) + dt, 'tick', 0.2);                                                      // a label draws in
const swipe = i => rec(L(i) - 0.08, 'swipe', 0.3, 0.6, 0.42, 1.0, 'whoosh', 0.2);                      // shot change
const paper = t => rec(t, 'paper', 0.4, 0, 0.5, 1.0, 'paper', 0.3);
const scribble = t => rec(t, 'pencil-scribble', 0.45, 0.75, 0.7, 1.0, 'snip', 0.35);                  // ✗ / ✓
const ding = t => rec(t, 'ding', 0.3, 0.1, 1.4, 1.0, 'chime', 0.3);                                     // a number lands
const sea = (t, dur, g) => rec(t, 'ocean-waves', g || 0.35, 0.2, dur, 1.0, 'waves', 0.25);
const drone = (t, dur, from) => rec(t, 'space-drone', 0.12, from || 0.3, Math.min(29, dur), 1.2, 'hum', 0.1);

// ── fixed parts of every «اسكتش» episode (phase lines as build.py prints them) ──
const PROMISE = T.findIndex(l => l.text.includes('إيه الحكاية') && l.text.includes('هشرح'));
const SUMMARY = T.findIndex(l => l.text.startsWith('ودي كانت')), ASK = T.length - 1;
a(L(0) + 0.1, 'chime', 0.3);                                                                            // the hook card opens
a(L(PROMISE) + 0.15, 'ping', 0.3); for (let k = 0; k < 5; k++) a(L(PROMISE) + 0.4 + k * 0.32, 'tick', 0.14);   // bumper: the stopwatch
for (let i = PROMISE + 1; i < SUMMARY; i++) swipe(i);                                                   // one flip per shot change
a(L(SUMMARY) + 0.1, 'chime', 0.35); for (let k = 0; k < 5; k++) a(L(SUMMARY) + 0.3 + k * 0.15, 'tick', 0.16);   // summary card builds
paper(L(ASK) + 0.1); a(L(ASK) + 0.3, 'pop', 0.4);                                                       // ask box

// ── this episode: one or two sounds per line, matched to what moves (see videos/tides/cues.js) ──
// train clips the kit doesn't have (put them in train/sfx/ if the channel sends them; until then the stand-ins play):
//   px-train-pass (train passing / clickety-clack), px-diesel-idle (diesel locomotive idle), px-air-brake (air brake hiss)
const rumble = (t, dur, g) => rec(t, 'diesel-idle', g || 0.25, 0.5, dur, 1.0, 'idle', g || 0.18);
const rails = (t, dur, g) => rec(t, 'train-pass', g || 0.25, 0.5, dur, 1.0, 'motor', g || 0.12);
const hiss = (t, dur, g) => rec(t, 'air-brake', g || 0.35, 0, dur || 1.2, 1.0, 'steam', g || 0.22);
// 0–2 · the train comes in, rolls, then brakes to a stop
rails(L(0), L(2) + 1.2 - L(0), 0.2); rumble(L(0), L(3) - L(0), 0.12);
a(L(1) + 0.5, 'pop', 0.3); a(L(1) + 1.1, 'tick', 0.2);
a(L(2) + 0.1, 'creak', 0.18, 1.4); hiss(L(2) + 1.3, 1.0, 0.18); scribble(L(2) + 0.9);
// 4 · the loco; the hood opens on the diesel
rumble(L(4), D(4) + 0.2, 0.16); lab(4, 0.5); paper(L(4) + 1.5); lab(4, 2.0);
// 5 · ✗ to the wheel, the generator spins, electricity
scribble(L(5) + 1.0); a(L(5) + 1.9, 'charge', 0.18); a(L(5) + 2.4, 'hum', 0.1, 1.6); lab(5, 2.3);
// 6 · current runs to six motors
a(L(6) + 0.2, 'charge', 0.15); for (let k = 0; k < 6; k++) a(L(6) + 1.3 + k * 0.15, 'tick', 0.18); a(L(6) + D(6) - 1.2, 'motor', 0.1, 1.2);
// 7 · «؟» then the pull curve
a(L(7) + 0.3, 'pop', 0.3); a(L(7) + 0.5, 'pop', 0.3); a(L(7) + 0.7, 'pop', 0.3); ding(L(7) + 3.4);
// 8–9 · wheel on rail, the weight, 100 tonnes
a(L(8) + 0.3, 'clink', 0.15); lab(8, 0.4); lab(8, 0.8); a(L(9) + 0.5, 'thud', 0.35); ding(L(9) + 2.0);
// 10 · wet rail, sand pours; the tyre thumbnail
a(L(10) + 0.2, 'drip', 0.2); a(L(10) + 1.6, 'toner', 0.25, 1.6); paper(L(10) + 3.4);
// 11 · the resistance bars, ×5
a(L(11) + 0.6, 'whoosh', 0.12); ding(L(11) + 1.7);
// 12–15 · the whole train, the coupler, the slack running back car by car, the chain
rails(L(12), D(12), 0.15); lab(13, 0.4); a(L(13) + 1.2, 'clank', 0.18); paper(L(13) + 1.8);
for (let k = 0; k < 4; k++) a(L(14) + 0.35 + k * 1.35, 'clank', 0.26);
for (let k = 0; k < 7; k++) a(L(15) + 0.4 + k * 0.32, 'clink', 0.1);
// 16 · the train running fast
rails(L(16) - 0.2, D(16) + 0.3, 0.3);
// 17–19 · the brake pipe fills, the valve, the shoe on the wheel
hiss(L(17) + 0.3, 1.6, 0.14); lab(17, 0.9);
a(L(18) + 0.2, 'tick', 0.2); paper(L(18) + 1.2);
hiss(L(19) + 0.2, 1.4, 0.3); lab(19, 2.0); a(L(19) + 3.4, 'creak', 0.25, 1.6); a(L(19) + 3.5, 'clank', 0.15);
// 20 · motors become generators, heat on the roof
a(L(20) + 0.3, 'charge', 0.12); a(L(20) + 1.5, 'sizzle', 0.15, 1.5); lab(20, 0.5);
// 21 · the myth crossed out
a(L(21) + 0.4, 'whoosh', 0.12); scribble(L(21) + D(21) - 0.8);
// 22 · 80 km/h, 1.5 km
lab(22, 0.2); a(L(22) + 0.5, 'creak', 0.15, 2.5); ding(L(22) + D(22) - 0.6);
// 23 · recap labels
for (let k = 0; k < 4; k++) lab(23, 0.8 + k * 1.5);
// 24 · the car comes loose, the air blows out, both halves brake ✓
a(L(24) + 0.4, 'clank', 0.3); hiss(L(24) + 0.6, 1.8, 0.35); a(L(24) + 2.6, 'creak', 0.2, 1.8); scribble(L(24) + D(24) - 0.6);

const MUSIC = has('music-soft') ? 'music-soft' : null;
if (MUSIC) rec(0, MUSIC, 0.42, 0, window.TIMING.duration + 2.5, 0.6);
fs.writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: !MUSIC, cues: c }, null, 1));
console.log(c.length + ' cues; kit clips here: ' + (['swipe', 'paper', 'pencil-scribble', 'ding', 'clock-ticking', 'space-drone', 'ocean-waves', 'water-rush', 'wind-gust', 'music-soft', 'train-pass', 'diesel-idle', 'air-brake'].filter(has).join(', ') || 'none'));
