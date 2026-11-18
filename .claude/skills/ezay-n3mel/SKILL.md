---
name: ezay-n3mel
description: >
  Make an «إيه الحكاية؟» video in the user's «ازاي نعمل» style: a realistic 3D (three.js) build-along about 75–90 s long.
  It opens with a silly household idea («لو حطيت بمبة تحت علبة فول… مبروك، إنت عملت موتور»), then fast rounds of
  «بس <مشكلة بهزار>» → «فـ<الحل>» → «ده الـ<اسم الجزء>», each adding one real part to one object built in place on a dusty
  floor, with caption pills, ✓/✗ top tags and leader-line labels, and ends with the parts flying together, an orbit and
  «مبروك يا باشمهندس». Sound effects only. Always ends with the reel cover and the TikTok / Instagram+Facebook / YouTube
  Shorts titles. Use when the user says "ازاي نعمل", "إزاي نعمل", "بطريقة ازاي نعمل", "زي فيديو الموتور" or "ezay n3mel".
---

# «إيه الحكاية؟» — the «ازاي نعمل» style

**The user named this style «ازاي نعمل»** (2026-11-18), from a video they sent: a 3D engine built from a firecracker and
a can of beans. The video, its contact sheets, the transcript and the measured layout are in
`videos/_reference/ezay-n3mel/` (start with its `README.md`). Never ask the user to upload it again. Look at it and
measure it; never copy its drawings, its script or its jokes.

Talk to the user in Egyptian Arabic. Use this style only when the user names it.

**Sound without asking: sound effects only (the user's fixed rule, for every video in every skill).** The reference has
a music bed; we don't. Never add background music of any kind unless the user asks for it for that video; asking once
does not carry over. `videos/audio/sfx.py` leaves music out unless run with `--music`.

**Always finish with the reel cover and the titles** (section 7), in the same reply as the video, without being asked.

## 0. First question

Ask in one question: the topic (if not given) and quick mode or full review (as in `.claude/skills/animation/SKILL.md`).

**Topics that fit:** a machine or a thing you could build up from one silly starting point, where every part exists to
fix a problem the last step caused: a car engine, a fridge, an air conditioner, a jet engine, a microwave, a lift, a
toilet flush, a gun-free cannon, a submarine, a rocket, a light bulb, a speaker. If the topic is a process with nothing to
build («ليه السما زرقا؟»), say so and suggest «اسكتش».

## 1. Script → `videos/<slug>/script.txt`

**Length:** 40–48 lines, 150–190 words, about 75–90 s of voice. Lines are very short (2–6 words, often half a sentence
that goes on in the next line). This speed is the style: one line ≈ 1.7 s.

**The fixed spine:**
1. **The silly start (3 lines):** «لو <حطيت/ربطت/ملّيت> <حاجة من البيت>…» / «و<فعل بسيط>…» / «مبروك، إنت عملت <الحاجة>.»
   The object must really be the seed of the machine (the can becomes the piston).
2. **Why it fails (2–3 lines), with a joke:** «بس <المشكلة>…» / «<الهزار>.» («ومش هتشوفها تاني.» / «ولا الفول.»)
3. **6–8 rounds**, each 3–5 lines:
   - «بس <مشكلة جديدة>…» — sometimes a funny reason («بس البمب خلص…» / «والمحل قفل.»);
   - «فـ<تعمل الحل>…» / «<إزاي بيحل المشكلة>.» — verbs to «إنت»: فتحطها، فتوصّل، فترش، فتخلي، فتزوّد، فتعدّيه، فتلف;
   - «ده/دي <اسم الجزء>.» — the real name as people say it in Egypt («البستم»، «الكرنك»، «البوجيه»، «الشكمان»), and
     sometimes «أو <الاسم التاني>.» («ده الكمبريشن… أو الضغط.»).
   Each round adds exactly one visible part. Order the rounds so each fix causes the next problem.
4. **One number moment:** «يعني <الحاجة> بت<عمل كذا> <رقم>…» / «في الثانية الواحدة.» with a live counter.
5. **Home comparisons for every problem**, short and Egyptian: «زي غسالة قديمة»، «أعلى من فرح شعبي»، «تقلي عليه بيضة».
   At least four in the video. Never insult a group of people.
6. **Finishing touches (3 lines):** «زوّد <حاجة>…» / «و<حاجة>…» / «و<حاجة>.»
7. **The payoff (3 lines):** «بص لنفسك…» / «إنت لسه عامل <الحاجة> بإيديك.» / «مبروك يا باشمهندس.»

No «إيه الحكاية؟ هشرحهالك في دقيقة.» line and no «قولولنا…» line: the reference ends on «مبروك يا باشمهندس» and so do
we (ask the user once if they want the «قولولنا» line added; it is their channel's habit in other styles).

**Wording:**
- Casual Cairo Arabic, to «إنت», present tense, no classical words.
- Numbers as words in the script, digits in the caption and tags.
- Every fact must be right even when it is a joke (the egg really fries above about 70 °C; a 4-cylinder at 3000 rpm
  fires 100 times a second). Check each one, list sources in `refs/SOURCES.md`, and tell the user which ones are surprising.
- Run it through the `humanizer` skill, keeping the «بس / فـ / ده الـ» pattern and the payoff word for word.
- Give the script in one copy-ready code block, with the part names and the tags next to each line, and commit it.

## 2. Voice

Puck, `gemini-3.8-flash-tts`, temperature 1, with `videos/tools/tts.py` (quota and AI Studio fallback exactly as in the
sketch skill). Style text, filled in:

```
Speak in casual Egyptian Arabic (Cairo dialect), like a funny, energetic young YouTuber building <the thing> in front of a friend, one silly step at a time. Fast and punchy, almost no pauses between sentences, like a reel. Playful on the jokes and comparisons, a quick "uh-oh" on every "بس" problem, satisfied on every part name. Emphasize the part names: <word>, <word>, <word>. Make the opening "مبروك، إنت عملت" ironic and the final "مبروك يا باشمهندس" proud and warm. Never use Modern Standard Arabic pronunciation; pronounce ق as a glottal stop like Cairenes.
```

Timing as in the sketch skill (`tighten.py --max 0.15`, `align_asr.py`, `map_timing.py`), but tighten harder: the
reference has no pause over 0.25 s. Never speed the voice up.

## 3. The 3D world (three.js)

Build on the real-3D episode `videos/fridge-3d/` (`world.js` is a pure function of time, `template.html`, `build.py`,
`videos/lib/three.min.js`, `videos/engine.js`). Make `videos/<slug>/world.js`, `template.html`, `build.py`.

- **Set:** one place for the whole video. A large concrete or dusty floor (canvas texture with stains and fine noise), a
  corrugated metal wall or a hangar far behind, softly out of focus (a blurred texture on a far plane is enough). Daylight:
  hemisphere light plus one warm sun with soft shadows (`PCFSoftShadowMap`), slight fog for depth. Pick a set that fits the
  topic (a kitchen floor for a fridge, a garage for a car) but keep it plain and neutral.
- **Objects look real and clean**, like a product render: real proportions from reference photos (research first, as
  in the sketch skill), `MeshStandardMaterial` / `MeshPhysicalMaterial`, metals 0.6–0.9 metalness, chrome and steel grey,
  brass/gold for the injector, rubber black tyres, glossy red for the hero object. Each object is its real shape, simplified
  (a piston has its ring grooves, a spark plug its white ceramic and hex).
- **See inside with glass, not cuts:** casings are transparent (`transmission` or opacity 0.25–0.35 with a bright rim ring
  at both ends), so the moving insides show.
- **One build that grows.** `parts(t)` returns which parts are in; every «فـ…» line flies, drops or morphs one more part in
  (0.5–0.8 s, ease-out with a small overshoot, a metal clink). Earlier parts stay. When the build gets big (copies, more
  cylinders) the camera pulls back so the whole thing still fits.
- **The silly start is real too:** the household object is modelled well (the bean can has a printed label you make
  yourself — never a real brand), and it morphs into the first real part.
- **Show states on the object:** colour heat (grey → orange glow), blue water in hoses, a mist of fuel, a spark flash, sound
  as red rings, shaking (2–4 px jitter) for a problem, speed up the motion as the counter climbs.
- **Camera:** never still, never a hard cut. Slow dolly-in on each new part, a crane or orbit move between rounds, a quick
  push for a punch line, the parts flying together into the finished thing at the end (the engine dropped into a car body),
  then a slow full orbit and a fade to black over the last 1.5 s.

## 4. Screen (1080×1920, laid out at 360×640)

Measured from the reference (`videos/_reference/ezay-n3mel/README.md`):
- **Brand** top-left (y ≈ 0.06): «إيه الحكاية؟» small, Noto 800, white at 70 % with a soft shadow. Never the reference's
  watermark.
- **Top tag** centred (y ≈ 0.17): white pill, Noto 800 ~13px, dark text. Ends in a green ✓ when the step works and a red ✗
  when it fails. Red text when it names a part or a hot number. Live counters count up inside it («×60 فرقعة / ثانية»,
  «250°C»). Short: 1–4 words that say the line's point («طلوع ونزول وبس ✓»، «طارت ✗»، «زقة = لفة ✓»). A second smaller pill
  can sit under it for the other name («الضغط»).
- **Part label** on «ده الـ…»: white pill with red Noto 900 text, a thin black leader line to a black dot on the part.
  It follows the part in 3D (project the anchor every frame).
- **Caption** centred at y ≈ 0.845: a dark translucent pill (`rgba(20,20,20,.75)`, radius 8), white Noto 800 ~14px, the
  whole spoken line, at most 2 lines, «…» at the end when the sentence goes on. It changes with each line (fast crossfade);
  no word-by-word reveal.
- Everything inside the safe area y 120–840 (of 960) except the caption, which sits just above the bottom UI.

## 5. Sound (effects only)

Start from `videos/_templates/sketch/cues.js` (it finds clips in the episode's `sfx/` then in the kit) and add per line:
a clink or thud for every part that lands, a soft ding for every part label, a pop for ✓, a low buzz for ✗, a whoosh for
camera swoops, and the topic's own sounds (an engine that speeds up with the counter, a sizzle, a car-unlock chirp at
the end). Synthesize what you can with `audio/sfx.py`; for real recordings the kit lacks, ask the user once with a table
of moment, sound and Pixabay search terms, as in the sketch skill. Then
`node cues.js && python3 ../audio/sfx.py voice.wav cues.json <scratchpad>/<slug>-mix.wav` (no `--music`).

## 6. Render and QA

Same as the sketch skill, section 6 (`TAIL=3 node render.js`, the loudness chain, `python3 qa.py` must say PASS). The
camera always moves, so stills are rare; still run `node tools/stills.js` before rendering. Check frames with
`node tools/strip.js` and compare them side by side with `videos/_reference/ezay-n3mel/sheets/` in full review. Send the
video with SendUserFile under an Arabic name, e.g. `ازاي-نعمل-<الحاجة>.mp4`, and commit and push the code.

## 7. Cover and titles (always, right after the video)

**Cover:** a still of the finished build from `world.js` (full bleed, 540×960 at 2x, shot with `node videos/tools/cover.js`
while the repo is served with `python3 -m http.server`): the final object big in the middle, warm rim light, dark top and
bottom fades. Text in Noto Sans Arabic: «إيه الحكاية؟» small at the top, the hook «ازاي تعمل <الحاجة> بإيديك؟» 900 in
white, a yellow sub-title with the silly start («من علبة فول وبمبة!»), all inside y 120–840. Save as
`brand/eh-elhekaya/tiktok-cover-<slug>-1080x1920.png`, look at it, commit it.

**Titles** exactly as in the sketch skill, section 7: TikTok (3 hooks + description + hashtags, `#إيه_الحكاية` first),
Instagram Reel shared to Facebook (caption, longer Facebook description, comment to pin), YouTube Shorts (title with
`#shorts` + two lines), each in its own code block, run through `humanizer`, plus the short posting reminders.
