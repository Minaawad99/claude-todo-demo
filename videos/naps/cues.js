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

// ── «القيلولة»: one or two sounds per line, matched to what moves ──
// the alarm clock: a recorded ring (sfx/px-alarm-ring.mp3, asked from the user) or a synthesized bell-clapper stand-in
const alarm = (t, dur) => has('alarm-ring') ? rec(t, 'alarm-ring', 0.35, 0, dur, 1.0) : (() => { for (let s = 0; s < dur; s += 0.07) c.push({ t: +(t + s).toFixed(2), fx: 'bell', gain: +(0.09 * (1 - s / dur * .5)).toFixed(3), f: 2100 + (Math.round(s / 0.07) % 2) * 140, dur: 0.25 }); })();
// a soft snore under the sleeping shots (sfx/px-snore.mp3 when the user sends one; no stand-in)
const snore = (t, dur, g) => rec(t, 'snore', g || 0.22, 0, dur, 1.2);
const tickFor = (t, dur, g) => rec(t, 'clock-ticking', g || 0.22, 0.1, Math.min(8.6, dur), 1.0, null);
// 0–2 · hook: the clock runs on each line; up fresh (ding), up groggy (wobble), up and stretching (✓)
tickFor(L(0) + 0.1, L(3) - L(0) - 0.2, 0.18); snore(L(0) + 0.2, 1.4); snore(L(1) + 0.2, 1.4); snore(L(2) + 0.2, 1.0);
alarm(L(0) + 1.35, 0.5); ding(L(0) + 1.9);
alarm(L(1) + 1.8, 0.5); a(L(1) + 2.4, 'whoosh', 0.18, 1.0);
alarm(L(2) + 1.5, 0.5); scribble(L(2) + 1.9);
// 4 · the rule card
paper(L(4) + 0.3); a(L(4) + 0.45, 'pop', 0.4); snore(L(4), D(4), 0.15);
// 5 · the stairs draw themselves, two arrows
a(L(5) + 0.3, 'whoosh', 0.15, 2.0); lab(5, 1.2); lab(5, 2.7); a(L(5) + 3.0, 'pop', 0.3);
// 6–7 · walking down the steps, the minutes counter, then up to the dream landing
for (const [u0, u1] of [[0.2, 1.1], [1.8, 2.6], [3.0, 4.2]]) for (let s = u0; s < u1; s += 0.33) a(L(6) + s, 'tick', 0.12);
lab(6, 1.2); lab(6, 2.7); rec(L(6) + 4.2, 'space-drone', 0.1, 0.3, D(6) - 4.2 + 0.4, 1.2, 'hum', 0.08);
for (let s = 0.2; s < 2.2; s += 0.3) a(L(7) + s, 'tick', 0.12);
a(L(7) + 2.25, 'notify', 0.25); ding(L(7) + 2.8);
// 8, 12, 17 · the question clocks spin to 15, 60, 90
for (const i of [8, 12, 17]) { a(L(i) + 0.05, 'whoosh', 0.14, 0.6); tickFor(L(i), D(i), 0.25); a(L(i) + 0.45, 'pop', 0.35); }
// 9 · resting on the light steps; the dive is crossed out
snore(L(9), D(9), 0.15); a(L(9) + 0.6, 'pop', 0.3); scribble(L(9) + 2.2);
// 10 · someone calls, he climbs back up, ✓
a(L(10) + 0.3, 'notify', 0.3); for (let s = 1.2; s < 2.4; s += 0.3) a(L(10) + s, 'tick', 0.12); scribble(L(10) + 2.5);
// 11 · the power-nap band, two ✓
lab(11, 0.5); a(L(11) + 1.4, 'pop', 0.3); scribble(L(11) + 2.4); scribble(L(11) + 3.2);
// 13 · brain waves: a low hum under the slow ones
rec(L(13) + 1.3, 'space-drone', 0.12, 4, D(13) - 1.1, 1.2, 'hum', 0.1); a(L(13) + 0.3, 'pop', 0.25); a(L(13) + 1.4, 'pop', 0.3);
// 14 · the alarm rings in the basement, he is yanked up, dizzy
alarm(L(14) + 0.5, 1.1); a(L(14) + 1.5, 'whoosh', 0.3, 0.5); a(L(14) + 2.0, 'spin', 0.12, 1.2); a(L(14) + 2.6, 'pop', 0.3);
// 15 · groggy: a slow wobble, the 30-minute clock
a(L(15) + 0.3, 'spin', 0.1, 1.4); a(L(15) + 0.5, 'pop', 0.35); tickFor(L(15) + 1.4, D(15) - 1.4, 0.2);
// 16 · touching the deep step; better mood ✓, heavy ~
lab(16, 1.5); a(L(16) + 1.9, 'pop', 0.3); lab(16, 2.1); scribble(L(16) + 3.0); a(L(16) + 3.8, 'pop', 0.3);
// 18 · the whole cycle: steps all the way, the graph draws above
for (let s = 0.2; s < 3.4; s += 0.3) a(L(18) + s, 'tick', 0.11); ding(L(18) + 3.5);
// 19 · bulb, heart, battery charging
a(L(19) + 0.3, 'pop', 0.35); a(L(19) + 1.3, 'pop', 0.35); a(L(19) + 2.6, 'charge', 0.15, 1.2); a(L(19) + 3.8, 'chime', 0.22);
// 20 · the day line: the good nap ✓, the late one ✗, the night pushed later
a(L(20) + 0.3, 'pop', 0.3); scribble(L(20) + 0.6); a(L(20) + 0.9, 'pop', 0.3); a(L(20) + 1.6, 'whoosh', 0.15, 1.2); scribble(L(20) + 2.6);
// 21 · the myth line, crossed out; the real curve
a(L(21) + 0.2, 'whoosh', 0.12, 1.0); scribble(L(21) + 1.8); a(L(21) + 2.6, 'whoosh', 0.14, 1.0);
// 22 · ✓ light, ✗ deep (the alarm), ✓ dreams
scribble(L(22) + 0.4); alarm(L(22) + 1.0, 0.5); scribble(L(22) + 1.2); scribble(L(22) + 2.0);
// 23 · recap: 20 ✓, 90 ✓, 60 ✗
a(L(23) + 0.2, 'whoosh', 0.12, 0.8); scribble(L(23) + 2.4); scribble(L(23) + 4.3); scribble(L(23) + 5.2);
// 24 · NASA: cockpit hum, 26 minutes on the clock, +54% lands
rec(L(24), 'space-drone', 0.12, 8, D(24), 1.2, 'jet', 0.06); a(L(24) + 0.3, 'pop', 0.3); tickFor(L(24) + 2.6, 1.8, 0.2);
ding(L(24) + 0.2 + (T[24].end - T[24].start) * 0.53 + 1.5);

// music plays only when sfx.py is run with --music, and that only when the user asked for music in this video
const MUSIC = has('music-soft') ? 'music-soft' : null;
if (MUSIC) rec(0, MUSIC, 0.42, 0, window.TIMING.duration + 2.5, 0.6);
fs.writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: !MUSIC, cues: c }, null, 1));
console.log(c.length + ' cues; kit clips here: ' + (['swipe', 'paper', 'pencil-scribble', 'ding', 'clock-ticking', 'space-drone', 'ocean-waves', 'water-rush', 'wind-gust', 'music-soft'].filter(has).join(', ') || 'none'));
