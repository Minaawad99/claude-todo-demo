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
// No recorded clips unless the user asks (CLAUDE.md): only sfx.py's synthesized effects and its generated music bed.
// RECORDED = true turns the Pixabay kit and the recorded music back on; ask the user first.
const RECORDED = false;
const has = n => RECORDED && !!where(n);
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
const beat = (t0, dur, g) => { for (let s = t0; s < t0 + dur - 0.3; s += 0.87) { a(s, 'thud', g || 0.1); a(s + 0.22, 'thud', (g || 0.1) * 0.7); } };
// 0 · the welder: a sizzling arc the whole line, a few crackles
a(L(0) + 0.1, 'sizzle', 0.22, D(0)); for (let k = 0; k < 4; k++) a(L(0) + 0.4 + k * 0.7, 'zap', 0.12);
// 1–2 · the leg: the clock runs to 6 weeks, a ding; no nail (✗)
for (let k = 0; k < 5; k++) a(L(1) + 0.2 + k * 0.45, 'tick', 0.14); a(L(1) + 2.6, 'chime', 0.25); scribble(L(2) + 0.6);
// 4 · the rule card
paper(L(4) + 0.3); a(L(4) + 0.45, 'pop', 0.35);
// 5 · living bone: a heartbeat, labels
beat(L(5), D(5), 0.1); lab(5, 1.2); lab(5, 2.2);
// 6–7 · the break: a crack, blood seeping, the clot throbbing
a(L(6) + 0.1, 'clank', 0.18); a(L(6) + 0.5, 'slosh', 0.14); lab(6, 1.0); beat(L(7), D(7), 0.12); lab(7, 0.6);
// 8 · the clean-up cells: soft pops as they swallow
for (let k = 0; k < 5; k++) a(L(8) + 0.5 + k * 0.5, 'pop', 0.16); lab(8, 0.8);
// 9–10 · the soft bridge; the nose thumbnail
a(L(9) + 0.6, 'slosh', 0.12); lab(9, 1.6); lab(10, 0.3); a(L(10) + 1.2, 'pop', 0.3);
// 11 · concrete pouring
a(L(11) + 0.1, 'fill', 0.2, Math.min(3, D(11))); a(L(11) + 1.6, 'pop', 0.3);
// 12–13 · calcium settling (fine grains), the new bone; the weld thumbnail sizzles
a(L(12) + 0.6, 'toner', 0.18, 1.8); lab(12, 1.4); lab(13, 0.6); a(L(13) + 2.6, 'sizzle', 0.12, 1.2);
// 14 · it has knitted ✓
scribble(L(14) + 1.2); a(L(14) + 1.5, 'chime', 0.25);
// 15–17 · the extra bone; the eater gnaws, the builders tap
lab(15, 0.4); for (let k = 0; k < 6; k++) a(L(16) + 0.4 + k * 0.4, k % 2 ? 'tick' : 'snip', 0.14); lab(16, 0.6); lab(16, 1.6); for (let k = 0; k < 4; k++) a(L(17) + 0.6 + k * 0.35, 'thud', 0.12);
// 18 · months: the bulge shrinks
a(L(18) + 0.4, 'whoosh', 0.12, 1.6); paper(L(18) + 0.3);
// 19–21 · the cast myth crossed out; it only holds; your body heals
lab(19, 0.5); scribble(L(19) + D(19) - 1.1); a(L(20) + 0.3, 'whoosh', 0.12); a(L(20) + 0.8, 'pop', 0.3); a(L(21) + 0.4, 'chime', 0.22);
// 22 · recap 1–4
for (const dt of [0, 0.8, 1.6, 2.4]) a(L(22) + dt, 'pop', 0.3);
// 23–24 · every day; the skeleton renews over ten years (ticks), a ding
a(L(23) + 1.2, 'pop', 0.3); for (let k = 0; k < 10; k++) a(L(24) + 0.4 + k * 0.28, 'tick', 0.12); ding(L(24) + 3.2);

const MUSIC = has('music-soft') ? 'music-soft' : null;
if (MUSIC) rec(0, MUSIC, 0.42, 0, window.TIMING.duration + 2.5, 0.6);
fs.writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: !MUSIC, cues: c }, null, 1));
console.log(c.length + ' cues; kit clips here: ' + (['swipe', 'paper', 'pencil-scribble', 'ding', 'clock-ticking', 'space-drone', 'ocean-waves', 'water-rush', 'wind-gust', 'music-soft'].filter(has).join(', ') || 'none'));
