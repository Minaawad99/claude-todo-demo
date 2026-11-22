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
// 0–2 · hook card: the bulb pumping the cuff (soft squeezes), the eye crossed out, «120/80» lands
for (let k = 0; k < 6; k++) a(L(0) + 0.3 + k * 0.52, 'thump', 0.16);
scribble(L(1) + 0.4); ding(L(2) + 0.7);
// 4 · the heart: a heartbeat under the line, a label tick
for (let s = L(4) + 0.1; s < L(5) - 0.2; s += 0.83) a(s, 'thump', 0.28);
lab(4, 0.4); lab(4, 1.3);
// 5 · the rule card is pinned
paper(L(5) + 0.3); a(L(5) + 0.45, 'pop', 0.4);
// 6 · the mercury climbs to 120 mm
a(L(6) + 0.6, 'whoosh', 0.14, 1.6); ding(L(6) + 2.6); lab(6, D(6) * 0.7);
// 7–8 · the pressure wave draws, the two numbers land; a beat under it; the tap and hose
for (let s = L(7) + 0.2; s < L(9) - 0.2; s += 0.83) a(s, 'thump', 0.18);
a(L(7) + 1.5, 'pop', 0.35); a(L(8) + 0.4, 'pop', 0.35); rec(L(8) + 1.7, 'water-rush', 0.18, 3, 1.4, 1.0, 'slosh', 0.15);
// 9 · the cuff is pumped: soft squeezes, the artery shuts
for (let k = 0; k < 5; k++) a(L(9) + 0.2 + k * 0.45, 'thump', 0.14);
a(L(9) + 0.4, 'whoosh', 0.12, 2.0); lab(9, 0.5);
// 10 · the air hisses out; then a knock with each beat (the first sound the doctor hears)
a(L(10) + 0.1, 'hiss', 0.12, 1.7);
for (let s = L(10) + 1.7; s < L(11) - 0.1; s += 0.83) a(s, 'knock', 0.32);
ding(L(10) + 1.8);
// 11 · the knocks fade out, the blood runs smoothly
a(L(11) + 0.1, 'hiss', 0.1, 1.6); for (let k = 0; k < 2; k++) a(L(11) + 0.3 + k * 0.83, 'knock', 0.2 - k * 0.08);
rec(L(11) + 1.6, 'water-rush', 0.14, 3, D(11) - 1.6, 1.0, 'slosh', 0.12); ding(L(11) + 1.8);
// 12 · stethoscope knocks; then the monitor beeps and counts down
for (let s = L(12) + 0.2; s < L(12) + D(12) * 0.44; s += 0.83) a(s, 'knock', 0.26);
a(L(12) + D(12) * 0.45 + 0.1, 'beep', 0.22); a(L(12) + D(12) * 0.45 + 1.9, 'beep', 0.22); lab(12, D(12) * 0.45 + 1.0);
// 13–15 · the age bars rise
for (const i of [13, 14, 15]) { a(L(i) + 0.4, 'pop', 0.3); a(L(i) + 0.5, 'whoosh', 0.1, 0.8); }
lab(15, 0.3); paper(L(15) + D(15) * 0.6);
// 16 · the marker slides into the low zone
a(L(16) + 0.4, 'whoosh', 0.12, 1.4); ding(L(16) + 1.7);
// 17 · lying down, legs up; the glass of water
a(L(17) + 0.4, 'pop', 0.3); lab(17, 0.7); rec(L(17) + D(17) * 0.5 + 0.1, 'water-rush', 0.14, 3, 0.9, 1.0, 'slosh', 0.15);
// 18 · five minutes on the clock; the pills crossed out
rec(L(18) + 0.2, 'clock-ticking', 0.22, 0.1, Math.min(8, D(18) * 0.6), 1.0, null); scribble(L(18) + D(18) * 0.7);
// 19 · the danger number, the three signs, the ambulance arrives
ding(L(19) + 0.3); for (let k = 0; k < 3; k++) a(L(19) + 0.8 + k * 0.5, 'pop', 0.3);
a(L(19) + D(19) * 0.55, 'siren', 0.16, Math.max(1, D(19) * 0.45));
// 20 · three ticks for back, feet, arm; the heart line
for (let k = 0; k < 3; k++) scribble(L(20) + 0.3 + k * 0.5); a(L(20) + 1.6, 'whoosh', 0.1, 0.6);
// 21 · the hanging arm crossed out, +10 lands
scribble(L(21) + 0.5); ding(L(21) + 1.0);
// 22 · the headache crossed out; «القاتل الصامت»
scribble(L(22) + 2.4); paper(L(22) + 4.2);
// 23 · recap labels on the wave
lab(23, 0.3); lab(23, 1.6); ding(L(23) + D(23) * 0.65);
// 24 · Hales: the blood climbs the glass tube
lab(24, 0.8); a(L(24) + 2.2, 'whoosh', 0.14, 3.0); ding(L(24) + D(24) * 0.7);

// music plays only when sfx.py is run with --music, and that only when the user asked for music in this video
const MUSIC = has('music-soft') ? 'music-soft' : null;
if (MUSIC) rec(0, MUSIC, 0.42, 0, window.TIMING.duration + 2.5, 0.6);
fs.writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: !MUSIC, cues: c }, null, 1));
console.log(c.length + ' cues; kit clips here: ' + (['swipe', 'paper', 'pencil-scribble', 'ding', 'clock-ticking', 'space-drone', 'ocean-waves', 'water-rush', 'wind-gust', 'music-soft'].filter(has).join(', ') || 'none'));
