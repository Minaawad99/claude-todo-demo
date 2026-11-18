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
// 0–2 · hook: the sore spot throbs; the inset with the abscess; tweezers pull the hair out
a(L(0) + 1.2, 'bump', 0.25); a(L(0) + 2.4, 'bump', 0.22);
a(L(1) + 0.2, 'pop', 0.3); a(L(1) + 0.8, 'drip', 0.3); a(L(1) + 1.6, 'drip', 0.25);
a(L(2) + 0.3, 'snip', 0.3); a(L(2) + 1.0, 'whoosh', 0.12, 0.5);
// 4 · the body, the camera flies into the lower back; labels; the «nest» thumbnail
a(L(4) + 0.3, 'whoosh', 0.15, 1.2); lab(4, 1.4); lab(4, 1.9); paper(L(4) + D(4) - 1.6);
// 5 · cut hair drifts down into the cleft
for (let k = 0; k < 5; k++) a(L(5) + 1.0 + k * 0.9, 'tick', 0.12); lab(5, D(5) - 2.2);
// 6 · the hair magnified: scales; slides one way, ✗ the other
lab(6, 0.5); a(L(6) + 1.6, 'whoosh', 0.15, 0.6); scribble(L(6) + 2.8);
// 7 · rubbing pushes the hair in, step by step
for (let k = 0; k < 5; k++) a(L(7) + 1.0 + k * (D(7) - 1.6) / 5, 'squeeze', 0.12, 0.35); scribble(L(7) + D(7) - 1.3);
// 8 · the wheat ear climbs the sleeve
for (let k = 0; k < 4; k++) a(L(8) + 0.4 + k * 0.8, 'wipe', 0.14); lab(8, 0.6);
// 9–10 · inflammation, the pocket, the abscess
lab(9, 0.6); a(L(9) + 0.9, 'fizz', 0.12, 1.2); lab(9, 2.6);
a(L(10) + 1.6, 'slosh', 0.15, 1.2); a(L(10) + 2.4, 'bump', 0.25); lab(10, D(10) - 1.6);
// 11–12 · who: ×3, ages; hair, weight, long sitting (a clock ticks)
ding(L(11) + 1.8); a(L(11) + D(11) * 0.6, 'tick', 0.2);
paper(L(12) + 0.2); paper(L(12) + D(12) * 0.35); paper(L(12) + D(12) * 0.65); rec(L(12), 'clock-ticking', 0.18, 0.1, D(12), 1.0, null);
// 13–17 · the operations: the cut, drain; the block lifted out; gauze and weeks; the shallow closure; the scope and laser
a(L(13) + 1.6, 'snip', 0.35); a(L(13) + 2.4, 'drip', 0.3); a(L(13) + 3.0, 'drip', 0.25);
a(L(14) + 0.3, 'wipe', 0.15); a(L(14) + 1.6, 'whoosh', 0.18, 1.2); lab(14, 2.6);
paper(L(15) + 0.6); for (let k = 0; k < 4; k++) a(L(15) + 1.6 + k * (D(15) - 2) / 4, 'tick', 0.18);
a(L(16) + 1.0, 'squeeze', 0.15, 1.6); lab(16, 3.0); scribble(L(16) + D(16) - 1.2);
a(L(17) + 0.4, 'servo', 0.12, 0.9); a(L(17) + 1.8, 'laser', 0.22); a(L(17) + 2.2, 'charge', 0.12, 0.8); lab(17, 1.0);
// 18–19 · prevention: laser hair removal; clean, dry; stand up every hour
a(L(18) + 1.2, 'laser', 0.18); a(L(18) + 2.0, 'laser', 0.15); a(L(18) + 2.8, 'laser', 0.15); paper(L(18) + D(18) * 0.5);
scribble(L(19) + 0.6); scribble(L(19) + 1.0); a(L(19) + D(19) * 0.45, 'ping', 0.2); a(L(19) + D(19) * 0.45 + 1.0, 'whoosh', 0.12, 0.6);
// 20–21 · the myth crossed out; just under the skin
lab(20, 1.0); lab(20, 2.2); scribble(L(20) + D(20) - 0.9);
lab(21, 0.3); scribble(L(21) + 1.4); lab(21, 1.8); paper(L(21) + 2.4);
// 22 · recap builds: three boxes, then the cut
{ const c22 = [0, 0.2, 0.7]; a(L(22) + D(22) * 0.2, 'pop', 0.25); a(L(22) + D(22) * 0.2 + 0.8, 'pop', 0.25); a(L(22) + D(22) * 0.2 + 1.6, 'pop', 0.25); a(L(22) + D(22) * 0.7, 'whoosh', 0.15, 0.6); }
// 23 · the jeep bounces along; 70,000 counts up; «jeep disease»
a(L(23), 'idle', 0.12, D(23)); ding(L(23) + 2.4); paper(L(23) + 3.4);

// music plays only when sfx.py is run with --music, and that only when the user asked for music in this video
const MUSIC = has('music-soft') ? 'music-soft' : null;
if (MUSIC) rec(0, MUSIC, 0.42, 0, window.TIMING.duration + 2.5, 0.6);
fs.writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: !MUSIC, cues: c }, null, 1));
console.log(c.length + ' cues; kit clips here: ' + (['swipe', 'paper', 'pencil-scribble', 'ding', 'clock-ticking', 'space-drone', 'ocean-waves', 'water-rush', 'wind-gust', 'music-soft'].filter(has).join(', ') || 'none'));
