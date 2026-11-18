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
// the excimer laser in real life is a fast train of sharp clicks (its pulses); the microkeratome a small motor whine
const CHK = (i, c) => { const ch = JSON.parse(fs.readFileSync(__dirname + '/sketch/scenes.js', 'utf8').match(/window\.CHUNKS = (\[.*?\]);/)[1])[i]; return (T[i].end - T[i].start) * (ch[c] || 0); };
const pulsesAt = (t, dur, rate, g) => { for (let s = 0; s < dur; s += 1 / rate) a(t + s, 'tick', g || 0.13); };
// 0–2 · hook: glasses, the laser bed (machine hum, a short laser burst), a crossed-out needle
a(L(1) + 0.4, 'hum', 0.12, D(1) - 0.4); pulsesAt(L(1) + 1.3, 1.6, 12, 0.1); a(L(2) + 0.1, 'pop', 0.35); scribble(L(2) + 0.35);
// 4 · the rule card
paper(L(4) + 0.5); a(L(4) + 0.7, 'pop', 0.35);
// 5 · light rays draw through the eye, the cornea lights up, ⅔ lands
a(L(5) + 0.3, 'whoosh', 0.14, 1.4); lab(5, 0.5); ding(L(5) + CHK(5, 2)); lab(5, CHK(5, 2) + 0.5); lab(5, 1.7);
// 6 · out of focus: before, then behind the retina; the camera icon
a(L(6) + 0.2, 'whoosh', 0.12, 1.2); a(L(6) + 1.3, 'pop', 0.3); a(L(6) + CHK(6, 2), 'whoosh', 0.12, 1.2); a(L(6) + CHK(6, 3), 'pop', 0.3);
// 7 · the cornea is reshaped, the focus slides onto the retina
pulsesAt(L(7) + CHK(7, 1), 1.4, 12, 0.1); scribble(L(7) + CHK(7, 1) + 1.6); lab(7, CHK(7, 1) + 1.8);
// 8 · drop, speculum, suction ring
a(L(8) + 0.9, 'drip', 0.4); a(L(8) + CHK(8, 1) + 0.1, 'servo', 0.2); a(L(8) + CHK(8, 1) + 0.6, 'clink', 0.18); a(L(8) + CHK(8, 2), 'vac', 0.16, 1.6); a(L(8) + CHK(8, 2) + 0.3, 'clink', 0.2);
// 9 · the blade cuts the flap (motor), the depth mark, the flap folds open
a(L(9) + 0.2, 'motor', 0.14, 2.2); a(L(9) + 0.2, 'wipe', 0.2); ding(L(9) + CHK(9, 1)); a(L(9) + CHK(9, 2), 'whoosh', 0.18, 1.0); paper(L(9) + CHK(9, 2) + 0.2);
// 10 · excimer: a long train of pulses while the bed is shaped
pulsesAt(L(10) + 0.4, D(10) - 1.2, 14, 0.12); a(L(10) + 0.4, 'hum', 0.1, D(10) - 0.8); a(L(10) + CHK(10, 1), 'pop', 0.3);
// 11 · short sight then long sight shaping
pulsesAt(L(11) + 0.3, 1.2, 14, 0.1); a(L(11) + 0.2, 'pop', 0.3); pulsesAt(L(11) + CHK(11, 1) + 0.2, 1.2, 14, 0.1); a(L(11) + CHK(11, 1), 'pop', 0.3);
// 12 · the tracker locks on; the eye jumps and the laser stops (a warning beep)
a(L(12) + 0.3, 'servo', 0.15); pulsesAt(L(12) + 0.6, CHK(12, 2) - 0.6, 14, 0.08); a(L(12) + CHK(12, 1), 'pop', 0.3); a(L(12) + CHK(12, 2), 'beep', 0.3);
// 13 · the flap goes back, the check, the needle crossed
a(L(13) + 0.2, 'whoosh', 0.16, 1.4); scribble(L(13) + 2.0); scribble(L(13) + 2.6);
// 14 · types: blade, then the femtosecond laser's bubbles
a(L(14) + 0.2, 'pop', 0.35); a(L(14) + CHK(14, 2), 'motor', 0.13, 1.6); a(L(14) + CHK(14, 2), 'wipe', 0.2); a(L(14) + CHK(14, 3), 'fizz', 0.18, 1.4); pulsesAt(L(14) + CHK(14, 3), 1.4, 16, 0.07);
// 15 · PRK: brushing the surface cells off, the laser, regrowth, the pain mark
a(L(15) + 0.2, 'pop', 0.35); a(L(15) + CHK(15, 1), 'wipe', 0.22); a(L(15) + CHK(15, 1) + 0.5, 'wipe', 0.18); pulsesAt(L(15) + CHK(15, 1) + 1, 0.8, 14, 0.1); a(L(15) + CHK(15, 2) + 0.4, 'pop', 0.3); a(L(15) + CHK(15, 3), 'snip', 0.2);
// 16 · SMILE: the lenticule is cut (bubbles), the small incision, the piece slides out
a(L(16) + 0.2, 'pop', 0.35); a(L(16) + 0.4, 'fizz', 0.15, 1.4); lab(16, CHK(16, 1)); a(L(16) + CHK(16, 2) - 0.4, 'snip', 0.25); a(L(16) + CHK(16, 2) + 0.4, 'whoosh', 0.16, 1.4);
// 17 · the thickness is measured, the stable prescription ticked
lab(17, 0.6); ding(L(17) + 1.3); paper(L(17) + CHK(17, 2)); scribble(L(17) + CHK(17, 2) + 0.8);
// 18 · sleeping (soft), then «don't rub» crossed out
a(L(18) + 0.4, 'pop', 0.25); a(L(18) + CHK(18, 2), 'pop', 0.3); scribble(L(18) + CHK(18, 2) + 0.6);
// 19 · drops, sunglasses, the night shield
a(L(19) + 0.6, 'drip', 0.35); a(L(19) + 1.4, 'drip', 0.3); a(L(19) + CHK(19, 1), 'pop', 0.3); a(L(19) + CHK(19, 2), 'pop', 0.3); ding(L(19) + CHK(19, 2) + 0.5);
// 20 · tap water, make-up, the pool: each crossed out, then 14 days
a(L(20) + 0.2, 'drip', 0.3); scribble(L(20) + 0.5); scribble(L(20) + D(20) * 0.25 + 0.3); a(L(20) + D(20) * 0.45, 'slosh', 0.2); scribble(L(20) + D(20) * 0.45 + 0.3); ding(L(20) + D(20) * 0.6);
// 21 · the myth crossed out
a(L(21) + 0.6, 'pop', 0.3); scribble(L(21) + D(21) - 1.3);
// 22 · 40+, the lens, reading glasses
ding(L(22) + 0.3); a(L(22) + CHK(22, 1), 'pop', 0.3); lab(22, CHK(22, 2)); scribble(L(22) + CHK(22, 2) + 0.8);
// 23 · recap: open, laser, close
a(L(23) + CHK(23, 1), 'whoosh', 0.15, 0.8); pulsesAt(L(23) + CHK(23, 2), 1.2, 14, 0.1); a(L(23) + CHK(23, 3), 'whoosh', 0.15, 0.8);
// 24 · the turkey: the plate, 1981, the laser etching the cartilage
a(L(24) + 0.3, 'pop', 0.3); lab(24, 0.6); pulsesAt(L(24) + 1.0, 1.8, 14, 0.1); ding(L(24) + 1.4);

// music plays only when sfx.py is run with --music, and that only when the user asked for music in this video
const MUSIC = has('music-soft') ? 'music-soft' : null;
if (MUSIC) rec(0, MUSIC, 0.42, 0, window.TIMING.duration + 2.5, 0.6);
fs.writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: !MUSIC, cues: c }, null, 1));
console.log(c.length + ' cues; kit clips here: ' + (['swipe', 'paper', 'pencil-scribble', 'ding', 'clock-ticking', 'space-drone', 'ocean-waves', 'water-rush', 'wind-gust', 'music-soft'].filter(has).join(', ') || 'none'));
