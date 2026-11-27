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
// NO MUSIC: the user removed the background music for good (after «لو حد شرق قدامك»). Sound effects only; ask the user
// for any real recording a moment needs (Pixabay search terms) and put it in <episode>/sfx/px-<name>.mp3.
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
const CH = JSON.parse(fs.readFileSync(__dirname + '/sketch/scenes.js', 'utf8').split('\n')[0].replace(/^window\.CHUNKS = /, '').replace(/;$/, ''));
const C = (i, j) => T[i].start + (T[i].end - T[i].start) * CH[i][j];
const fly = t => a(t, 'whoosh', 0.1, 1.6);                    // the camera flies in or out
const pop = (t, g) => a(t, 'pop', g || 0.3);
const swim = (t, d) => a(t, 'slosh', 0.07, d);                 // sperm swimming (soft)
const fizz = (t, d, g) => a(t, 'fizz', g || 0.07, d);          // ions / hormone seeping out
// 0–2 · hook: the T beside the fingertip, the measure; into the uterus; the open path
pop(L(0) + 0.3, 0.3); lab(0, 1.0); ding(L(0) + 1.7); paper(L(1) + 0.05); a(L(2) + 0.3, 'whoosh', 0.1, 1.0); pop(L(2) + 0.6, 0.3);
// 4 · the two devices, named
pop(L(4) + 0.1); pop(L(4) + 0.4); pop(C(4, 1) + 0.05, 0.3); pop(C(4, 1) + 0.55, 0.3);
// 5 · the uterus draws in, the rule tag
a(L(5) + 0.2, 'wipe', 0.12, 1.0); paper(C(5, 2) + 0.05);
// 6 · the swim up, labels, fly to the tube, the egg
swim(L(6) + 0.2, D(6) - 0.6); lab(6, C(6, 1) - L(6) + 0.2); lab(6, C(6, 2) - L(6) + 0.2); fly(C(6, 3)); ding(C(6, 3) + 0.5); lab(6, C(6, 4) - L(6) + 0.1);
// 7 · fly out, the cross, no pregnancy
fly(L(7)); scribble(L(7) + 0.6); pop(C(7, 1) + 0.05, 0.35);
// 8 · the copper T slides in, fly to the coil, ions
a(L(8) + 0.1, 'whoosh', 0.1, 1.0); pop(L(8) + 0.35); fly(C(8, 1)); fizz(C(8, 1) + 0.4, D(8) + D(9)); pop(C(8, 2) + 0.4, 0.3);
// 9 · they slow and die
a(C(9, 1) + 0.2, 'plunk', 0.15); scribble(C(9, 1) + 0.7);
// 10 · foreign body; white cells come in and attack
fly(L(10)); paper(C(10, 1) + 0.05); swim(C(10, 2), D(10) * 0.5); lab(10, C(10, 2) - L(10) + 0.4); a(C(10, 3) + 0.5, 'thud', 0.12);
// 11 · the doorman
paper(L(11) + 0.2); a(C(11, 1) + 0.15, 'whoosh', 0.1, 0.6); a(C(11, 2) + 0.1, 'thud', 0.18); scribble(C(11, 2) + 0.25); a(C(11, 2) + 0.2, 'whoosh', 0.12, 0.8);
// 12 · the hormonal T, fly in, hormone seeps out
a(L(12) + 0.1, 'whoosh', 0.1, 1.0); pop(L(12) + 0.35); fly(C(12, 1)); fizz(C(12, 1) + 0.3, D(12)); lab(12, C(12, 2) - L(12) + 0.1); pop(C(12, 3) + 0.05, 0.3);
// 13 · fly to the cervix, the mucus thickens, the jelly box, sperm stopped
fly(L(13)); a(C(13, 1) + 0.1, 'slosh', 0.12, 1.4); lab(13, C(13, 1) - L(13) + 0.3); pop(C(13, 2) + 0.05, 0.3); swim(C(13, 3), 1.2); scribble(C(13, 3) + 0.45);
// 14 · fly out, the lining thins, lighter periods
fly(L(14)); lab(14, 0.5); a(L(14) + 0.8, 'wipe', 0.1, 1.0); pop(C(14, 1) + 0.05, 0.3);
// 15 · 99 %
a(L(15) + 0.3, 'fill', 0.07, 1.5); ding(L(15) + 1.8);
// 16 · the calendars
paper(L(16) + 0.35); ding(L(16) + 0.7); paper(C(16, 2) + 0.05); ding(C(16, 2) + 0.4);
// 17 · her question, the calendar, the thread checked
pop(L(17) + 0.35, 0.3); paper(C(17, 2) + 0.05); lab(17, C(17, 3) - L(17) + 0.2); scribble(C(17, 3) + 0.6);
// 18 · the doctor, first period, the check
paper(C(18, 1) + 0.05); pop(C(18, 2) + 0.05, 0.3); scribble(C(18, 2) + 0.5);
// 19 · the warning signs, one by one
for (let j = 0; j < 4; j++) pop(C(19, j) + 0.05, 0.35); ding(C(19, 4) + 0.1);
// 20 · the shield, crossed
pop(L(20) + 0.25, 0.3); scribble(C(20, 1) + 0.15); pop(C(20, 1) + 0.35, 0.3);
// 21 · the myth, crossed
pop(L(21) + 0.65, 0.3); scribble(C(21, 2) + 0.05);
// 22 · the egg alone, the T comes out, fertility back
lab(22, 0.25); pop(L(22) + 0.65, 0.3); a(C(22, 2) + 0.1, 'whoosh', 0.12, 1.2); swim(C(22, 3), D(22) * 0.3); pop(C(22, 3) + 0.05, 0.3); scribble(C(22, 3) + 0.45);
// 23 · the recap, numbered
for (let j = 1; j < 4; j++) pop(C(23, j) + 0.05, 0.35); fizz(C(23, 1), 1.2, 0.05);
// 24 · the odd fact: 5 days, emergency
a(L(24) + 0.2, 'charge', 0.06, 0.8); paper(C(24, 1) + 0.05); ding(C(24, 1) + 0.4); pop(C(24, 3) + 0.05, 0.35); scribble(C(24, 3) + 0.65);

// music plays only when sfx.py is run with --music, and that only when the user asked for music in this video
const MUSIC = has('music-soft') ? 'music-soft' : null;
if (MUSIC) rec(0, MUSIC, 0.42, 0, window.TIMING.duration + 2.5, 0.6);
fs.writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: !MUSIC, cues: c }, null, 1));
console.log(c.length + ' cues; kit clips here: ' + (['swipe', 'paper', 'pencil-scribble', 'ding', 'clock-ticking', 'space-drone', 'ocean-waves', 'water-rush', 'wind-gust', 'music-soft'].filter(has).join(', ') || 'none'));
