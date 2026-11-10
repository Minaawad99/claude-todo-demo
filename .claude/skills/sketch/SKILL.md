---
name: sketch
description: >
  Make an «إيه الحكاية؟» explainer video in the user's «اسكتش» style, end to end: script, voice, realistic drawings, sound
  effects, 1080×1920 60 fps render that passes qa.py, then paper-style covers and titles. Arabic, and an English edition
  («Here's the Thing») from the same drawings. Cream graph-paper card, close-up technical drawings (real
  coastline globes, side cuts, isometric machines) with leader-line labels, one short caption chunk at a time under a rule,
  no hard cuts, a word-by-word hook card, a stopwatch bumper, a summary card and ask box. The reference episode is
  «المد والجزر» (videos/tides). Built on videos/_templates/sketch. Use when the user says "اسكتش", "بأسلوب الاسكتش",
  "زي فيديو المد والجزر", "بالرسم الهندسي", "زي طب إزاي" or "sketch style".
---

# «إيه الحكاية؟» — the «اسكتش» style

**The user named this style «اسكتش»** and locked it after «المد والجزر». Use the same drawings, narration, sounds and
music in every episode. It copies the look, pacing and narration of the «طب إزاي؟» series: 20 reference videos, measured in
`videos/_reference/tabizzay/STYLE.md`, with contact sheets, motion strips and transcripts. We make it under our own name.

**The reference episode is `videos/tides/`.** Start every new episode from a copy of these files:
- `script.txt` and `style.txt`;
- `sketch/episode.py` and `sketch/shots.js`;
- `cues.js` and `refs/SOURCES.md`.

The shared parts are in `videos/_templates/sketch/` (its README lists every helper). Talk to the user in Egyptian Arabic.

## 0. First question (every new topic)

Ask the mode and the language together (§7): quick mode or full review (as in `.claude/skills/animation/SKILL.md`). For the tides episode the user
chose full review, because the drawings must look real. With full review you look at reference photos and frame strips,
and fix them.

## 1. Script → `videos/<slug>/script.txt`

**Length:** about 25–27 lines and 260–280 words. The voice comes out about 1:55, and about 1:45 after tightening.

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
Speak in casual Egyptian Arabic (Cairo dialect), like a calm, confident teacher explaining to a friend <topic>. Warm and clear, more teacher than hype, with quiet amazement on the surprising facts and numbers. Natural, relaxed conversational speed, not rushed. Take a short natural breath between sentences, and don't stop at commas. Emphasize key words like <word>, <word>, <word>. Make the opening line intriguing and the question "إيه الحكاية؟" playful. Never use Modern Standard Arabic pronunciation; pronounce ق as a glottal stop like Cairenes.
```

**Timing.** The whisper-small model for `align_asr.py` comes from Hugging Face; GitHub releases often answer 504 here.

```
M=<scratchpad>/asr/sherpa-onnx-whisper-small   # small-encoder.int8.onnx, small-decoder.int8.onnx, small-tokens.txt from huggingface.co/csukuangfj/sherpa-onnx-whisper-small
python3 ../audio/tighten.py voice-raw.wav voice.wav --max 0.3
python3 ../align_asr.py voice-raw.wav script.txt raw-timing.json --model $M --gap 0.08 --db -34
python3 ../map_timing.py voice-raw.wav raw-timing.json voice.wav timing.js --max 0.3 --tempo 1.0
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
a clip in the episode's own `sfx/` first and then in the kit, so a new episode needs nothing copied. Ask the user only for
sounds the kit doesn't have, with Pixabay search terms. Those one-off clips go in `<episode>/sfx/` (gitignored). Every
clip still has a synthesized stand-in.

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
| px-music-box (source) → px-music-soft (used) | **Mysterious Music Box – The Midnight Hour** (the series music) | whole | bed |

**Music: off by default (the user's request, Nov 2026).** Episodes carry no music bed; the narrator and the sound effects carry the video. `cues.js` has `USE_MUSIC = false` and writes `bed: false`. Without the bed the mix comes out around -18 LUFS, so add about +4–5 dB before the limiter (`volume=5dB,alimiter=…`) and check qa.py. Only if the user asks for music again, set `USE_MUSIC = true`, which uses the settings below.

**The music the user approved (only if switched back on).** The user approved this music and its level. `px-music-soft.mp3` in the kit is already made this way:
- **Soften the ring:**
  `ffmpeg -i px-music-box.mp3 -af "highshelf=f=3000:g=-5,volume='if(lt(t,12),0.6+0.4*t/12,1)':eval=frame" px-music-soft.mp3`
  This takes down the music-box ring, which the user found too much at the start.
- **Level:** play it at gain 0.42, which sfx.py reports as about 22 dB under the narrator while he speaks. It is 153 s long,
  so no loop is needed under about 2:30.

**Cues.** Start from `videos/_templates/sketch/cues.js`. It already places these:
- the hook chime;
- the bumper ticks;
- a flip for every shot change;
- the summary-card build;
- the ask box;
- the music.

Add one or two sounds per line matched to what moves (`lab`, `ding`, `scribble`, `paper`, `sea`, `drone`; see
`videos/tides/cues.js`), then:
`node cues.js && python3 ../audio/sfx.py voice.wav cues.json <scratchpad>/<slug>-mix.wav`.

Credit every clip in `refs/SOURCES.md`.

## 6. Render and QA (in the background, about 20 minutes for a 106 s video)

```
TAIL=3 node render.js $PWD/<slug>/sketch/index.html <mix.wav> <scratchpad>/<slug>.mp4
ffmpeg -y -i <mp4> -c:v copy -af "alimiter=limit=0.6:level=false:attack=1:release=60" -c:a aac -b:a 192k -ar 48000 <fixed.mp4>
python3 qa.py <fixed.mp4>
```

- **QA must say PASS:** no still over 0.75 s, frozen total inside the budget, loudness about -14/-15 LUFS.
- **Send the video** with SendUserFile under an Arabic name, e.g. `<الموضوع>-إيه-الحكاية.mp4`.
- **Code:** commit and push it. Keep the mp4 and the mix in the scratchpad.
- **A sound-only change** doesn't need a render: remux the new mix onto the video with the same audio chain.
- **Cover and titles:** follow the animation skill (section 9) when the user asks.

## 7. What the user settled after the tides episode (follow these in every new episode)

**Before anything:** check that `videos/<slug>/` doesn't exist already (`ls videos/`). An older episode was once
overwritten because a new one took the same folder name. Pick a new slug if it exists.

**First question (add to §0):** ask the mode (quick / full review) and the language in the same question: Arabic only, or
Arabic and English. In full review the user approves the script before any voice is recorded.

**Script**
- **The hook's first line is the topic's question**, in the viewer's words («إيه اللي بيحصل للجسم بعد ما يموت؟»,
  «إزاي عربية وزنها طن ونص توقفها دوسة رجل؟»). The hook card stays 3 lines.
- **Cover the whole subject, not one part.** The first planes script spent half its time on the wing; the user asked for
  the four forces, each with how it is made. Give every part its own shot, and never hold one frame for many lines.
- **Sponsor read, only when the user asks:** one line in the middle, after a step ends and before the next begins
  («وعلى فكرة، الحلقة دي برعاية …»), then «نرجع لـ…». Its shot is a coupon card marked «إعلان». Remind the user to turn
  on the platform's paid-partnership label.
- **Sensitive topics** (death, illness): calm forensic or medical drawings, nothing gory, and titles that stay on the
  science.

**Two editions, one set of drawings**
- Arabic is «إيه الحكاية؟». English is **«Here's the Thing»** (American English, the user's choice). Its fixed lines:
  - promise: "Here's the thing. I'll explain it in a minute.";
  - sign-off: "And that's the thing about …";
  - ask: "Tell us, what should we explain next time?".
  No other line may start with "And that's the thing".
- Use US units in the English script (mph, feet, °F) and digits in captions through `CAPTEXT`.
- Folders `videos/<slug>-ar/` and `videos/<slug>-en/`, the same number of lines in both scripts.
- `shots.js` lives in the Arabic folder with `var EN = !!window.EN_ED; function TX(ar, en)` for every label. The English
  folder has `sketch/make.sh`, which writes its `shots.js` as `window.EN_ED = true;` plus the Arabic file and builds.
- `"lang": "en"` in the English `episode.py` switches the template to left-to-right captions and cards, a Latin font and
  the English fixed lines. `cues.js` finds the English phase lines by itself.
- Reference pairs: `videos/plane-ar` + `plane-en` (machines, forces) and `videos/decomp-ar` + `decomp-en` (anatomy).

**Voice**
- Gemini sometimes invents sentences or reads the style text aloud (it did with a one-line script). Always transcribe
  the take with large-v3-turbo and compare with the script. If whisper seems to skip a stretch, transcribe that stretch
  alone before deciding.
- **To change one line, don't redo the take.** Record only that line (or let the user record it), cut it clean with
  `silenceremove`, match its level to the take with `volumedetect`, splice it in with `atrim` + `concat`, then run
  tighten / align / map again. Check both joins with whisper.
- The free TTS quota is about 10 requests a day. On 429, give the user the line and the style for AI Studio.

**Drawings: realistic, not a rough sketch** (the user rejected a simple body outline)
- **People and anatomy:**
  - 8-head proportions, a two-tone edge and hatching on one side (as reference v20), faint landmarks;
  - organs in their real places;
  - real tissue layers in sections;
  - muscles with tendons, bundles and striated fibres;
  - a real skeleton.
  `videos/decomp-ar/sketch/shots.js` has all of these ready to reuse: `bodyOutline`, `organs`, `gutLayer`, `muscle`,
  `fibre`, `skinSection`, `fingertip`, `skeletonFront`.
- **Machines:** real profiles and cut-aways. `videos/plane-ar/sketch/shots.js` has the airliner, a NACA 4412 wing section
  with moving air lines, a turbofan cut-away and the force arrows.
- **Arrive at a detail by zooming, don't cut to it.** When a shot is about something inside the body (a cell, the gut),
  start on the whole body and zoom continuously into it: `zoomBody()` in the decomposition episode scales the body with
  non-scaling strokes while the inner layers fade in at their own size.
- A label's text grows toward the side it points to. Keep `lx` far enough from the panel edge, or the text is cut off.
- Sparse shots fail the still-frame check. Fill the panel (large drawings), keep something moving in every shot, and run
  `tools/stills.js` on both editions.

**Sound**
- No music (see §5). Sound effects carry the video, so ask the user for real clips when the kit lacks one.
- Without music the English voice comes out quieter. Raise the gain before the limiter until qa.py reads about
  -13 to -15 LUFS.

**Covers and titles** (when the user asks)
- **The cover uses the video's own look**, not the old night palette:
  - cream paper `#eee5d0` with the grid;
  - the art inside an ink-framed panel (x 22–518, y 290–710 on a 540×960 page);
  - the title in ink 900 weight at top 154;
  - the sub-title in orange `#bd552f` at top 214;
  - the punch line at top 722 with one or two words in orange, and a grey second line.
  Keep each title on one line (shrink the font or shorten the text). Start from
  `brand/eh-elhekaya/cover-decomp-ar-tiktok.html` (and `-en`), and shoot with `node videos/tools/cover.js <html> <png>`.
- **Titles file** `videos/<slug>/titles.md`:
  - Arabic: three TikTok titles to choose from, a description with hashtags, a Facebook title and description, and a
    YouTube Shorts title and description;
  - English: US TikTok titles, a caption that asks a question, about 10 hashtags, and a pinned-comment idea.
- For Instagram cross-posted to Facebook: one caption with the hook as its first line, the points as a short numbered
  list, an ask, then five hashtags. Tell the user to turn on the AI label, because the voice is AI-made.

The older «الرسم الهندسي» build (`videos/_templates/diagram-v1/`, `videos/xray-diagram/`) stays only for the X-ray video.
