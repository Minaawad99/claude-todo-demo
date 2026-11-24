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
// 0–2 · hook: the drop appears, it falls next to a lentil, the meter counts with a stopwatch
a(L(0) + 0.3, 'drip', 0.3); a(L(1) + 0.2, 'drop', 0.3); a(L(1) + 1.1, 'pop', 0.3); a(L(1) + 1.6, 'pop', 0.3);
for (let k = 0; k < 4; k++) a(L(2) + 0.1 + k * 0.22, 'tick', 0.16); ding(L(2) + 0.9);
// 4 · the eye, crossed out
a(L(4) + 0.3, 'pop', 0.3); scribble(L(4) + D(4) * 0.55);
// 5 · push into the strip
a(L(5) + 0.2, 'whoosh', 0.15); lab(5, 0.9);
// 6 · the channel sucks the blood up
a(L(6) + 0.3, 'drip', 0.3); a(L(6) + 0.8, 'fill', 0.18, Math.min(2.5, D(6) - 1.2)); lab(6, 0.4); a(L(6) + 1.6, 'pop', 0.25);
// 7 · the layers open
a(L(7) + 0.2, 'whoosh', 0.14); lab(7, 0.8); lab(7, 1.2); lab(7, 2.2); lab(7, 2.8);
// 8 · key and lock: the glucose clicks in, the other molecule bounces off
lab(8, 0.2); a(L(8) + 1.7, 'clink', 0.25); scribble(L(8) + 1.8); a(L(8) + D(8) * 0.5, 'pop', 0.3);
// 9 · electrons pulled out
a(L(9) + 0.5, 'zap', 0.12); a(L(9) + 1.0, 'zap', 0.12); lab(9, 1.6);
// 10 · the mediator carries them; delivery icon
lab(10, 0.5); a(L(10) + 1.0, 'whoosh', 0.12); a(L(10) + 1.6, 'pop', 0.3);
// 11 · the meter opens; battery, current meter, voltage
a(L(11) + 0.2, 'clank', 0.15); lab(11, 1.2); lab(11, 1.8); a(L(11) + 2.6, 'hum', 0.08, 2.0);
// 12 · more sugar, more current
for (let k = 0; k < 6; k++) a(L(12) + 0.3 + k * 0.15, 'pop', 0.18); a(L(12) + 0.8, 'charge', 0.12, 2.0);
// 13 · counting at the gate
for (let k = 0; k < 8; k++) a(L(13) + 0.3 + k * 0.45, 'tick', 0.15); a(L(13) + 1.6, 'pop', 0.3);
// 14 · the chip, the number counts up to 126
lab(14, 0.3); a(L(14) + 0.6, 'zap', 0.1); for (let k = 0; k < 6; k++) a(L(14) + 1.6 + k * 0.25, 'tick', 0.15); ding(L(14) + 3.2);
// 15 · the real device ✓, the calculator
paper(L(15) + 0.25); scribble(L(15) + 0.6); a(L(15) + 2.4, 'pop', 0.3);
// 16 · a crack, the number glitches, ✗
a(L(16) + 0.3, 'snip', 0.3); a(L(16) + 1.0, 'zap', 0.12); scribble(L(16) + 1.6);
// 17 · heat, humidity, expired
a(L(17) + 0.2, 'sizzle', 0.12, 0.8); a(L(17) + 0.6, 'drip', 0.25); a(L(17) + 1.2, 'pop', 0.3); lab(17, 1.8);
// 18 · juice on the finger → 180 ✗; wash → 126 ✓
a(L(18) + 0.3, 'pop', 0.3); lab(18, 0.6); a(L(18) + 1.0, 'pop', 0.3); scribble(L(18) + 1.6); 
rec(L(18) + D(18) * 0.62, 'water-rush', 0.18, 3, 1.4, 1.0, 'slosh', 0.2); ding(L(18) + D(18) * 0.62 + 0.6);
// 19 · «بالظبط؟» crossed out
paper(L(19) + 0.2); scribble(L(19) + D(19) * 0.7);
// 20 · ±15 % range
a(L(20) + 0.4, 'whoosh', 0.12); ding(L(20) + 0.9); lab(20, 1.4); lab(20, 2.0);
// 21 · recap 1 → 2 → 3
lab(21, 0.4); a(L(21) + 1.4, 'pop', 0.25); lab(21, 1.6); a(L(21) + 2.6, 'pop', 0.25); lab(21, 2.8); ding(L(21) + 3.4);
// 22 · the 1970 meter
a(L(22) + 0.2, 'thud', 0.3); paper(L(22) + 0.5); ding(L(22) + 1.6); a(L(22) + 2.4, 'pop', 0.25);

// music plays only when sfx.py is run with --music, and that only when the user asked for music in this video
const MUSIC = has('music-soft') ? 'music-soft' : null;
if (MUSIC) rec(0, MUSIC, 0.42, 0, window.TIMING.duration + 2.5, 0.6);
fs.writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: !MUSIC, cues: c }, null, 1));
console.log(c.length + ' cues; kit clips here: ' + (['swipe', 'paper', 'pencil-scribble', 'ding', 'clock-ticking', 'space-drone', 'ocean-waves', 'water-rush', 'wind-gust', 'music-soft'].filter(has).join(', ') || 'none'));
