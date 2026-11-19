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
// heel taps: the bouncing heel lands on the floor 2.3 times a second (bounce() in shots.js lands at whole multiples of 1/2.3 s)
const taps = (t0, t1, g) => { for (let k = Math.ceil(t0 * 2.3); k / 2.3 < t1; k++) a(k / 2.3, 'bump', g); };
const beat = (t, dur, g) => rec(t, 'heartbeat', g || 0.25, 0, dur, 1.0, 'bump', 0.15);
// 0–2 · hook: the leg bouncing under the desk, «بطّل!», the inset into the calf
taps(L(0) + 0.2, L(PROMISE), 0.07); a(L(1) + 0.15, 'pop', 0.3); a(L(2) + 0.1, 'whoosh', 0.15); a(L(2) + 0.6, 'pop', 0.25);
// 4–6 · the study: the clock runs, the gauges fall and rise
rec(L(4) + 0.1, 'clock-ticking', 0.25, 0.1, D(4) + 0.2, 1.0, null); paper(L(4) + 0.9);
a(L(5) + 0.9, 'squeeze', 0.12, 1.4); scribble(L(5) + 2.6); ding(L(5) + 2.5);
a(L(6) + 0.5, 'chime', 0.22); scribble(L(6) + 2.0);
// 7–8 · heart and legs; the blood runs down with gravity
{ const d7 = T[7].end - T[7].start; lab(7, d7 * 0.1455); beat(L(7) + d7 * 0.1455, D(7) - d7 * 0.1455 + 0.3, 0.22); a(L(7) + d7 * 0.4727, 'whoosh', 0.12); }
rec(L(8) + 0.3, 'water-rush', 0.1, 3, D(8), 1.0, 'fill', 0.1); a(L(8) + 1.4, 'whoosh', 0.14);
// 9–12 · how does it get back up? the pressure is spent; it pools; the artery gets lazy
a(L(9) + 0.5, 'pop', 0.3);
paper(L(10) + 0.3); beat(L(10), D(10) * 0.5, 0.18); paper(L(10) + D(10) * 0.45);
a(L(11) + 0.6, 'slosh', 0.12, 2.4); lab(11, 1.6);
paper(L(12) + 0.2); lab(12, D(12) * 0.45);
// 13–17 · the calf, the valves, the pump, the toothpaste tube
a(L(13) + 0.3, 'pop', 0.25); ding(L(13) + (T[13].end - T[13].start) * 0.6667);
lab(14, 0.3); lab(14, D(14) * 0.5); a(L(14) + D(14) * 0.65, 'pop', 0.2);
a(L(15) + 0.5, 'squeeze', 0.2, 0.8); a(L(15) + 0.8, 'whoosh', 0.16, 1.6); lab(15, 1.0);
a(L(16) + 0.4, 'thud', 0.15); lab(16, 0.9); scribble(L(16) + D(16) * 0.6);
a(L(17) + 0.4, 'squeeze', 0.18, D(17) - 0.8); a(L(17) + 0.3, 'pop', 0.2);
// 18–19 · the bounce is the calf: heel taps; the second heart beats
taps(L(18) + 0.2, L(19) + 0.2, 0.08); a(L(18) + 0.6, 'pop', 0.25);
beat(L(19), D(19) + 0.3, 0.3); a(L(19) + D(19) * 0.5, 'pop', 0.25);
// 20–21 · the myth crossed out; the blood stays down
a(L(20) + 0.5, 'pop', 0.25); scribble(L(20) + D(20) - 1.2); paper(L(20) + D(20) - 0.8);
scribble(L(21) + 0.3); paper(L(21) + 0.6);
// 22–23 · the recap
a(L(22) + 0.2, 'pop', 0.25); paper(L(22) + 1.2);
a(L(23) + 0.2, 'pop', 0.25); taps(L(23) + 0.2, L(24) - 0.2, 0.05); paper(L(23) + 0.4); a(L(23) + D(23) * 0.5, 'pop', 0.25);
// 24 · the soldier faints, the inset, the brain
{ const c24 = [0, 0.3, 0.6, 0.8]; const d24 = T[24].end - T[24].start; a(L(24) + d24 * 0.4065 + 1.05, 'thud', 0.3); a(L(24) + d24 * 0.5935, 'whoosh', 0.14); a(L(24) + d24 * 0.813, 'pop', 0.22); }

// music plays only when sfx.py is run with --music, and that only when the user asked for music in this video
const MUSIC = has('music-soft') ? 'music-soft' : null;
if (MUSIC) rec(0, MUSIC, 0.42, 0, window.TIMING.duration + 2.5, 0.6);
fs.writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: !MUSIC, cues: c }, null, 1));
console.log(c.length + ' cues; kit clips here: ' + (['swipe', 'paper', 'pencil-scribble', 'ding', 'clock-ticking', 'space-drone', 'ocean-waves', 'water-rush', 'wind-gust', 'music-soft'].filter(has).join(', ') || 'none'));
