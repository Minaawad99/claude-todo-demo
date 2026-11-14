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

// ── this episode: one or two sounds per line, matched to what moves. No music (the user asked for sound effects only). ──
const notify = t => a(t, 'notify', 0.3), pop = (t, g) => a(t, 'pop', g || 0.3), tick = (t, g) => a(t, 'tick', g || 0.16);
const clock = (t, dur) => { if (has('clock-ticking')) rec(t, 'clock-ticking', 0.28, 0.1, Math.min(8.6, dur), 1.0); else for (let s = t; s < t + dur; s += 0.5) tick(s); };
// 0–2 · opening card: the chat bubble, the phone buzzes on the ad, the search bar and keyboard crossed out
pop(L(0) + 0.3, 0.35); notify(L(1) + 0.15); lab(1, 1.3); ding(L(1) + 1.6);
scribble(L(2) + 0.2); scribble(L(2) + 0.9);
// 4–5 · the rule card; every action turns into a number cell
paper(L(4) + 0.4); scribble(L(5) + 1.0); [0.6, 1.6, 2.6, 3.6].forEach(dt => pop(L(5) + dt)); lab(5, 1.6);
// 6 · the like button, crossed out
lab(6, 0.3); scribble(L(6) + D(6) * 0.6);
// 7 · watch time: the stopwatch runs, the number lands
clock(L(7) + 0.3, D(7) - 0.3); ding(L(7) + D(7) - 0.5);
// 8 · finished ✓ / swiped ✗
scribble(L(8) + D(8) * 0.4); a(L(8) + D(8) * 0.72, 'whoosh', 0.2); scribble(L(8) + D(8) * 0.8);
// 9 · the shopkeeper's eye
pop(L(9) + 0.2); tick(L(9) + 0.5); tick(L(9) + 1.0); lab(9, 1.6);
// 10–12 · new videos: people like you, the rings 10 → 100 → 1,000
pop(L(10) + 0.2, 0.35); lab(11, 0.3); lab(11, 1.0); a(L(11) + 1.6, 'whoosh', 0.15, 1.2);
tick(L(12) + 0.2); pop(L(12) + D(12) * 0.55); ding(L(12) + D(12) * 0.75);
// 13 · the WSJ test: five phones, a clock
for (let k = 0; k < 5; k++) pop(L(13) + k * 0.15, 0.22); clock(L(13) + 0.4, D(13) - 0.6);
// 14–15 · the ad? then the link in the bio
notify(L(14) + 0.1); paper(L(15) + D(15) * 0.5); ding(L(15) + D(15) * 0.55);
// 16 · the Pixel code types itself, a third of popular sites
for (let s = 0.5; s < 1.7; s += 0.09) tick(L(16) + s, 0.1); ding(L(16) + D(16) * 0.58);
// 17 · the shop tells Facebook: data goes over, the ad lands on the phone
a(L(17) + 0.5, 'whoosh', 0.18, 1.0); a(L(17) + 0.9, 'hum', 0.08, 2.0); notify(L(17) + D(17) * 0.6);
// 18 · location pin, friends
pop(L(18) + 0.3, 0.35); [0.45, 0.6, 0.75].forEach(f => pop(L(18) + D(18) * f, 0.25));
// 19–20 · the mic myth crossed out; 17,260 apps fill in, none sent audio
a(L(19) + 0.3, 'hum', 0.07, 1.6); scribble(L(19) + D(19) * 0.75);
for (let s = 0.3; s < 1.9; s += 0.1) tick(L(20) + s, 0.08); ding(L(20) + 2.0); scribble(L(20) + D(20) * 0.7);
// 21 · log rows stack up
for (let k = 0; k < 9; k++) tick(L(21) + 0.4 + k * (D(21) - 1.4) / 9, 0.14);
// 22 · swipe fast, then «مش مهتم»
a(L(22) + 0.35, 'whoosh', 0.22); pop(L(22) + D(22) * 0.5); pop(L(22) + D(22) * 0.64, 0.4);
// 23 · recap: ① ② ③
lab(23, 0.2); lab(23, 1.3); lab(23, D(23) * 0.65);
// 24 · the sad feed: cards, the minutes count, 93%
for (let k = 0; k < 14; k++) tick(L(24) + k * 0.06, 0.1); clock(L(24) + (L(25) - L(24)) * 0.35, (L(25) - L(24)) * 0.3); ding(L(24) + (L(25) - L(24)) * 0.58);

fs.writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: false, cues: c }, null, 1));
console.log(c.length + ' cues; kit clips here: ' + (['swipe', 'paper', 'pencil-scribble', 'ding', 'clock-ticking', 'space-drone', 'ocean-waves', 'water-rush', 'wind-gust'].filter(has).join(', ') || 'none'));
