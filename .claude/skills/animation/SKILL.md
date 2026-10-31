---
name: animation
description: |
  Make an «إيه الحكاية؟» explainer video in the "animation" (cartoon-panel) style, end to end: script, voice
  settings, reference research, 25–29 animated shots, sound effects, 1080×1920 60fps render, QA, full-bleed reel cover and
  TikTok/Facebook/YouTube Shorts titles. This is the default for every new video (built like the Suez Canal tunnel video). Use when the user says "بطريقة الانيميشن", "بالانيميشن", "الأسلوب الكارتون",
  "animation style", or asks for a new «إيه الحكاية؟» video without naming another style.
---

# «إيه الحكاية؟» — the animation (cartoon-panel) style

**This is the channel's fixed way of making every new video** (the user's decision): the cartoon panel, built like the
Suez Canal tunnel video. The reference build is `videos/tbm-tunnel/cartoon/` («مين حفر نفق القناة؟», 29 shots, 1:56) and
its cover `brand/eh-elhekaya/cover-tbm-tunnel-tiktok.html`. Start every new video from a copy of them. Older builds in the
same style: `videos/gps-traffic/cartoon/`, `videos/lcd-tv/cartoon/`, `videos/offshore-oil/cartoon/`, `videos/elevator/cartoon/`,
`videos/submarine/cartoon/`.

Use another style only when the user names it (the other styles: `.claude/skills/diagram/` «الرسم الهندسي» and `.claude/skills/law/` «لو», the build-along style of the nuclear shelter video). Remotion 3D (`remotion/src/lightning/`, `remotion/src/rainbow/`) renders on
the CPU here (no GPU) and takes about 40 minutes a video against about 15 for the cartoon panel, so never pick it on your own.

Talk to the user in Egyptian Arabic. Work in this order, end to end; the voice is generated here (section 2).

**Ask before every new topic (the user's rule, to save usage limit):** when the user names a new video, ask in one short
question whether to run it in quick mode or with the full checks. Quick mode is the default the user asked for:
- no motion check (`tools/motion.js`) and no fix-and-retry loops for stills;
- no contact sheets, frames or other screenshots looked at during the build (no image review);
- still run the NaN/error check (text only) and `qa.py` on the final video (numbers only, don't open its sheet); if QA fails,
  tell the user and ask before re-rendering.

## 1. Script → `videos/<slug>/script.txt`

- 25–29 lines, one sentence per line, about 230–280 words → 1:40–2:00 of voice (the tunnel video: 29 lines, 274 words, 1:56).
- Casual Cairo Egyptian Arabic, warm and curious. Check spelling carefully (e.g. «آلاف الأطنان», «أسطوانات», «المية»).
- Fixed shape:
  - line 0: a hook about something the viewer sees or uses every day;
  - lines 1–2: the puzzle as questions;
  - line 3: exactly «إيه الحكاية؟ هشرحهالك في دقيقة.» (in a فصحى video: «ما الحكاية؟ سأشرحها لك في دقيقة.», see section 2);
  - lines 4–22: the explanation, one idea per line, with real numbers and one surprising fact or story;
  - line 23: the payoff that ties back to the hook;
  - line 24: exactly «قولولنا، عايزين تعرفوا حكاية إيه المرة الجاية؟».
- Write numbers as words when the voice must say them («تسعة وتسعين», «ألفين وعشرين»); English terms stay
  Latin (GPS, LCD, 4K).
- Verify every fact. Tell the user which facts are surprising and that they were checked.
- Run the script through the `humanizer` skill before showing it (the user asks for this every time), keeping lines 3 and 24
  word for word. Give the script in one copy-ready code block.
- Commit the script, then give the user the voice settings below (the Style text in its own code block).

## 2. Voice (generated here with the Gemini TTS API: the user's choice)

**Generate it yourself; don't ask the user to record it.** The Gemini API key is added by the environment's network secret
(header `x-goog-api-key` for `generativelanguage.googleapis.com`), so never read, print or store it. Write the Style text
below into `videos/<slug>/style.txt`, then:

```
python3 ../tools/tts.py script.txt style.txt voice-raw.wav --voice Puck --model gemini-3.8-flash-tts
```

- Voice **Puck**, model **gemini-3.8-flash-tts** (the user compared it with 2.5 Flash and chose it), **temperature 1**,
  the full Style text sent before the script (as AI Studio does). The Pro TTS model needs billing on the user's project.
- `--lines 0-3` makes a short sample if the user wants to hear the voice first. A 429 means the free daily quota ran out:
  tell the user; don't retry in a loop.
- If the API key is missing (HTTP 401/403), fall back to the user recording it in Google AI Studio with the same settings.

The settings the user uses in AI Studio (and the fallback):

- Single-speaker, **Temperature 1**, download **WAV**.
- Style text (fill in the topic and 2–3 key words):

```
Speak in casual Egyptian Arabic (Cairo dialect), like a friendly YouTuber revealing a surprising secret about <topic>. Warm, confident and curious, with real amazement on the surprising facts and numbers. Natural, relaxed conversational speed, not rushed. Take a short natural breath between sentences, and don't stop at commas. Read "<LATIN TERMS>" as English letters. Emphasize key words like <word>, <word>, <word>. Make the opening line intriguing and the question "إيه الحكاية؟" playful. Never use Modern Standard Arabic pronunciation; pronounce ق as a glottal stop like Cairenes.
```

For a video in Modern Standard Arabic (فصحى, to reach the wider Arab world; first used for `videos/sheikh-jaber-bridge/`),
use the same voice settings with this style text, line 3 «ما الحكاية؟ سأشرحها لك في دقيقة.» and the last line
«أخبرونا، ما الحكاية التي تريدون أن تعرفوها في المرة القادمة؟» (the brand «إيه الحكاية؟» stays on screen):

```
Speak in clear, warm Modern Standard Arabic (فصحى) with correct classical pronunciation, like a friendly documentary YouTuber revealing a surprising secret about <topic>. Warm, confident and curious, with real amazement on the surprising facts and numbers. Lively, brisk conversational pace, a little faster than a documentary narrator, never stiff. Take a short natural breath between sentences, and don't stop at commas. Make the opening line a gripping hook, almost a whisper of disbelief. Emphasize key words like <word>, <word>, <word>. Make the question "ما الحكاية؟" playful. Pronounce ق as a true qaf and keep the case endings light and natural.
```

- Natural speed only. Never speed the voice up with atempo (the user rejected fast narration). If the voice is too long,
  shorten the script and generate it again. فصحى is read slower: aim for about 260–280 words.
- **Check every take before using it.** At temperature 1 the model sometimes adds sentences that are not in the script
  (the bridge video got 20 s of invented text). Run `align_asr.py` on the take and compare each line's heard text with
  the script; a line that heard far more words than it has is invented text, so throw the take away and generate again.
- AI Studio delivers 24 kHz audio. `audio/sfx.py` resamples it to 48 kHz with soxr; never with linear interpolation, which
  mirrors the top octave into 12–24 kHz and makes the narrator sound "re-recorded" (the user heard it).

## 3. Reference research (real shapes, so drawings are realistic)

- Look at real photos of the main objects before drawing (devices, vehicles, machines, apps, satellites…).
- Wikimedia Commons API, with an identifying User-Agent that includes the repo URL, **one request at a time with
  long sleeps**; download thumbnails from `upload.wikimedia.org/wikipedia/commons/thumb/.../960px-...`
  (`thumb.wikimedia.org` is blocked).

```
UA="EhElhekayaRefBot/1.0 (https://github.com/minaawad99/claude-todo-demo) curl/8"
curl -s -A "$UA" "https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrnamespace=6&gsrlimit=8&gsrsearch=<query>&prop=imageinfo&iiprop=url&iiurlwidth=960"
```

- Put downloads in their own scratchpad folder; build a contact sheet and view it; note in
  `videos/<slug>/refs/SOURCES.md` what each drawing took from which photo (visual reference only, never reused).
- If Commons answers 429 / "too many requests", stop, wait, try once later. If it stays blocked, say so plainly
  and draw from known real shapes. Other hosts must be on the environment's Allowed domains list (suggest
  `images.nasa.gov`, `images-api.nasa.gov`, `www.gps.gov` when relevant). YouTube is for looking only, never downloading.

## 4. Audio pipeline (in `videos/<slug>/`)

```
cp <upload>.wav voice-raw.wav
M=<scratchpad>/asr/sherpa-onnx-whisper-small        # k2-fsa/sherpa-onnx GitHub releases: sherpa-onnx-whisper-small.tar.bz2
python3 ../audio/tighten.py voice-raw.wav voice.wav --max 0.3
python3 ../align_asr.py voice-raw.wav script.txt raw-timing.json --model $M --gap 0.08 --db -34
python3 ../map_timing.py voice-raw.wav raw-timing.json voice.wav timing.js --max 0.3 --tempo 1.0
```

Read the heard-text column line by line. If a number or word sounds wrong (e.g. «30» for «ستين»), tell the user
which second to listen to.

## 5. The look (fixed)

The page is 360×640 CSS px, rendered at 1080×1920:

- a black frame;
- the title in **Noto Sans Arabic 900** (white, 28px), a yellow sub-title under it in Noto 800 (18px). Never Aref Ruqaa:
  the user asked for Noto in the video title and on every cover;
- **one 16:9 animated panel** (SVG viewBox 640×360) at top 196px;
- under the panel, captions in Noto Sans Arabic 20px that reveal word by word with the voice; keywords are yellow (`K` in `build.py`);
- the «إيه الحكاية؟» brand at the bottom.

Drawing language (`_helpers.js`):

- **Characters:** ball-head characters with moods (n, happy, shock, dizzy, curious, worry) and sometimes a mascot (oil drop, pixel, phone).
- **Labels:** brush-swash tags that pop in.
- **Backgrounds:** sky, clouds, city, grass, plus film grain. Objects use gradients so they read as 3D.
- **Realistic objects:** each is a function drawn from the real shape in the reference photos (layout, colours, parts).
- **Openings:** open on the real thing the viewer knows (e.g. the actual app on a phone in a hand, the TV in a living room), then pull back into the explanation.

## 6. Build (copy `videos/monorail/cartoon/` → `videos/<slug>/cartoon/`)

`videos/monorail/cartoon/` is the tunnel build with the Noto title and the long-caption rule already in `template.html`
(captions over 72 characters drop to 17px); start from it.

- `template.html`: set the `<title>`, `.title` and `.sub`; add any gradients the new objects need.
- `shots.js`: new drawing pieces at the top, then exactly one `shot(line, cam(u, d), draw(u, d, t))` per script line.
  - `u` is the time into the shot, `d` its length and `t` absolute time;
  - `cam` returns `[x, y, zoom]` in the 640×360 world;
  - keep `window.__panel` as it is: a circular drift that never stops, plus a small tilt;
  - export the parts the cover needs on `window.__parts`.
- `build.py`: set `K` (keywords per line). Run `python3 build.py` → `scenes.js` + `index.html`.
- Long script lines (more than 13 words) get a 17px caption so they don't wrap into the brand mark (see `template.html` in `videos/bridge-water/cartoon/`).
- Check with a contact sheet: `node ../../tools/sheet.js $PWD/index.html <prefix> 2.0`, then look at it and fix
  cut-off tags, overlaps, empty or black areas, and unreadable parts.

### Motion rule

No scene may ever stand still. Every shot needs something moving the whole time: cars, waves, blinking lights,
pulsing circles, dashes running, the camera creeping.

- Pre-check with `node ../../tools/motion.js $PWD/index.html 0 <duration>` and aim for ≤ 0.3 s still. It is more
  lenient than qa.py, so dark or small scenes need extra motion.

## 7. Sound effects

- `videos/<slug>/cues.js`: a whoosh before every line, then effects matched to the action. Available effects are
  listed in `audio/sfx.py` (`fx_*`): pop, chime, ping, beep, notify, tick, whoosh, wipe, thud, clank, idle, hum,
  waves, splash, zap, spark, servo, motor, gear and more.
- `node cues.js && python3 ../audio/sfx.py voice.wav cues.json <scratchpad>/<slug>-mix.wav`
- When the topic has a signature real sound (a sonic boom, a train horn…), use a real recording instead of the synthesized one:
  put the clip in `videos/<slug>/sfx/` and cue it with `{"t": …, "file": "sfx/clip.wav", "gain": …}`. Sources: public-domain
  US government video/audio on Wikimedia Commons or NASA (images-api.nasa.gov), or Pixabay sound effects
  (`pixabay.com`, `cdn.pixabay.com` must be in Allowed domains). Credit the clip in `refs/SOURCES.md`.
- **Before asking the user for sounds, always check the library first.** The user has already sent many Pixabay clips for
  earlier episodes; they sit in `videos/*/sfx/px-*.mp3` (gitignored, so only in this container). List them with
  `ls videos/*/sfx/px-*.mp3`, copy what fits into the new episode's `sfx/`, and check each clip's length and silences
  (`ffprobe` + `silencedetect`) to pick `from`/`dur`. Only then send the user a short table of what is still missing, with
  Pixabay search terms and where each sound goes, and say which existing clips you reused.
- Pixabay blocks automated downloads with a bot check; never try to get around it. The user downloads and sends the files.
- If only the sound changed, skip the 20-minute render: remux the new mix onto the rendered mp4 with the same audio chain
  as `render.js` (apad, fade, loudnorm, limiter) and run qa.py again.

## 8. Render and QA (from `videos/`; run it in the background, it takes about 20 minutes)

```
TAIL=1.5 node render.js $PWD/<slug>/cartoon/index.html <mix.wav> <scratchpad>/<slug>-cartoon.mp4
ffmpeg -y -i <mp4> -c:v copy -af "alimiter=limit=0.6:level=false:attack=1:release=60" -c:a aac -b:a 192k -ar 48000 <fixed.mp4>
python3 qa.py <fixed.mp4>
```

The limiter remux keeps the audio peak under -0.5 dBFS. If qa.py still reports a true peak above -0.5 dBTP (loud recorded engine/jet beds clip into square waves that overshoot
after AAC), remux the mix onto the rendered video with an oversampled limiter instead of re-rendering:
`-af "apad,afade=t=out:st=<end-0.8>:d=0.8,volume=-3dB,loudnorm=I=-14:TP=-2:LRA=11,aresample=192000,alimiter=limit=0.6:level=false:attack=1:release=60,aresample=48000"`. QA must say PASS:

- no still stretch over 0.75 s;
- frozen total within budget;
- loudness around -14 LUFS.

If it fails, fix the named seconds and render again. Send the mp4 with SendUserFile, then commit and push the
code. Keep mix.wav and the mp4 in the scratchpad, not in the repo.

## 9. Cover and titles (when the user asks)

- **Cover:** copy `brand/eh-elhekaya/cover-container-ship-tiktok.html` (the tunnel cover's layout with the title already in
  Noto) to `cover-<slug>-tiktok.html`. **Every cover's title and sub-title are in Noto Sans Arabic, never Aref Ruqaa** (the user's
  fixed choice). It is **full bleed**, 540×960
  (1080×1920 at 2x):
  - **the tunnel-cover palette (that cover brought about 800 thousand views, so keep to it):** dark colours leaning to
    black at the top and the bottom: a dark slate or night sky under the top fade, deep water or dark ground going almost
    black at the bottom, and one warm yellow glow behind the main object so it pops. The main object keeps the pose that
    tells the story best (the birds cover: the godwit from the side, in mid-flight); the user does not want it turned
    face-on just to copy the tunnel cover. Tags with the key numbers, a shocked hard-hat worker for scale when it fits.
    See `cover-tbm-tunnel-tiktok.html` and `cover-birds-tiktok.html`.
  - the picture fills the whole frame (`<svg id="art" viewBox="0 0 540 960">`), composed from the video's `window.__parts`
    (load `timing.js` and `cartoon/scenes.js`), with the main object big in the middle, a hard-hat character for scale and
    one or two brush tags with the key numbers, plus film grain;
  - dark fades top (`fadeT`, 0–300) and bottom (`fadeB`, 680–960) so the text reads;
  - text: «إيه الحكاية؟» small (Noto 15px, #d9d4c8, top 132), the hook in **Noto Sans Arabic 900, 42px** white (top 154), a
    yellow Noto 800 24px sub-title (top 214) (the user asked for Noto on the cover title, not Ruqaa; load weight 900), and the punch line at top 722 in Noto 34px with the number in yellow and a smaller grey second line;
  - everything that matters stays inside the 3:4 profile-grid crop (y 120–840) and away from TikTok's right-hand buttons
    (text box `left: 24px; right: 64px`).
  Shoot it with `node videos/tools/cover.js $PWD/<html> $PWD/brand/eh-elhekaya/tiktok-cover-<slug>-1080x1920.png`, look at
  it, fix, commit, send.
- **Titles** (run them through the `humanizer` skill too, each in its own code block): TikTok gets 3 hook titles to choose
  from, plus a short description with hashtags (#إيه_الحكاية first). Facebook gets one title, plus a longer description
  with 3–4 emoji bullet points of what the video covers and the closing question. YouTube Shorts gets one title ending in
  #shorts and a two-line description.
