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
// caption-chunk start fractions as build.py writes them into the page
const PAGE = fs.readFileSync(__dirname + '/sketch/scenes.js', 'utf8'), CHM = PAGE.match(/^window\.CHUNKS = (.*);$/m);
window.CHUNK_F = (i, k) => { try { return JSON.parse(CHM[1])[i][k] || 0; } catch (e) { return 0.55; } };
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
// All the ant sounds here are synthesized in audio/sfx.py (made for this episode, no recordings): skitter (tiny feet),
// swarm (many ants), crunch (a sugar crystal), dab (the gaster tip taps the floor), shimmer (scent), sniff, step (a shoe),
// fade (scent evaporating), count (odometer click). The kit keeps only the series' own page flips, ding and scribble.
const CH = (i, k) => L(i) + (L(i + 1) - L(i)) * window.CHUNK_F(i, k);
// 0–2 · hook: the kitchen, then the line of ants marching to the sugar; eye and nose crossed out
a(L(1) + 0.1, 'skitter', 0.35, D(1) + D(2) - 0.2);
a(L(2) + 0.1, 'pop', 0.3); scribble(L(2) + 0.45); a(L(2) + 1.3, 'pop', 0.3); a(L(2) + 1.4, 'sniff', 0.3); scribble(L(2) + 1.65);
// bumper: the ant carrying its crystal
a(L(3) + 0.3, 'skitter', 0.25, 1.2);
// 4 · the rule card is pinned
paper(L(4) + 0.3); a(L(4) + 0.45, 'pop', 0.35);
// 5 · no sound (a wave crossed out), scent between the antennae
a(L(5) + 0.2, 'beep', 0.18); scribble(L(5) + 0.9); a(L(5) + 1.6, 'shimmer', 0.4, 1.4); a(L(5) + 1.9, 'pop', 0.3);
// 6 · 10 m on the plan, 3 mm inset; then the man walking 6 km
a(L(6) + 0.4, 'whoosh', 0.15, 1.2); a(L(6) + 1.2, 'pop', 0.3); lab(6, 0.25); lab(6, 0.65);
const m6 = CH(6, 2); for (let s = m6 + 0.3; s < L(7) - 0.1; s += 0.6) a(s, 'step', 0.3); ding(m6 + 1.0);
// 7–8 · scouts wander out, most come back with nothing
a(L(7) + 0.1, 'skitter', 0.35, D(7) + D(8) - 0.3); a(L(7) + 1.4, 'pop', 0.3);
scribble(L(8) + D(8) - 1.3);
// 9 · one bumps into the sugar, tastes it, takes a crystal
a(L(9) + 0.05, 'skitter', 0.3, 1.3); a(L(9) + 1.0, 'sniff', 0.2); a(L(9) + 1.9, 'crunch', 0.45); lab(9, 0.3); lab(9, 2.3);
// 10 · how will it get back? the winding path draws, a question mark
a(L(10) + 0.1, 'whoosh', 0.15, 1.1); a(L(10) + 0.5, 'pop', 0.3);
// 11 · it counts: odometer clicks and the home vector
for (let s = L(11) + 0.15; s < L(11) + 2.6; s += 0.09) a(s, 'count', 0.12); a(L(11) + 0.1, 'skitter', 0.25, 2.6);
// 12 · walking in the dark and counting: 20 steps right, 10 forward, then the straight way home
for (let k = 0; k < 10; k++) a(L(12) + 0.15 + k * 0.13, 'step', 0.22); for (let k = 0; k < 5; k++) a(L(12) + 1.55 + k * 0.19, 'step', 0.22);
a(L(12) + 2.5, 'whoosh', 0.15, 0.6); a(L(12) + 0.2, 'pop', 0.25);
// 13 · straight back to the nest ✓
a(L(13) + 0.5, 'skitter', 0.3, D(13) - 1.2); scribble(L(13) + D(13) - 0.8);
// 14 · the gaster tip taps the floor, again and again
for (const u of [0.37, 1.87]) { a(L(14) + u, 'dab', 0.55); a(L(14) + u + 0.05, 'shimmer', 0.18, 0.6); }
a(L(14), 'skitter', 0.22, D(14)); lab(14, 0.6);
// 15 · dab after dab, a line grows from the sugar
a(L(15) + 0.2, 'shimmer', 0.35, D(15) - 0.6); a(L(15) + 0.3, 'pop', 0.25);
for (let s = L(15); s < L(16); s += 0.1) { const ph = (s * 4.2) % (2 * Math.PI); if (Math.abs(ph - Math.PI / 2) < 0.21) a(s, 'dab', 0.3); }
// 16 · breadcrumbs, but scent
a(L(16) + 0.2, 'pop', 0.3); for (let k = 0; k < 4; k++) a(L(16) + 0.35 + k * 0.12, 'crunch', 0.15, 0.12); a(L(16) + D(16) - 1.2, 'pop', 0.3);
// 17 · the antennae: sniffing the trail
a(L(17) + 0.2, 'sniff', 0.4); a(L(17) + 1.0, 'sniff', 0.3); a(L(17) + 0.4, 'shimmer', 0.25, 1.6); lab(17, 0.3);
// 18 · the others follow the line out
a(L(18) + 0.1, 'skitter', 0.4, D(18) - 0.2);
// 19 · each one lays its own scent: dabs from two ants, the scent meter rises
for (const u of [0.02, 0.37, 1.51, 1.87, 3.0]) if (u < D(19) - 0.1) a(L(19) + u, 'dab', 0.45);
a(L(19) + 0.3, 'shimmer', 0.3, D(19) - 0.4);
// 20 · the line gets stronger, more and more ants
a(L(20) + 0.1, 'swarm', 0.35, D(20)); a(L(20) + 0.2, 'shimmer', 0.3, D(20) - 0.3);
// 21 · two routes: the short one wins
a(L(21) + 0.2, 'skitter', 0.3, D(21) - 0.3); lab(21, 0.8); lab(21, 1.0); a(L(21) + 1.3, 'shimmer', 0.35, D(21) - 2); ding(L(21) + D(21) - 1.2);
// 22 · the myth: a sight line crossed out, then the trail ✓
a(L(22) + 0.3, 'whoosh', 0.15, 0.8); scribble(L(22) + 2.0); a(L(22) + D(22) * 0.62, 'shimmer', 0.3, 1.2); scribble(L(22) + D(22) * 0.62 + 0.4);
// 23 · sugar gone, the scent evaporates, the line melts away
a(L(23) + 0.3, 'pop', 0.3); a(L(23) + 1.2, 'fade', 0.45, D(23) - 1.4); a(L(23) + 1.2, 'skitter', 0.25, D(23) - 1.4);
// 24 · the recap: numbered steps pop in
for (const u of [0.2, 1.2, 2.4, 3.5]) a(L(24) + u, 'pop', 0.35); a(L(24), 'skitter', 0.18, D(24));
// 25 · the death spiral: ants circling and circling
a(L(25) + 0.3, 'swarm', 0.4, D(25) - 0.4); a(L(25) + 1.0, 'whoosh', 0.15, 0.8); a(L(25) + 2.2, 'pop', 0.3); ding(L(25) + D(25) - 2.6);

// music plays only when sfx.py is run with --music, and that only when the user asked for music in this video
const MUSIC = has('music-soft') ? 'music-soft' : null;
if (MUSIC) rec(0, MUSIC, 0.42, 0, window.TIMING.duration + 2.5, 0.6);
fs.writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: !MUSIC, cues: c }, null, 1));
console.log(c.length + ' cues; kit clips here: ' + (['swipe', 'paper', 'pencil-scribble', 'ding', 'clock-ticking', 'space-drone', 'ocean-waves', 'water-rush', 'wind-gust', 'music-soft'].filter(has).join(', ') || 'none'));
