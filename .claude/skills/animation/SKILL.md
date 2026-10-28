---
name: animation
description: |
  Make an «إيه الحكاية؟» explainer video in the "animation" (cartoon-panel) style, end to end: script, voice
  settings, reference research, 25 animated shots, sound effects, 1080×1920 60fps render, QA, reel cover and
  TikTok/Facebook titles. Use when the user says "بطريقة الانيميشن", "بالانيميشن", "الأسلوب الكارتون",
  "animation style", or asks for a new «إيه الحكاية؟» video without naming another style.
---

# «إيه الحكاية؟» — the animation (cartoon-panel) style

The reference build is `videos/gps-traffic/cartoon/` (GPS and traffic, 25 shots). Start every new video from a copy
of it. Older builds in the same style: `videos/lcd-tv/cartoon/`, `videos/offshore-oil/cartoon/`,
`videos/elevator/cartoon/`, `videos/submarine/cartoon/`, `videos/helicopter/`.

Talk to the user in Egyptian Arabic. Work in this order and stop where the user has to act (record the voice).

## 1. Script → `videos/<slug>/script.txt`

- 25 lines, one sentence per line, about 230–250 words (≈1100–1200 characters without spaces) → 1:30–1:45 of voice.
- Casual Cairo Egyptian Arabic, warm and curious. Check spelling carefully (e.g. «آلاف الأطنان», «أسطوانات», «المية»).
- Fixed shape:
  - line 0: a hook about something the viewer sees or uses every day;
  - lines 1–2: the puzzle as questions;
  - line 3: exactly «إيه الحكاية؟ هشرحهالك في دقيقة.»;
  - lines 4–22: the explanation, one idea per line, with real numbers and one surprising fact or story;
  - line 23: the payoff that ties back to the hook;
  - line 24: exactly «قولولنا، عايزين تعرفوا حكاية إيه المرة الجاية؟».
- Write numbers as words when the voice must say them («تسعة وتسعين», «ألفين وعشرين»); English terms stay
  Latin (GPS, LCD, 4K).
- Verify every fact. Tell the user which facts are surprising and that they were checked.
- Commit the script, then give the user the voice settings below.

## 2. Voice (the user records it in Google AI Studio → Generate speech)

- Single-speaker, **Temperature 1**, download **WAV**.
- Style text (fill in the topic and 2–3 key words):

```
Speak in casual Egyptian Arabic (Cairo dialect), like a friendly YouTuber revealing a surprising secret about <topic>. Warm, confident and curious, with real amazement on the surprising facts and numbers. Natural, relaxed conversational speed, not rushed. Take a short natural breath between sentences, and don't stop at commas. Read "<LATIN TERMS>" as English letters. Emphasize key words like <word>, <word>, <word>. Make the opening line intriguing and the question "إيه الحكاية؟" playful. Never use Modern Standard Arabic pronunciation; pronounce ق as a glottal stop like Cairenes.
```

- Natural speed only. Never speed the voice up with atempo (the user rejected fast narration).

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
- the title in Aref Ruqaa (white, 30px), a yellow sub-title under it (19px);
- **one 16:9 animated panel** (SVG viewBox 640×360) at top 196px;
- under the panel, captions in Noto Sans Arabic 20px that reveal word by word with the voice; keywords are yellow (`K` in `build.py`);
- the «إيه الحكاية؟» brand at the bottom.

Drawing language (`_helpers.js`):

- **Characters:** ball-head characters with moods (n, happy, shock, dizzy, curious, worry) and sometimes a mascot (oil drop, pixel, phone).
- **Labels:** brush-swash tags that pop in.
- **Backgrounds:** sky, clouds, city, grass, plus film grain. Objects use gradients so they read as 3D.
- **Realistic objects:** each is a function drawn from the real shape in the reference photos (layout, colours, parts).
- **Openings:** open on the real thing the viewer knows (e.g. the actual app on a phone in a hand, the TV in a living room), then pull back into the explanation.

## 6. Build (copy `videos/gps-traffic/cartoon/` → `videos/<slug>/cartoon/`)

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

- **Cover:** `brand/eh-elhekaya/cover-<slug>.html`, 540×960, in the video's own look:
  - a black frame with a Ruqaa hook title and a yellow sub-title;
  - a tall panel (viewBox 640×510) composed from `window.__parts`;
  - a punchy line underneath with the key number in yellow.
  Shoot it with `node videos/tools/cover.js $PWD/<html> $PWD/reel-cover-<slug>-1080x1920.png`, look at it, fix, commit, send.
- **Titles:** TikTok gets 3 hook titles to choose from, plus a short description with hashtags
  (#إيه_الحكاية first). Facebook gets one title, plus a longer description with 3–4 emoji bullet points of what
  the video covers and the closing question.
