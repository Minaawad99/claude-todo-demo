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
// e.g. lab(5, 0.4); ding(L(6) + 1.6); scribble(L(9) + 1.2); sea(L(0), L(PROMISE) - L(0) + 0.6, 0.45);
const motor = (i, dt, dur, g) => a(L(i) + (dt || 0), 'motor', g || 0.12, dur || D(i));               // the machine hums / pumps
a(L(0) + 0.6, 'fill', 0.22, 2.4);                                                                       // hook: the red bag fills
motor(1, 0.2, D(1) + D(2), 0.1); a(L(1) + 1.2, 'slosh', 0.15);                                          // the machine runs
a(L(2) + 0.9, 'pop', 0.3); a(L(2) + 1.1, 'fill', 0.18, 1.6);                                            // the yellow inset
lab(4, 0.6); ding(L(4) + 1.7); lab(4, 2.2);                                                             // 55%
a(L(5) + 0.5, 'fill', 0.2, 2.0); paper(L(5) + 1.6);                                                     // the drop turns yellow, «أصفر» tag
ding(L(6) + 1.0); for (let k = 0; k < 4; k++) a(L(6) + 1.6 + k * 0.3, 'plunk', 0.15);                   // 92% and the dissolved bits
a(L(7) + 0.1, 'whoosh', 0.15); a(L(7) + 1.2, 'pop', 0.3); lab(7, 0.8);                                  // zoom into the plasma, soup icon
motor(8, 0, D(8), 0.1); a(L(8) + 0.6, 'pop', 0.3);                                                      // «؟»
paper(L(9) + 0.3);                                                                                      // the rule card
a(L(10) + 0.5, 'drip', 0.2); a(L(10) + 2.0, 'drip', 0.2); lab(10, 1.0); lab(10, 1.8);                   // cells settle
a(L(11) + 0.4, 'slosh', 0.18); lab(11, 1.2); a(L(11) + 0.8, 'pop', 0.25);                               // juice, the small tube
rec(L(12) + 0.1, 'clock-ticking', 0.25, 0, D(12) - 0.3, 1.0, 'tick', 0.15); scribble(L(12) + 1.7);       // hours? ✗
a(L(13) + 0.3, 'spin', 0.3, D(13)); ding(L(13) + 1.2);                                                  // the rotor spins up, 3,000+
a(L(14), 'spin', 0.22, D(14)); a(L(14) + 0.5, 'whoosh', 0.18); a(L(14) + 1.0, 'pop', 0.25); paper(L(14) + 0.5);   // tubes fly out, washer, tag
a(L(15) + 0.3, 'whoosh', 0.15); lab(15, 1.0); lab(15, 1.2); a(L(15) + 1.6, 'fill', 0.2, 2.2);           // red out, yellow in, the bag fills
for (let k = 0; k < 4; k++) a(L(16) + 0.3 + k * 0.6, 'drip', 0.16); lab(16, 0.4); scribble(L(16) + 1.2); // citrate drips, ✗ on the clot
a(L(17) + 0.1, 'whoosh', 0.15); paper(L(17) + 0.5); for (let k = 0; k < 3; k++) a(L(17) + 0.9 + k * 0.4, 'zap', 0.07);   // the face, tingling
motor(18, 0, D(18), 0.1); for (let k = 0; k < 3; k++) a(L(18) + 0.6 + k * 0.6, 'pop', 0.28); paper(L(18) + 0.4);   // ① ② ③, the red cells back
rec(L(19), 'clock-ticking', 0.2, 0, 2.2, 1.0, 'tick', 0.15); a(L(19) + 1.4, 'fill', 0.2, 2.4);           // an hour, the drop refills
a(L(20) + 0.2, 'paper', 0.3); a(L(20) + 0.5, 'paper', 0.3); scribble(L(20) + 0.8);                      // two calendars, ✓
for (const k of [0.3, 0.35, 0.65]) { a(L(21) + D(21) * k, 'pop', 0.28); } a(L(21) + 0.4, 'slosh', 0.15); // albumin, factors, antibodies
paper(L(22) + 0.2); scribble(L(22) + 0.8); a(L(22) + 1.2, 'whoosh', 0.15);                              // myth ✗, the iron comes back
motor(23, 0, D(23), 0.1); lab(23, 0.6); paper(L(23) + 1.4);                                             // recap
for (let k = 0; k < 10; k++) a(L(24) + 0.3 + k * 0.38, 'tick', 0.12); ding(L(24) + 4.2);                // the bags count up to 1,000+

// music plays only when sfx.py is run with --music, and that only when the user asked for music in this video
const MUSIC = has('music-soft') ? 'music-soft' : null;
if (MUSIC) rec(0, MUSIC, 0.42, 0, window.TIMING.duration + 2.5, 0.6);
fs.writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: !MUSIC, cues: c }, null, 1));
console.log(c.length + ' cues; kit clips here: ' + (['swipe', 'paper', 'pencil-scribble', 'ding', 'clock-ticking', 'space-drone', 'ocean-waves', 'water-rush', 'wind-gust', 'music-soft'].filter(has).join(', ') || 'none'));
