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
// 0–2 · hook: the skid, the splash, the car floating, the stopwatch from 1:00
rec(L(0) + 0.6, 'skid', 0.3, 0, 1.2, 1.0, 'whoosh', 0.2); rec(L(0) + 2.9, 'splash', 0.45, 0, 1.6, 1.0, 'plunk', 0.4);
sea(L(1), L(3) - L(1) + 0.4, 0.3); lab(1, 0.5);
rec(L(2) + 0.1, 'clock-ticking', 0.3, 0.1, D(2) + 0.3, 1.0, null); ding(L(2) + 1.2);
// 4–7 · the door: pressure from outside, 200 kg, the man leaning on it
sea(L(4), D(4) + D(5) + D(6), 0.18); a(L(4) + 0.3, 'pop', 0.3);
for (let k = 0; k < 5; k++) a(L(5) + 0.6 + k * 0.1, 'tick', 0.18); lab(5, 1.0); lab(5, 2.2);
lab(6, 0.5); ding(L(6) + 1.7); a(L(7) + 0.4, 'thud', 0.3, 0.3); a(L(7) + 0.5, 'creak', 0.15, 0.8);
// 8 · forget the door; the four steps land one by one
scribble(L(8) + 0.4); { const c0 = L(8) + D(8) * 0.4; for (let k = 0; k < 4; k++) a(c0 + k * D(8) * 0.15, 'pop', 0.35); }
// 9–15 · the steps
rec(L(9) + 0.6, 'belt', 0.4, 0, 1.0, 1.0, 'snip', 0.35);
rec(L(10) + 0.5, 'window', 0.35, 0, 1.6, 1.0, 'servo', 0.25);
rec(L(11) + 0.4, 'window', 0.25, 0, 2.4, 1.0, 'servo', 0.2); a(L(11) + 0.4, 'tick', 0.2);
rec(L(12) + 1.6, 'glass', 0.45, 0, 1.2, 1.0, 'clink', 0.4); scribble(L(12) + 3.0);
scribble(L(13) + 0.3);
rec(L(14) + 0.6, 'belt', 0.3, 0, 1.0, 1.0, 'snip', 0.3); rec(L(14) + 1.5, 'swim', 0.3, 0, 1.4, 1.0, 'slosh', 0.25);
rec(L(15) + 0.3, 'swim', 0.4, 0, D(15), 1.0, 'slosh', 0.3);
// 16–18 · the clock, the nose dips, water pours in, the car goes under
rec(L(16), 'clock-ticking', 0.25, 0.1, D(16), 1.0, null);
rec(L(17) + 0.3, 'water-rush', 0.35, 3, D(17), 1.0, 'fill', 0.3); a(L(17) + 0.6, 'creak', 0.2, 1.2);
rec(L(18), 'bubbles', 0.35, 0, D(18), 1.0, 'fill', 0.25); ding(L(18) + 0.4);
// 19–21 · the myth (water fills, crossed out), the dark, the phone
rec(L(19), 'water-rush', 0.25, 6, D(19) - 0.6, 1.0, 'fill', 0.2); scribble(L(19) + D(19) - 1.0);
rec(L(20), 'bubbles', 0.3, 2, D(20), 1.0, 'hum', 0.15); a(L(20), 'hum', 0.12, D(20));
scribble(L(21) + 0.5); paper(L(21) + D(21) * 0.5); scribble(L(21) + D(21) * 0.5 + 0.3);
// 22–23 · recap steps, the windscreen that only cracks
{ for (let k = 0; k < 4; k++) a(L(22) + D(22) * (0.25 + k * 0.12), 'pop', 0.35); scribble(L(22) + D(22) * 0.82); }
for (let k = 0; k < 5; k++) a(L(23) + k * 1.4 + 0.05, 'clink', 0.25, 0.4); lab(23, 0.4); lab(23, 0.6);

// no music and no synthesized bed (bed: false), ever
fs.writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: false, cues: c }, null, 1));
console.log(c.length + ' cues; kit clips here: ' + (['swipe', 'paper', 'pencil-scribble', 'ding', 'clock-ticking', 'space-drone', 'ocean-waves', 'water-rush', 'wind-gust'].filter(has).join(', ') || 'none'));
