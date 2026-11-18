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

// ── this episode: one or two sounds per line, matched to what moves ──
// 0–2 · hook: the sofa, «أنا كويس» ticked, the inset of the canal
a(L(0) + 1.5, 'notify', 0.18); a(L(1) + 0.2, 'pop', 0.3); scribble(L(1) + 0.4); a(L(2) + 0.2, 'pop', 0.35); ding(L(2) + 0.8);
// 4–6 · the cut: labels, blood running in the veins, the faucet washer closing, the cushions swelling and sliding
lab(4, 1.0); lab(4, 2.2); lab(4, 3.4); rec(L(4) + 2.0, 'water-rush', 0.08, 3, 2.4, 1.0, 'coolant', 0.06);
a(L(5) + 0.5, 'whoosh', 0.12); a(L(5) + 1.6, 'pop', 0.3); a(L(5) + 1.8, 'drip', 0.2); a(L(5) + 2.6, 'drip', 0.2); paper(L(5) + 1.9);
a(L(6) + 0.3, 'pop', 0.3); a(L(6) + 1.6, 'squeeze', 0.18, 1.0); a(L(6) + 2.9, 'whoosh', 0.15, 1.0); paper(L(6) + 3.2);
// 7–8 · straining: the push, the inset; blood trapped, the fibres stretch
a(L(7) + 0.6, 'squeeze', 0.22, 1.4); a(L(7) + 1.0, 'pop', 0.3); a(L(7) + 1.7, 'pop', 0.25);
a(L(8) + 0.3, 'whoosh', 0.12); rec(L(8) + 0.4, 'water-rush', 0.08, 4, 2.0, 1.0, 'coolant', 0.06); a(L(8) + 1.0, 'pop', 0.3); a(L(8) + 2.6, 'creak', 0.12, 1.4); lab(8, 2.8);
// 9–10 · causes: the three boxes, the clock running; four people
a(L(9) + 0.4, 'pop', 0.3); scribble(L(9) + 0.9);
{ const c = [0, 0.33, 0.6]; a(L(9) + 1.9, 'pop', 0.3); scribble(L(9) + 2.3); a(L(9) + 3.2, 'pop', 0.3); rec(L(9) + 3.2, 'clock-ticking', 0.25, 0.1, D(9) - 3.2, 1.0, null); }
for (let k = 0; k < 4; k++) a(L(10) + 0.2 + k * 0.95, 'pop', 0.28);
// 11–13 · two kinds; no pain nerves, bright blood; the clot and the pain
lab(11, 0.3); a(L(11) + 0.9, 'pop', 0.3); a(L(11) + 1.3, 'pop', 0.3);
a(L(12) + 0.8, 'pop', 0.3); scribble(L(12) + 1.2); for (let k = 0; k < 4; k++) a(L(12) + 3.3 + k * 0.6, 'drip', 0.22); a(L(12) + 4.6, 'pop', 0.25);
lab(13, 0.4); a(L(13) + 1.8, 'squeeze', 0.15, 1.2); paper(L(13) + 2.9); a(L(13) + 3.4, 'thud', 0.25); a(L(13) + 3.8, 'thud', 0.18);
// 14–16 · the warning, the four red flags ticked, the colon and the scope
a(L(14) + 0.2, 'bell', 0.25); a(L(14) + 1.8, 'pop', 0.3); a(L(14) + 3.2, 'clink', 0.18);
for (let k = 0; k < 4; k++) { const tt = L(15) + [0, 0.27, 0.52, 0.72][k] * (T[15].end - T[15].start); paper(tt); scribble(tt + 0.3); }
a(L(16) + 0.4, 'pop', 0.3); a(L(16) + 0.9, 'drip', 0.2); a(L(16) + 1.8, 'servo', 0.18, 1.6); lab(16, 2.4);
// 17 · fibre, water, five minutes
scribble(L(17) + 0.6); a(L(17) + 1.6, 'pop', 0.3); a(L(17) + 2.2, 'slosh', 0.15, 0.9); a(L(17) + 3.0, 'pop', 0.3); rec(L(17) + 3.0, 'clock-ticking', 0.25, 0.1, D(17) - 3.0, 1.0, null); ding(L(17) + D(17) - 0.6);
// 18–19 · the band: the tube slides up, the band snaps; it dries, the calendar counts, it drops
a(L(18) + 0.6, 'pop', 0.25); a(L(18) + 2.0, 'servo', 0.2, 1.0); a(L(18) + 3.1, 'snip', 0.4); lab(18, 3.2); a(L(18) + 3.8, 'whoosh', 0.1);
scribble(L(19) + 0.2); a(L(19) + 0.6, 'pop', 0.3); for (let k = 1; k < 7; k++) a(L(19) + 0.6 + k * (D(19) - 1.6) / 7, 'tick', 0.22); a(L(19) + D(19) - 1.4, 'drop', 0.3);
// 20–21 · excision: the scalpel, out, stitched; the stapler goes up, fires, lifts
a(L(20) + 1.5, 'clink', 0.2); a(L(20) + 1.7, 'wipe', 0.25); a(L(20) + 2.3, 'snip', 0.35); a(L(20) + 2.7, 'whoosh', 0.12); a(L(20) + 3.2, 'pop', 0.3); scribble(L(20) + 3.5); a(L(20) + 4.2, 'pop', 0.3); a(L(20) + 4.4, 'thud', 0.18);
a(L(21) + 0.3, 'servo', 0.2, 1.0); lab(21, 1.4); a(L(21) + 2.3, 'clank', 0.3); a(L(21) + 2.6, 'whoosh', 0.12); a(L(21) + 3.4, 'servo', 0.15, 0.8);
// 22–23 · laser: the fibre goes in, it heats; it shrinks, the ticks
a(L(22) + 1.4, 'servo', 0.15, 1.4); lab(22, 2.2); a(L(22) + 3.0, 'charge', 0.2); a(L(22) + 3.4, 'sizzle', 0.22, 1.4);
a(L(23) + 0.3, 'squeeze', 0.12, 1.0); a(L(23) + 1.0, 'pop', 0.3); scribble(L(23) + 1.3); paper(L(23) + 2.4); scribble(L(23) + 2.7); scribble(L(23) + 4.0); a(L(23) + 5.0, 'pop', 0.3);
// 24–26 · the myth crossed out, two drops, «اكشف»; the recap cards; fifty per cent
a(L(24) + 0.2, 'pop', 0.3); a(L(24) + 0.7, 'pop', 0.3); a(L(24) + 1.0, 'whoosh', 0.12); scribble(L(24) + 2.4); a(L(24) + 3.4, 'drip', 0.25); a(L(24) + 3.6, 'drip', 0.25); a(L(24) + 5.0, 'pop', 0.4);
for (let k = 0; k < 4; k++) paper(L(25) + [0, 0.3, 0.52, 0.72][k] * (T[25].end - T[25].start));
a(L(26) + 0.4, 'pop', 0.3); for (let k = 0; k < 5; k++) a(L(26) + 0.9 + k * 0.3, 'tick', 0.22); ding(L(26) + 2.0); paper(L(26) + D(26) - 2.4);

const MUSIC = null;   // no music: sound effects only (the channel's rule)
if (MUSIC) rec(0, MUSIC, 0.42, 0, window.TIMING.duration + 2.5, 0.6);
fs.writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: !MUSIC, cues: c }, null, 1));
console.log(c.length + ' cues; kit clips here: ' + (['swipe', 'paper', 'pencil-scribble', 'ding', 'clock-ticking', 'space-drone', 'ocean-waves', 'water-rush', 'wind-gust', 'music-soft'].filter(has).join(', ') || 'none'));
