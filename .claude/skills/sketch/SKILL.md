---
name: sketch
description: Make an «إيه الحكاية؟» explainer video in the user's «اسكتش» style, end to end: script, a steady Egyptian narrator made in short chunks, ink-and-wash technical cutaway illustrations (made in Google AI Studio from the series prompts) that move on screen, boxed Arabic callouts with curved arrows, generated music and effects only, 1080×1920 60 fps render that passes qa.py. Cream graph-paper card, one short caption chunk at a time under a rule, a word-by-word hook card, a stopwatch bumper, a summary card and ask box. The reference episode is «نفس الطفل في بطن أمه» (videos/fetus-breathing). Use when the user says "اسكتش", "بأسلوب الاسكتش", "زي فيديو نفس الطفل", "زي فيديو المد والجزر", "بالرسم الهندسي", "زي طب إزاي" or "sketch style", or asks for a new «إيه الحكاية؟» video without naming another style.
---

# «إيه الحكاية؟» — the «اسكتش» style

The user locked this method after «نفس الطفل في بطن أمه» (`videos/fetus-breathing/`): the narration, layout and pacing of
the «طب إزاي؟» series (20 reference videos measured in `videos/_reference/tabizzay/STYLE.md`, when that folder exists),
drawn with **ink-and-wash technical cutaway illustrations** that **move**, labelled with **boxed callouts and curved
arrows**, under **one steady narrator**, with **generated music and effects only**. Talk to the user in Egyptian Arabic.

## 0. Setup and the first question

**Files.** Everything the method needs lives in the repo under `videos/` (template, tools, reference episode). If this
skill runs somewhere those files are missing (another cloud, a fresh project), copy them from the skill's own `kit/`
folder into the working directory first: `cp -r <this skill's folder>/kit/. .` That gives:

- `videos/_templates/sketch/`: the page template, engine, build script, drawing + picture helpers, `cues.js`, `img_prep.py`;
- `videos/tools/`: `tts.py` (Gemini TTS), `stills.js`, `strip.js`;
- `videos/{render.js, qa.py, align_gemini.py, align_asr.py, map_timing.py}`, `videos/audio/{tighten.py, sfx.py}`, `videos/lib/`;
- `videos/fetus-breathing/`: the reference episode, complete (script, voice, timing, pictures, shots, cues).

Needs: node with `playwright` (Chromium), python3 with `numpy` and `opencv-python-headless`, ffmpeg, and a Gemini API
key reachable as `generativelanguage.googleapis.com` (the environment's proxy adds it; `tts.py` never stores a key).

**First question** (every new topic, one question): quick mode, or full review (strips of frames checked and fixed
before the render). Full review is the default when the user doesn't mind.

## 1. Script → `videos/<slug>/script.txt`

**Length:** about 27 lines and 270–290 words; the voice comes out about 1:55–2:00 after tightening.

**The fixed spine:**
1. **Hook:** a fact from the viewer's own life, then its contradiction, spoken to «you», over 3 lines, ending on the
   most surprising fact (e.g. «ومن غير ولا نَفَس هوا واحد… ده حتى رئتيه مليانين مية!»). These lines are the hook card.
2. **Promise:** «إيه الحكاية؟ هشرحهالك في دقيقة.»
3. **Optional rule:** «قبل ما نشرح محتاجين نوضّح قاعدة صغيرة… خليك فاكرها.»
4. **The steps:** each opens with a «طب…؟» question, then the answer, then a home analogy «زي…».
5. **The myth:** «وناس كتير فاكرة إن… لأ.»
6. **The recap:** «يعني من الآخر…» in 3–4 short clauses.
7. **The odd fact:** «والأغرب…»
8. **Sign-off:** «ودي كانت حكاية …»
9. **Last line:** «قولولنا، عايزين تعرفوا حكاية إيه المرة الجاية؟»

**Wording:**
- Short phrases; numbers as words in the script, digits in the caption (`CAPTEXT` in `episode.py`).
- **Words the voice mispronounces:** use the Egyptian word (حيطة, not جدار) or add tashkeel (طَبَق); keep the caption
  plain with `CAPTEXT`.
- Check every fact; tell the user which surprising ones you checked. Note them in `refs/SOURCES.md`.
- Run the script through the `humanizer` skill, keeping the series devices word for word.
- Give the script in one copy-ready code block, then commit it.

## 2. Voice: one steady narrator

**Never one long take:** a long Gemini take drifts to another speaker partway through. Generate **chunks of 5–7 lines**:

```
python3 ../tools/tts.py script.txt style.txt <scratch>/c0-4.wav --voice Puck --model gemini-3.8-flash-tts --lines 0-4
```

- `style.txt` = the series style text (below) ending with «Keep exactly the same single male narrator, voice, pitch and
  Cairo accent from the first word to the last.»
- **Measure every chunk:** median pitch (autocorrelation F0 over voiced frames) and a timbre fingerprint (log energy in
  12 spectral bands). Chunks of one speaker sit within about ±8 Hz and a timbre distance under about 0.6 of each other.
  Regenerate a chunk that stands out; a slightly higher pitch with the same timbre is just livelier intonation.
- **Level-match** every chunk to −19.5 LUFS (ffmpeg `ebur128`, then `volume`) before joining them with 0.4 s gaps.
- **Quota:** the free tier allows about 10 TTS requests a day and 3 a minute (it resets at 10:00 Cairo). When it runs
  out, don't switch models (that changes the voice). Give the user the style and each chunk in code blocks for Google
  AI Studio (Single-speaker, Puck, Temperature 1, WAV, one chunk per request), and use what they send after the same checks.

Style text (fill in the topic and key words):

```
Speak in casual Egyptian Arabic (Cairo dialect), like a calm, confident teacher explaining to a friend <topic>. Warm and clear, more teacher than hype, with quiet amazement on the surprising facts and numbers. Natural, relaxed conversational speed, not rushed. Take a short natural breath between sentences, and don't stop at commas. Emphasize key words like <word>, <word>, <word>. Make the opening line intriguing and the question "إيه الحكاية؟" playful. Never use Modern Standard Arabic pronunciation; pronounce ق as a glottal stop like Cairenes. Keep exactly the same single male narrator, voice, pitch and Cairo accent from the first word to the last.
```

**Timing:**

```
python3 ../audio/tighten.py voice-raw.wav voice.wav --max 0.3
python3 ../align_gemini.py voice-raw.wav script.txt raw-timing.json --gap 0.08 --db -34 --model gemini-3.1-flash-lite
python3 ../map_timing.py voice-raw.wav raw-timing.json voice.wav timing.js --max 0.3 --tempo 1.0
```

- `align_gemini.py` transcribes each pause-split clip with Gemini and matches clips to lines. On short breath clips it
  sometimes invents words (e.g. «أنا عايزة أروح البيت»): check the whole take with one full transcription before
  believing the voice said them. `align_asr.py` (whisper-small) is the alternative where Hugging Face is reachable.
- **Never speed the voice up**; tightening the pauses is all.
- Tell the user any word that needs their ear, and where the chunks join.

## 3. Pictures: ink-and-wash cutaways that move

**Make them.** Write one prompt per idea (usually 10–14 pictures) from `prompts.md` in this skill: the subject, the
cut, what must show inside, plus the fixed style block. The user makes them in AI Studio (the free API tier can't make
images) and sends them. Check each one (anatomy or mechanism right, no text), say which to redo, use the rest.

**Prepare them.**

```
cp <uploads> <episode>/sketch/img/src/NN.jpg
python3 ../_templates/sketch/img_prep.py <episode>/sketch/img [--text N:x0,y0,x1,y1]
```

It keys the paper to alpha, trims, writes `img/NN.webp` and prints the `pics({...})` line for `shots.js`. To place
labels and paths, draw a 100 px grid with coordinates over each webp (PIL) and read positions in picture pixels.

**Place them** (helpers in `_templates/sketch/_helpers.js`, world 640 × 786):
- `pics({n: [w, h]})` once at the top of `shots.js`;
- `var MOM = PL(1, cx, cy, width)` places picture 1 by its centre; `MOM.p(px, py)` maps a picture pixel to the world;
- `pic(L)` draws it (a `<use>` of a `<defs>` image, so the per-frame panel never reloads it);
- `box(MOM.p(px, py), bx, by, "النص", colour, k, size)`: a boxed callout with a curved arrow, like the style reference.

**Make them move** (the user's rule: the drawings themselves must move, not just what is drawn over them). Write a
`live(L, t, opt)` in the episode that returns the picture with moving parts. The template's helpers do the work:
- `part(L, path, transform, fixed)`: a region cut out and moved (lungs breathing: `about(L, x, y, 1 + .03 * breath(t))`;
  the heart: `1 + .045 * beat(t)`);
- `partSoft(L, cx, cy, rx, ry, transform)`: a region moved with a soft-edged mask, for big moves inside a scene with no
  seam (the baby swaying about 2.5° and floating 5–7 px in its fluid);
- `picBut(L, path)` + `part`: lift an object out and move it (a nail pulled to a magnet, a tea bag bobbing, a flag);
- separate objects on transparent paper move freely (two cells floating);
- drawn over the picture: blood cells running along a vessel (`cellSprite` along a polyline), gas dots crossing a wall,
  oxygen running along a path (`runDots`), bubbles rising, snow blowing, ripples on liquid.
Keep the moves visible: the user found under 1° too small.

**Code-drawn pieces** stay for what pictures can't carry: the stopwatch, numbers that count up (`count`, `numBox`),
✗ / ✓, tags (`tag`), analogy thumbnails (`iconBox`), a floor filling in.

**Shots:** one `shot()` per idea, usually per line. Transitions `fade`, `in`, `out`; no hard cuts. Push or pan the camera
into the detail being talked about (the placenta, the wall beside a hair).

**Colours:** paper `#eee5d0`, ink `#2a2016`; orange `#bd552f` for action, heat or the key number; olive `#5e653a` for the
named part; slate blue `#4a6f8a` for water, air or the term. Callout text takes the colour of its caption key word.

## 4. Motion check (qa.py must PASS)

- The template's camera drift and card motion stay as they are.
- Before every render: `node tools/stills.js <abs index.html> 0 <duration>` until it prints no still run over 0.5 s.
- Look at frames: `node tools/strip.js <abs index.html> out.png 6 <times…>`; for motion, frames 0.3–0.6 s apart.

## 5. Sound: generated only

**No recorded clips unless the user asks**: no background sounds, no recorded music. `cues.js` (from the template) has
`RECORDED = false`, so every cue plays `sfx.py`'s synthesized stand-in and the music is `sfx.py`'s own generated bed.
Add one or two cues per line matched to what moves (`pop`, `tick`, `whoosh`, `chime`, `thud` heartbeat, `drip`, `slosh`,
`clink`, `wind`…; see `videos/fetus-breathing/cues.js`), then:

```
node cues.js && python3 ../audio/sfx.py voice.wav cues.json <scratch>/<slug>-mix.wav
```

## 6. Render and QA (in the background, about 20 minutes for 2 minutes)

```
TAIL=3 node render.js $PWD/<slug>/sketch/index.html <mix.wav> <scratch>/<slug>.mp4
ffmpeg -y -i <mp4> -c:v copy -af "alimiter=limit=0.6:level=false:attack=1:release=60" -c:a aac -b:a 192k -ar 48000 <fixed.mp4>
python3 qa.py <fixed.mp4>
```

- QA must say PASS: no still over 0.75 s, frozen total inside the budget, loudness about −14/−15 LUFS.
- Send the video with SendUserFile under an Arabic name (`<الموضوع>-إيه-الحكاية.mp4`); commit and push the code and
  pictures; keep the mp4 and the mix in the scratchpad.
- A sound-only change needs no render: remux the new mix with the same audio chain.
- Cover and titles: follow the `animation` skill (section 9) when the user asks.

## The older builds

`videos/tides/` («المد والجزر») is the first «اسكتش» episode, drawn entirely in code (globes from real coastlines, a
beach in section); its drawing helpers are still in the template. `videos/_templates/diagram-v1/` stays only for the
X-ray video.
