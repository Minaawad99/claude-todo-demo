---
name: sketch
description: >
  Make an «إيه الحكاية؟» explainer video in the user's «اسكتش» style, end to end: script, voice, real-shape drawings, sound
  effects only (no background music unless the user asks for it for that video), 1080×1920 60 fps render that passes qa.py, then the reel cover and the TikTok / Instagram+Facebook /
  YouTube Shorts titles, every time. Cream graph-paper card, close-up technical drawings (real
  coastline globes, side cuts, isometric machines) with leader-line labels, one short caption chunk at a time under a rule,
  no hard cuts, a word-by-word hook card, a stopwatch bumper, a summary card and ask box. The reference episode is
  «المد والجزر» (videos/tides). Built on videos/_templates/sketch. Use when the user says "اسكتش", "بأسلوب الاسكتش",
  "زي فيديو المد والجزر", "بالرسم الهندسي", "زي طب إزاي" or "sketch style".
---

# «إيه الحكاية؟» — the «اسكتش» style

**The user named this style «اسكتش»** and locked it after «المد والجزر». Use the same drawings, narration and sounds in
every episode.

**Locked by the user after «لو حد شرق قدامك» (`videos/choking/`), for every sketch episode from now on:**
1. **The drawing style of that episode**, including people drawn with real body proportions (section 3).
2. **No background music.** Not the music box, not any other bed. The sound is the narrator plus sound effects only.
   The one exception is the user asking for music in a specific video (section 5); it doesn't carry over to the next one.
3. **You make the sound effects** from the kit, the episode's own clips and `audio/sfx.py`'s synthesized ones. When a moment
   needs a real recording the kit doesn't have, ask the user for it by name with Pixabay search terms; they fetch it.
4. **Always finish with the reel cover and the titles** (section 7), without being asked: TikTok, Instagram (shared to the
   Facebook page) and YouTube Shorts. It copies the look, pacing and narration of the «طب إزاي؟» series: 20 reference videos, measured in
`videos/_reference/tabizzay/STYLE.md`, with contact sheets, motion strips and transcripts. We make it under our own name.

**The reference episode is `videos/tides/`.** Start every new episode from a copy of these files:
- `script.txt` and `style.txt`;
- `sketch/episode.py` and `sketch/shots.js`;
- `cues.js` and `refs/SOURCES.md`.

The shared parts are in `videos/_templates/sketch/` (its README lists every helper). Talk to the user in Egyptian Arabic.

## 0. First question (every new topic)

Ask in one question: quick mode or full review (as in `.claude/skills/animation/SKILL.md`). For the tides episode the user
chose full review, because the drawings must look real. With full review you look at reference photos and frame strips,
and fix them.

## 1. Script → `videos/<slug>/script.txt`

**Length:** about 25–27 lines and 260–280 words. The voice comes out about 2:00 raw, and about 1:45 after tightening and the 5% tempo.

**The fixed spine:**
1. **Hook:** a fact from the viewer's own life, then its contradiction, spoken to «you», over 2–3 lines. These lines are
   the hook card. Example: «لو قعدت على شط البحر من الصبح لحد بالليل… / هتلاقي المية بتعلى… / ومن غير ريح ولا موج.»
2. **Promise:** «إيه الحكاية؟ هشرحهالك في دقيقة.»
3. **Optional rule:** «قبل ما نشرح محتاجين نوضّح قاعدة صغيرة… خليك فاكرها.», with one law.
4. **The steps:** each opens with a «طب…؟» question, then the answer, then a home analogy «زي…».
5. **«ونتيجة لإيه»:** what else drives it, and what changes it.
6. **The myth:** «وناس كتير فاكرة إن… لأ.»
7. **The recap:** «يعني من الآخر…» in 3–4 short clauses.
8. **The odd fact:** «والأغرب…»
9. **Sign-off:** «ودي كانت حكاية …»
10. **Last line:** «قولولنا، عايزين تعرفوا حكاية إيه المرة الجاية؟»

**Wording:**
- Numbers are words in the script and digits in the caption, set with `CAPTEXT` in `episode.py`.
- Short phrases; the template splits each line into caption chunks of about 5 words.
- Check every fact. Tell the user which ones are surprising and that they were checked.
- Run the script through the `humanizer` skill. Keep the series devices above word for word.
- Give the script in one copy-ready code block, then commit it.

## 2. Voice

**Settings:** Puck, model `gemini-3.8-flash-tts`, temperature 1:

```
python3 ../tools/tts.py script.txt style.txt voice-raw.wav --voice Puck --model gemini-3.8-flash-tts
```

**When the free quota is gone** (HTTP 429, it resets about 10:00 Cairo time): don't retry. Give the user the script and
the style in two code blocks for Google AI Studio. Settings: Single-speaker, Puck, Temperature 1, WAV. The tides voice was
made this way. The style text, with the topic and key words filled in:

```
Speak in casual Egyptian Arabic (Cairo dialect), like a calm, confident teacher explaining to a friend <topic>. Warm and clear, more teacher than hype, with quiet amazement on the surprising facts and numbers. Natural, relaxed conversational speed, not rushed. Take a short natural breath between sentences, and don't stop at commas. Emphasize key words like <word>, <word>, <word>. Make the opening line intriguing and the question "إيه الحكاية؟" playful. Never use Modern Standard Arabic pronunciation; pronounce ق as a glottal stop like Cairenes. Keep the exact same Cairene Egyptian accent and the same voice from the first word to the last, never drifting into another dialect.
```

- **Keep this style text as it is.** Only the topic, the key words and a note on the opening (a warning, a question) change.
  Asking for a "reel narrator", a "brisk" or "fast" delivery made the take drift into two accents in «الموبايل في الشاحن»,
  and the user rejected it. Speed comes from the edit below, never from the style text.

**Pace (locked by the user after «الموبايل في الشاحن», for every sketch episode).** The user's reference is a «طب إزاي»
reel on gastric sleeve surgery: about 176 words a minute, pauses about 0.15 s. Ours matches it with pauses capped at
**0.12 s** and the take sped up **5%** with `atempo` (pitch unchanged): about 172 words a minute. Use exactly these
numbers; don't go back to 0.3 s or to an untouched tempo.

**Timing.** The whisper-small model for `align_asr.py` comes from Hugging Face; GitHub releases often answer 504 here.

```
M=<scratchpad>/asr/sherpa-onnx-whisper-small   # small-encoder.int8.onnx, small-decoder.int8.onnx, small-tokens.txt from huggingface.co/csukuangfj/sherpa-onnx-whisper-small
python3 ../audio/tighten.py voice-raw.wav <scratchpad>/tight.wav --max 0.12
ffmpeg -y -i <scratchpad>/tight.wav -af atempo=1.05 voice.wav
python3 ../align_asr.py voice-raw.wav script.txt raw-timing.json --model $M --gap 0.08 --db -34
python3 ../map_timing.py voice-raw.wav raw-timing.json voice.wav timing.js --max 0.12 --tempo 1.05
```

- **Check the whole take with the stronger model** to catch invented sentences and misread numbers:
  `~/.cache/hyperframes/whisper/whisper.cpp/build/bin/whisper-cli -m ~/.cache/hyperframes/whisper/models/ggml-large-v3-turbo.bin -l ar` (16 kHz mono). If the model is missing, fetch `ggml-large-v3-turbo-q5_0.bin` from
  huggingface.co/ggerganov/whisper.cpp.
- **Fix line boundaries by hand** in `raw-timing.json` where whisper-small drifts. Tides: line 23 started 0.7 s early.
- **The tempo is 1.05, never more.** If the voice is still long, cut words from the script.
- **Send the voice to the user before drawing.** They listen for the accent and the pace; you can't hear either.
- Tell the user any second that needs their ear (tides: «4 سنتي» heard as «4 سنة»).

## 3. Drawings: real shapes, the reference's hand

- **Research first.** Look at real photos of the objects (Wikimedia Commons, one request at a time, User-Agent with the
  repo URL). Look at the matching reference sheet in `videos/_reference/tabizzay/sheets/` as well. Note the sources in
  `refs/SOURCES.md`.
- **Globes use real coastlines.** `globe(cx, cy, r, lon, lat, {dot})` projects Natural Earth through `lib/geo.min.js`, which
  loads by default. It draws:
  - pale blue ocean, olive land and a graticule;
  - a hatched night side and a thin atmosphere ring.

  `lat ≈ 72` is the view from above the North Pole. Use it whenever the Earth turns.
- **Choose the view that shows the change** (the user's rule):
  - a level going up and down (sea, water in a tank, a fill) is drawn **from the side, at eye level**, as a cut through
    the ground. Not from above, where it doesn't show. Tides: `beachSide()` has the sand bed with layers, the sea climbing
    the slope, wet sand, a pier in profile, a tide staff and a boat aground or afloat;
  - machines, rooms and cities are **isometric or three-quarter**;
  - things with insides are **cut-aways**;
  - waves and graphs are **flat side views**.
- **The look.** All of it is in the template and the helpers.
  - **Colours:**
    - paper `#eee5d0` with a faint grid, ink `#2a2016`;
    - accents only on what is being said: orange `#bd552f` for action, heat or the key number; olive `#5e653a` for the
      named part; slate blue `#4a6f8a` for water, air or the term;
    - muted body colours.
  - **Lines and fills:** ink lines 1.5–2 px, flat fills, light hatching, no gradients, no cartoon faces.
  - **Framing:** close-ups that the panel edge crops.
  - **Marks:**
    - leader-line labels (`label`);
    - a framed analogy thumbnail in a corner (`iconBox`);
    - ✗ / ✓ (`cross`, `check`);
    - big serif numbers that count up (`count`, `bigNum`, `numBox`);
    - Arabic words in a box (`tag`);
    - dimension lines (`measure`).
- **People: real body proportions** (the user's rule). Never stick figures or guessed sizes. Copy `fig()`, `limb()`, `ik()`,
  `rel()` and the `HB` table from `videos/choking/sketch/shots.js`. They follow Drillis & Contini segment lengths as
  fractions of the height H (H = 400 units):
  - heights: ankle 0.039H, knee 0.285H, hip joint 0.52H, shoulder 0.818H, chin 0.87H;
  - segment lengths: thigh 0.245H, shank 0.246H, foot 0.152H, upper arm 0.186H, forearm 0.146H, hand 0.108H;
  - side depths: chest 0.13H, waist 0.115H, seat 0.14H; the head is 0.115H deep and 0.13H tall.

  Furniture is to the same scale: a table 0.43H, a chair seat 0.25H. Put the hip at `floor − 212·s` so the feet stand on
  the floor. Place hands with `rel(h, side)` (a point h above the hip, to the front or the back) so they land on the real
  spot: throat, between the shoulder blades, above the navel, mid-chest. People are flat salmon-skinned side views as in
  reference v20, with no faces beyond a nose, an ear and a hair cap. A body cut uses the real anatomy from a reference
  picture (`throat()` in the same file: windpipe in front, gullet behind, epiglottis on the voice box).
- **Shots:** one `shot()` per idea, usually per line, sometimes per caption chunk (`[line, chunk]`).
  - Transitions: `tr: "fade"`, or `"in"` / `"out"` when the camera flies into a detail or pulls back. There are no hard cuts.
  - `hud(from, to, draw)` holds a dial, chip or checklist over several shots.

## 4. Motion (qa.py must PASS)

- **The template's built-in motion** is tuned so that calm shots still pass qa.py:
  - the camera drift;
  - the intro-art sway and the bumper push-in with its sweeping stopwatch hand;
  - the end-card drift and the linear card crossfades.

  Don't weaken it.
- **Sparse shots need their own life.** The tides fixes, any of which works:
  - balls bob and arrows pulse;
  - globes turn about 1.6°/s, or 22°/s for the polar spin;
  - bulges breathe;
  - waves run at about 48–70 px/s;
  - a moving wave line goes over a static arrow.
- **Before every render** run `node tools/stills.js <abs index.html> 0 <duration>`. It uses qa.py's own metric over the full
  frame. Fix every run until none is over 0.5 s. A failed 20-minute render costs far more.
- Check frames with `node tools/strip.js <abs index.html> out.png 6 <times…>` and look at them (full review).

## 5. Sound

**The kit is in the repo:** `videos/_templates/sketch/sfx/` (committed at the user's request, about 11 MB). `cues.js` finds
a clip in the episode's own `sfx/` first and then in the kit, so a new episode needs nothing copied. **You make the sound
effects.** Ask the user only for real recordings the kit doesn't have (a cough, a cork, a siren…): one table of the moment,
the sound and Pixabay search terms, sent once the picture is done and before the final mix. Their clips go in
`<episode>/sfx/` as `px-<name>.mp3` and are committed, so nobody asks for them again. Measure each clip's clean part with
`silencedetect`, slice it in `rec()`, and credit it in `refs/SOURCES.md`. Every clip still has a synthesized stand-in.
`videos/choking/cues.js` shows recordings timed to the drawing (one blow per beat, a breath per thrust).

| file | Pixabay title (the one the user picked) | slice | use |
|---|---|---|---|
| px-swipe | Paper Flipping (koiroylers 351981) | 0.60–1.02 s | every shot change |
| px-paper | Paper Slide Short (oxidvideos 478835) | 0–0.5 s | a card laid down, the ask box |
| px-pencil-scribble | Pencil on Paper Scribble 2 (68772) | 0.75–1.5 s | ✗ / ✓ |
| px-ding | Minimal Ding SFX (virtual_vibes 383725) | 0.1–1.5 s | a key number lands |
| px-clock-ticking | Clock Ticking Down (Dragon Studio 376897) | ≤ 8.6 s | time |
| px-space-drone | Industrial Pulse Drone (27456) | very low | globes, space |
| px-ocean-waves | Ocean Waves (Dragon Studio 376898) | 0.2–22 s | sea |
| px-water-rush | Above Rushing Water (61158) | from 3 s | water moving |
| px-wind-gust | Wind Gust (Dragon Studio 386158) | 0.25–4.76 s | wind |
| px-music-box (source) → px-music-soft | **Mysterious Music Box – The Midnight Hour** | whole | music, **only when the user asks** |

**Sound without asking: sound effects only (the user's fixed rule, for every video in every skill).** Without the user's
permission you may add only sound effects (swipes, ticks, dings, whooshes, and effects you synthesize such as a buzz).
Never add background music of any kind (a kit track, a synthesized bed, a generated or licensed track) unless the user
asks for it for that video; asking once does not carry over to the next video. `videos/audio/sfx.py` leaves all music
out unless run with `--music`, so pass that flag only when the user asked.
- `sfx.py` leaves all music out by default (it prints «music off»). Don't pass `--music`.
- Only when the user asks for music in a given video: run `sfx.py` with `--music`. `cues.js` then adds the kit's
  `px-music-soft.mp3` at gain 0.42 (about 22 dB under the narrator; 153 s long, no loop needed under about 2:30).
- Asking for music once does not carry over to the next video.

**Cues.** Start from `videos/_templates/sketch/cues.js`. It already places these:
- the hook chime;
- the bumper ticks;
- a flip for every shot change;
- the summary-card build;
- the ask box.

It holds no music unless `sfx.py` is run with `--music`.

Add one or two sounds per line matched to what moves (`lab`, `ding`, `scribble`, `paper`, `sea`, `drone`; see
`videos/tides/cues.js`), then:
`node cues.js && python3 ../audio/sfx.py voice.wav cues.json <scratchpad>/<slug>-mix.wav`.

Credit every clip in `refs/SOURCES.md`.

## 6. Render and QA (in the background, about 20 minutes for a 106 s video)

```
TAIL=3 node render.js $PWD/<slug>/sketch/index.html <mix.wav> <scratchpad>/<slug>.mp4
ffmpeg -y -i <mp4> -c:v copy -af "volume=1.6dB,alimiter=limit=0.6:level=false:attack=1:release=60" -c:a aac -b:a 192k -ar 48000 <fixed.mp4>
python3 qa.py <fixed.mp4>
```

- **QA must say PASS:** no still over 0.75 s, frozen total inside the budget, loudness about -14/-15 LUFS.
- **Send the video** with SendUserFile under an Arabic name, e.g. `<الموضوع>-إيه-الحكاية.mp4`.
- **Code:** commit and push it. Keep the mp4 and the mix in the scratchpad.
- **A sound-only change** doesn't need a render: remux the new mix onto the video with the same audio chain.
- Without music the mix sits about 1.5 dB lower, hence `volume=1.6dB` before the limiter (choking: -15.3 LUFS, PASS).

## 7. Cover and titles (always, right after the video)

Send the cover and all the titles together with the finished video, in the same reply, without being asked and without
waiting for recorded sounds (the user confirmed this again after «لو عربيتك وقعت في المية»). Sounds can be swapped in
later by a remux; the cover and titles don't change.

**Cover.** Copy `brand/eh-elhekaya/cover-choking-tiktok.html` to `cover-<slug>-tiktok.html`. It loads the episode's
`timing.js` and `sketch/scenes.js` and draws with the episode's own helpers. The layout is full bleed, 540×960 (1080×1920
at 2x):
- **Background:** dark slate `#1b1d22` with a faint grid, and one warm yellow glow behind the main drawing.
- **The drawing:** the main drawing big in the middle, showing the move or the mechanism the video teaches.
- **Inset and tags:** one magnified inset circle on the key detail, ringed in orange, and one or two tags with the key
  numbers.
- **Fades:** dark at the top (0–300) and the bottom (680–960).
- **Text:** all Noto Sans Arabic.
  - «إيه الحكاية؟» 15px at the top (y 132);
  - the hook 900 40–42px in white (y 154);
  - a yellow 800 24px sub-title (y 210);
  - the punch line at y 722, 34px, with the number in yellow and a grey second line.
- **Safe area:** everything that matters stays inside y 120–840, which is also Instagram's 3:4 grid crop, and the text box
  is `left: 24px; right: 64px`.

Shoot it with `node videos/tools/cover.js <abs html> <abs brand/eh-elhekaya/tiktok-cover-<slug>-1080x1920.png>`. Look at it
and check that the inset doesn't hide a face or a hand. Then commit and send it.

**Titles** (Egyptian Arabic, run through the `humanizer` skill, each in its own code block):
- **TikTok:** 3 hook titles to choose from, then a description with the steps or the key fact and hashtags, `#إيه_الحكاية`
  first.
- **Instagram Reel, shared to the Facebook page:**
  - a caption with a short hook, the key steps on their own lines, «احفظ الفيديو وابعته لحد…» and 4–5 hashtags;
  - a longer Facebook description: 3–4 emoji points of what the video covers, the odd fact and the closing question. The
    user pastes it into the Facebook reel with Edit after it is published;
  - a short comment to pin.
- **YouTube Shorts:** one title ending in `#shorts` and a two-line description.

**Posting steps.** Remind the user briefly how to post:
- **TikTok:** title, then description and hashtags in the caption; cover from the image; no ads disclosure; turn on the AI
  label and high-quality upload.
- **Instagram:** Reel; cover from the camera roll (the 3:4 crop is safe); Share to Facebook, choosing the channel's page;
  AI label; highest quality.
- **Facebook:** don't upload it to the page again.

The older «الرسم الهندسي» build (`videos/_templates/diagram-v1/`, `videos/xray-diagram/`) stays only for the X-ray video.
