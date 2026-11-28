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

> **People: the Gemini person kit, in this skill and every other (the user's fixed rule, Nov 2026; it overrides every
> mention of `person.js`, `PERSON.front` or `PERSON.side` below).** Every human comes from
> `videos/_templates/people/gemini/` (read its `README.md`, see `catalog.png`): load `gemini/sprites.js` and place
> figures with `PERSON.sprite(name, x, feetY, height, { t: window.__t })`. **The channel's main character is the host**
> (`host-*`: open slate-blue shirt, sleeves rolled to the elbow, white T-shirt, khaki chinos, white sneakers, short hair
> combed back; the user's choice, no galabeya), used in every episode;
> other people in a story come from the outfit sets (`a-/b-/c-office`, `-doctor`, `-worker`, `-home`, `-woman-hijab`…).
> A pose the kit lacks: write the pose-sheet prompt from that README (attach `gemini/sheets/s9-host.jpg`), ask the user to run
> it in Gemini (or run it through the Gemini API if image quota allows), cut it with `cutout.py`, add the sprites, never
> draw a person by code. Keep the old vector kit only when editing an episode already made with it.

**Reference before every drawing (the user's rule for every skill):** before you draw any object, body part, machine, place or scene, look it up in `videos/_reference/README.md` (a subject index of the 34 reference videos and of our own episodes), open the frames that show it and see how it was cut open, labelled and framed. Then draw it in this skill's own style. Never copy a drawing.

**The user named this style «اسكتش»** and locked it after «المد والجزر». Use the same drawings, narration and sounds in
every episode.

**Locked by the user after «لو حد شرق قدامك» (`videos/choking/`), for every sketch episode from now on:**
1. **The drawing style of that episode.** People are drawn only with the shared person kit `videos/_templates/people/person.js`
   (section 3; the user's rule for every skill).
2. **No background music.** Not the music box, not any other bed. The sound is the narrator plus sound effects only.
   The one exception is the user asking for music in a specific video (section 5); it doesn't carry over to the next one.
3. **You make the sound effects** from the kit, the episode's own clips and `audio/sfx.py`'s synthesized ones. When a moment
   needs a real recording the kit doesn't have, ask the user for it by name with Pixabay search terms; they fetch it.
4. **Always finish with the reel cover and the titles** (section 7), without being asked: TikTok, Instagram (shared to the
   Facebook page) and YouTube Shorts. It copies the look, pacing and narration of the «طب إزاي؟» series: 20 reference videos, measured in
`videos/_reference/tabizzay/STYLE.md`, with contact sheets, motion strips and transcripts. We make it under our own name.

**The reference episodes are `videos/tides/` (drawings) and `videos/laser-hair/` (the current pace: voice, short
cuts, steady frame, calm life, flies in and out).** The tides files: Start every new episode from a copy of these files:
- `script.txt` and `style.txt`;
- `sketch/episode.py` and `sketch/shots.js`;
- `cues.js` and `refs/SOURCES.md`.

The shared parts are in `videos/_templates/sketch/` (its README lists every helper). Talk to the user in Egyptian Arabic.

## 0. First question (every new topic)

Ask in one question: quick mode or full review (as in `.claude/skills/animation/SKILL.md`). For the tides episode the user
chose full review, because the drawings must look real. With full review you look at reference photos and frame strips,
and fix them.

## 1. Script → `videos/<slug>/script.txt`

**Length:** about 25–27 lines and 230–260 words (the faster «الليزر» pace: 238 words came out 1:25 after tightening).
Captions in short chunks: `"chunk": 3.5` in `CFG`, and `SPLIT` for any chunk over 4 words.

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

**The voice style is the «طب إزاي؟» pace (the user's rule after «الليزر», `videos/laser-hair/style.txt`):** a young,
upbeat creator talking to a friend, quick and punchy, very short breaths between sentences, a lift on every «طب…؟».
Measured on the user's reference (the gastric-bypass «طب إزاي؟» video): about 157 words a minute, median pause 0.17 s;
the speed you feel comes from the tiny pauses and the short caption cards, not from talking faster. The style text, with
the topic, the person spoken to and the key words filled in (`style.txt`):

```
Speak in casual Egyptian Arabic (Cairo dialect), like a young, upbeat science creator explaining to a friend <topic>. Energetic and clear, friendly peer more than lecturer, with a quick, punchy rhythm of about 160 words per minute. Keep pauses between sentences very short, just a quick breath, so each sentence flows into the next; never stop at commas. Every question that starts with "طب" gets a quick upward lift, then the answer follows right away. Stress key words like <word>, <word>, <word>. Make the opening line intriguing and the question "إيه الحكاية؟" playful. Never use Modern Standard Arabic pronunciation; pronounce ق as a glottal stop like Cairenes.
```

- **Who is spoken to:** when the topic's audience is mostly women (laser, beauty, pregnancy…), write the script in the
  feminine (عملتي، إنتي، محتاجة، بتستني، بشرتك) and add to the style «explaining to a female friend (he addresses her in
  the feminine: …)». The narrator stays the male Puck voice (the user's choice). Draw the person as the kit's woman
  (`outfit: "woman"` / `"womanCasual"`).
- **Tightening:** `tighten.py --max 0.2` (not 0.3), then `map_timing.py … --max 0.2`. Never speed the voice up.
- **Check the take** by transcribing it (Gemini `gemini-3.5-flash` with the audio inline works when the whisper models
  are missing) and compare it with the script line by line.

**When the free quota is gone** (HTTP 429, it resets about 10:00 Cairo time): don't retry. Give the user the script and
the style above in two code blocks for Google AI Studio. Settings: Single-speaker, Puck, Temperature 1, WAV.

**Timing.** The whisper-small model for `align_asr.py` comes from Hugging Face; GitHub releases often answer 504 here.

```
M=<scratchpad>/asr/sherpa-onnx-whisper-small   # small-encoder.int8.onnx, small-decoder.int8.onnx, small-tokens.txt from huggingface.co/csukuangfj/sherpa-onnx-whisper-small
python3 ../audio/tighten.py voice-raw.wav voice.wav --max 0.2
python3 ../align_asr.py voice-raw.wav script.txt raw-timing.json --model $M --gap 0.08 --db -34
python3 ../map_timing.py voice-raw.wav raw-timing.json voice.wav timing.js --max 0.2 --tempo 1.0
```

- **Check the whole take with the stronger model** to catch invented sentences and misread numbers:
  `~/.cache/hyperframes/whisper/whisper.cpp/build/bin/whisper-cli -m ~/.cache/hyperframes/whisper/models/ggml-large-v3-turbo.bin -l ar` (16 kHz mono).
- **Fix line boundaries by hand** in `raw-timing.json` where whisper-small drifts. Tides: line 23 started 0.7 s early.
- **Never speed the voice up.** Tightening the pauses is all.
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
- **People: the shared person kit, always** (the user's fixed rule after the person demo, for every skill). Load
  `videos/_templates/people/person.js` (the template's `build.py` always loads it) and read its `README.md`. `PERSON.front()` gives the front or three-quarter view,
  `PERSON.side()` the profile, for walking and for lying flat on the back with `rot: -90`.
  - **Real proportions:** the wrist sits at the top of the thigh and the fingertips at mid-thigh.
  - **Flowing limbs:** each limb is one outline with the joints hidden inside it, never circles. A reaching arm is
    straight (`straight: true`).
  - **Hands and face:** five-finger hands with nails, in the right pose. The face shows every reaction.
  - **Placing him:** put hands on the real spot (forehead, throat, belly). Furniture is to the same scale. Keep him
    breathing and blinking.
  - **Clothes follow the topic:** dress every person for who they are in this video with `outfit` (presets `home`,
    `casual`, `office`, `doctor`, `worker`, `pilot`, `chef`, or your own parts and colours; see
    `videos/person-demo/outfits.html`). Add a missing outfit to the kit, front and side.

  The old flat salmon `fig()` from `videos/choking/` is retired for new episodes. A body cut (throat, lungs) still uses
  the real anatomy from a reference picture (`throat()` in `videos/choking/sketch/shots.js`), placed in or beside this person.
- **Shots:** one `shot()` per idea, usually per line, sometimes per caption chunk (`[line, chunk]`).
  - Transitions: `tr: "fade"`, or `"in"` / `"out"` when the camera flies into a detail or pulls back. There are no hard cuts.
  - `hud(from, to, draw)` holds a dial, chip or checklist over several shots.

## 4. Motion (qa.py must PASS)

- **The frame never shakes (the user's rule after «الليزر», viewers said the left-right drift tired their eyes).** The template
  no longer drifts or sways. Never add a sine drift, sway or wobble to the camera or a card again.
  The bumper's push-in and sweeping stopwatch hand, the end-card and the card crossfades stay.
- **Camera = the «طب إزاي؟» move** (measured frame by frame in the gastric-bypass reference): one drawing stays on screen
  for several lines and the **frame holds dead still** (0.0 % zoom, 0 px pan) while parts appear, take colour and pulse;
  then the camera **flies** in one eased slow-fast-slow move of **about 1.8 s** onto the part being talked about
  (zoom ×1.2–2.4, with a pan toward it), holds still again, and later flies back out (×0.4–0.8). Moves alternate in / out
  about every 4–10 s; in between, the caption card and small details change every 1.5–3 s. Chips and labels (HUD) stay
  fixed on top while the camera moves. Use `fly([cx,cy,z], [cx,cy,z], 1.8)` and `still(cx,cy,z)` in `_helpers.js`;
  crossfade to a new drawing (`tr: "fade"`) only when the subject really changes.
- **Short cuts (same rule):** like the «طب إزاي؟» reference, change the shot every 1.5–3 s: split each line into 2–3 shots
  on its caption chunks (`[line, chunk]`), and keep caption chunks to 2–4 words. Tighten the voice to `--max 0.2`.
- **How much life (the user chose test A after «الليزر», measured against the «طب إزاي؟» reference):** calm, and only
  on what the narrator is talking about: light particles running down a beam, blood running in a vessel, heat running
  down a hair, a glow that breathes, hairs or leaves swaying a little, a blink. Never busy motion everywhere (test B,
  three times the reference's motion, was turned down: it tires the eye the same way the drift did). Measured on the
  same metric as qa.py: the reference is still 46 % of the time (median change 0.29, longest hold 4.6 s); test A was
  still 40 % (median 0.37, longest 1 s). Aim there.
- **qa.py and stills.js for a sketch episode:** `python3 qa.py out.mp4 --steady` (a still stretch may last up to 5 s, stills
  up to half the video) and `node tools/stills.js <index.html> 0 <duration> 5`. Fix any hold longer than 5 s; holds under
  that are the style. Without `--steady` the old drifting-camera rule (0.75 s) still applies to the other skills. The tides fixes, any of which works:
  - balls bob and arrows pulse;
  - globes turn about 1.6°/s, or 22°/s for the polar spin;
  - bulges breathe;
  - waves run at about 48–70 px/s;
  - a moving wave line goes over a static arrow.
- **Before every render** run `node tools/stills.js <abs index.html> 0 <duration> 5`. It uses qa.py's own metric over the
  full frame. Fix every hold over 5 s (the steady-frame limit). A failed 20-minute render costs far more.
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
python3 qa.py <fixed.mp4> --steady
```

- **QA must say PASS** with `--steady`: no hold over 5 s, stills under half the video, loudness about -14/-15 LUFS.
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
