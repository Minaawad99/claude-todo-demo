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
const PROMISE = 5, SUMMARY = 36, ASK = T.length - 1;   // this episode's promise is «تعالوا نعرف إيه حكاية الغراب»
a(L(0) + 0.1, 'chime', 0.3);                                                                            // the hook card opens
a(L(PROMISE) + 0.15, 'ping', 0.3); for (let k = 0; k < 5; k++) a(L(PROMISE) + 0.4 + k * 0.32, 'tick', 0.14);   // bumper: the stopwatch
for (let i = PROMISE + 1; i < SUMMARY; i++) swipe(i);                                                   // one flip per shot change
a(L(SUMMARY) + 0.1, 'chime', 0.35); for (let k = 0; k < 5; k++) a(L(SUMMARY) + 0.3 + k * 0.15, 'tick', 0.16);   // summary card builds
paper(L(ASK) + 0.1); a(L(ASK) + 0.3, 'pop', 0.4);                                                       // ask box

// ── this episode: one or two sounds per line, matched to what moves (see videos/tides/cues.js) ──
const pop = (t, g) => a(t, 'pop', g || 0.3), whoosh = (t, g, dur) => a(t, 'whoosh', g || 0.15, dur), cawAt = (t, g) => a(t, 'caw', g || 0.4);
// 0–4 · the viral clip: the bread dunked in the puddle, the tags; then «is that normal?»
a(L(0) + 4.4, 'drop', 0.35); a(L(0) + 5.2, 'slosh', 0.25, 1.0); a(L(0) + 8.0, 'drop', 0.3);
pop(L(1) + 1.0); pop(L(2) + 0.5); whoosh(L(3) + 0.05); pop(L(3) + 0.2, 0.4); scribble(L(4) + 0.3);
cawAt(L(5) + 0.35, 0.3);
// 6–7 · dry bread crumbles, soaked bread holds; the rusk in tea; the two rows
for (let k = 0; k < 4; k++) lab(6, 0.6 + k * 0.4); a(L(6) + 2.4, 'drop', 0.35); a(L(6) + 2.6, 'slosh', 0.2, 0.9); pop(L(6) + D(6) * 0.62);
pop(L(7) + 0.3); pop(L(7) + 1.1); whoosh(L(7) + 1.6, 0.12); scribble(L(7) + 2.1); scribble(L(7) + 2.4);
// 8–10 · Betty: the set, the wire, bending it, fishing the bucket out
pop(L(8) + 0.5); lab(8, 1.5); a(L(8) + 2.2, 'clink', 0.2); lab(8, 3.5);
for (const k of [0.6, 1.0, 1.4]) a(L(9) + k, 'clink', 0.18, 0.5); pop(L(9) + 0.4); whoosh(L(9) + 2.6, 0.12, 1.2); ding(L(9) + D(9) - 0.8);
pop(L(10) + 0.3);
// 11–12 · 007's eight steps light up one by one, then 2.5 minutes
pop(L(11) + 0.05); { const tot = L(13) - L(11); for (let i = 0; i < 8; i++) a(L(11) + 1 + i * (tot - 2) / 8, 'tick', 0.22); }
pop(L(12) + 2.4); ding(L(12) + 3.4);
// 13–16 · the brain
whoosh(L(13) + 0.1); lab(13, 0.6); pop(L(14) + 0.3); pop(L(14) + 0.6); lab(14, 0.8); pop(L(14) + 2.2);
pop(L(15) + 0.4); pop(L(15) + 0.8); ding(L(15) + 1.6); pop(L(16) + 0.3); a(L(16) + 1.2, 'chime', 0.2); pop(L(16) + 1.8);
// 17–19 · the crow and the pitcher: stones dropping in, sink ✓ float ✗, 5–7 years
pop(L(17) + 0.05); pop(L(17) + 0.6);
for (const t of [L(17) + 3.2, L(18) + 1.2, L(18) + 3.4, L(18) + 5.2, L(19) + 1.0]) a(t, 'drop', 0.25);
scribble(L(19) + 0.3); scribble(L(19) + 0.7); ding(L(19) + 1.6);
// 20 · Japan: cars and walnuts
pop(L(20) + 0.4); whoosh(L(20) + 0.6, 0.15, 1.4); a(L(20) + 1.6, 'thud', 0.25); whoosh(L(20) + 3.2, 0.12, 1.2);
// 21 · counting out loud: one caw per call, rounds of 1, 2, 3, 4 (same schedule as the shot)
pop(L(21) + 0.3); { const d = D(21), per = (d - 2.4 - .5) / 10; let tt = 2.4; for (const r of [1, 2, 3, 4]) { pop(L(21) + tt - 0.1, 0.2); for (let i = 0; i < r; i++) { cawAt(L(21) + tt, 0.38); tt += per * .85; } tt += per * .4; } }
// 22–23 · teaching people; the crow digging
whoosh(L(22) + 0.4); a(L(22) + 1.0, 'chime', 0.2); pop(L(22) + 0.2);
pop(L(23) + 0.3); for (let k = 0.6; k < D(23) - 1; k += 0.9) a(L(23) + k, 'scratch', 0.25, 0.6);
// 24 · Sweden: butt in, food out
pop(L(24) + 0.05); pop(L(24) + 0.4); whoosh(L(24) + 1.4, 0.12); a(L(24) + 1.9, 'clink', 0.15, 0.5);
// 25–27 · the mask; scolding years later; the young ones too
pop(L(25) + 0.05); pop(L(25) + 0.4); pop(L(26) + 0.3); for (const k of [0.6, 1.4, 2.3]) cawAt(L(26) + k, 0.32); pop(L(27) + 0.2); lab(27, 0.6);
// 28–30 · the wake: calls all round, more crows fly in; the investigation; the person they remember
for (let k = 0.2; k < D(28); k += 0.75) cawAt(L(28) + k, 0.28 + 0.06 * Math.sin(k * 3)); whoosh(L(28) + D(28) * 0.55, 0.18, 1.6); pop(L(28) + 0.3);
whoosh(L(29) + 0.1); pop(L(29) + 0.3); pop(L(29) + 1.2); cawAt(L(29) + 2.5, 0.22);
for (let k = 0.3; k < D(30); k += 0.72) cawAt(L(30) + k, 0.3); scribble(L(30) + 1.0); pop(L(30) + D(30) * 0.55, 0.35);
// 31–35 · family; the bread lesson; the myth crossed out; the recap ticks; the gifts
pop(L(31) + 0.3); pop(L(31) + 1.6); a(L(32) + 0.2, 'slosh', 0.2, 0.9); whoosh(L(32) + 0.3); pop(L(32) + 0.8);
pop(L(33) + 0.2); scribble(L(33) + 1.2); ding(L(33) + D(33) * 0.6);
{ const ch = [0, .2, .4, .6, .8]; for (let i = 0; i < 5; i++) scribble(L(34) + 0.6 + i * (D(34) - 1) / 5); }
pop(L(35) + 0.05); pop(L(35) + 1.6); for (let i = 0; i < 3; i++) { pop(L(35) + 2.6 + i * 0.7); } a(L(35) + 4.0, 'clink', 0.2, 0.6);

// music plays only when sfx.py is run with --music, and that only when the user asked for music in this video
const MUSIC = has('music-soft') ? 'music-soft' : null;
if (MUSIC) rec(0, MUSIC, 0.42, 0, window.TIMING.duration + 2.5, 0.6);
fs.writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: !MUSIC, cues: c }, null, 1));
console.log(c.length + ' cues; kit clips here: ' + (['swipe', 'paper', 'pencil-scribble', 'ding', 'clock-ticking', 'space-drone', 'ocean-waves', 'water-rush', 'wind-gust', 'music-soft'].filter(has).join(', ') || 'none'));
