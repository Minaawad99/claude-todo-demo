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

// ── this episode: «إزاي العضم بيلتئم بعد الكسر؟» ──
// sub-shots that start on a caption chunk ([line, chunk] in shots.js) get their own page flip
const CH = JSON.parse(fs.readFileSync(__dirname + '/sketch/scenes.js', 'utf8').match(/window\.CHUNKS = (.*?);\n/)[1]);
const C = (i, k) => L(i) + (T[i].end - T[i].start) * CH[i][k];
const swipeAt = t => rec(t - 0.08, 'swipe', 0.3, 0.6, 0.42, 1.0, 'whoosh', 0.2);
const snap = t => { rec(t, 'bone-snap', 0.45, 0, 0.6, 1.0, null); if (!has('bone-snap')) { a(t, 'snip', 0.45); a(t + 0.02, 'thud', 0.35); } };
// 0–2 · hook: the cast is wrapped, the 6-week calendar, glue and pill crossed out, the X-ray
a(L(0) + 0.4, 'wipe', 0.18, 0.6); a(L(0) + 1.0, 'wipe', 0.15, 0.5); paper(L(0) + 1.2);
paper(L(1) + 0.05); scribble(L(1) + 0.6); paper(L(1) + 0.4); scribble(L(1) + 1.0);
a(L(2) + 0.1, 'whoosh', 0.15); scribble(L(2) + 0.8);
// 4–5 · the rule card; builders and an eater at work
paper(L(4) + 0.3); a(L(4) + 0.45, 'pop', 0.35);
for (let k = 0; k < 7; k++) a(L(5) + 0.3 + k * 0.08, 'pop', 0.16); lab(5, 1.2); lab(5, 2.4);
// 6 · the crack
snap(L(6) + 0.35); swipeAt(C(6, 1)); snap(C(6, 1) + 0.25);
// 7 · torn vessels bleed, the clot grows; the swelling
for (let k = 0; k < 4; k++) a(L(7) + 0.5 + k * 0.35, 'drip', 0.2); lab(7, 0.2); lab(7, 1.6);
swipeAt(C(7, 2)); lab(7, C(7, 2) - L(7) + 0.7);
// 8 · scaffold; clean-up cells eat the chips
a(L(8) + 0.5, 'pop', 0.35); for (let k = 0; k < 7; k++) a(L(8) + 1.6 + k * 0.25, 'pop', 0.14);
// 9, 12, 16 · the questions
a(L(9) + 0.2, 'pop', 0.3); a(L(12) + 0.2, 'pop', 0.3); a(L(16) + 0.3, 'pop', 0.3);
// 10 · a week later; cells move in, the cartilage bridge grows
paper(L(10) + 0.2); lab(10, 0.6); a(L(10) + 1.2, 'fill', 0.12, 3); lab(10, 2.4);
// 11 · soft callus: the tag, the trowel, the weight, ✗
paper(L(11) + 0.2); a(L(11) + 0.9, 'pop', 0.3); a(L(11) + 1.9, 'thud', 0.3); scribble(L(11) + 2.4);
// 13 · calcium falls in, woven bone; the X-ray
paper(L(13) + 0.4); for (let k = 0; k < 6; k++) a(L(13) + 0.8 + k * 0.3, 'tick', 0.14); lab(13, 2);
swipeAt(C(13, 2)); lab(13, C(13, 2) - L(13) + 1);
// 14 · concrete; the eight weeks tick by
a(L(14) + 0.2, 'pop', 0.3); for (let k = 0; k < 8; k++) a(L(14) + 1.4 + k * 0.12, 'tick', 0.2); ding(L(14) + 2.5);
// 15 · the cast, then the ends wobble and the bridge cracks
a(L(15) + 0.1, 'wipe', 0.15, 0.6); lab(15, 0.6); a(L(15) + 1.9, 'creak', 0.18, 1.0); snap(L(15) + 2.7); scribble(L(15) + 3.0);
// 17–18 · the eaters take the bulge back; sanding; «سنين»
for (let k = 0; k < 8; k++) a(L(17) + 0.2 + k * 0.15, 'pop', 0.14); lab(17, 0.5); lab(17, 1.4);
a(L(18) + 0.3, 'wipe', 0.15, 1.2); a(L(18) + 1.0, 'wipe', 0.15, 1.2); paper(L(18) + 1.8);
// 19 · the speed bars, the vitamin note
lab(19, 0.2); lab(19, 0.7); lab(19, 1.3); paper(L(19) + 2.8); scribble(L(19) + 3.2);
// 20 · the myth crossed out
paper(L(20) + 0.3); scribble(L(20) + D(20) * 0.6);
// 21 · the graph draws; 22 · the recap boxes; 23 · scar ✗, bone ✓
a(L(21) + 0.4, 'whoosh', 0.12, 2); lab(21, 1.2); lab(21, D(21) - 1.2);
for (let k = 0; k < 4; k++) a(L(22) + 0.2 + k * Math.max(.5, (D(22) - 1) / 4), 'pop', 0.3);
lab(23, 0.9); scribble(L(23) + 1.3); paper(L(23) + 1.6); scribble(L(23) + 2.4);

const MUSIC = has('music-soft') ? 'music-soft' : null;
if (MUSIC) rec(0, MUSIC, 0.42, 0, window.TIMING.duration + 2.5, 0.6);
fs.writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: !MUSIC, cues: c }, null, 1));
console.log(c.length + ' cues; kit clips here: ' + (['swipe', 'paper', 'pencil-scribble', 'ding', 'clock-ticking', 'space-drone', 'ocean-waves', 'water-rush', 'wind-gust', 'music-soft'].filter(has).join(', ') || 'none'));
