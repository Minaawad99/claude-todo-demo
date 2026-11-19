---
name: law
description: >
  Make an «إيه الحكاية؟» explainer video in the «لو» style the user picked (built like the nuclear shelter video «تعمل ملجأ
  نووي إزاي؟»): the video opens with «لو عملت كذا… يبقى عملت كذا؟», then builds the thing step by step as a chain of
  «بس… (problem)» → «عشان كده… (fix)», on one cross-section drawing that grows part by part, and ends with «ومبروك، كده إنت
  عملت…». Use when the user says "بأسلوب لو", "بطريقة لو", "زي فيديو الملجأ", "law style" or "build-along style". Every
  other step (voice, references, sounds, render, QA, cover, titles) follows the animation skill.
---

# «إيه الحكاية؟» — the «لو» style

**Sound without asking: sound effects only (the user's fixed rule, for every video in every skill).** Without the user's
permission you may add only sound effects (swipes, ticks, dings, whooshes, and effects you synthesize such as a buzz).
Never add background music of any kind (a kit track, a synthesized bed, a generated or licensed track) unless the user
asks for it for that video; asking once does not carry over to the next video. `videos/audio/sfx.py` leaves all music
out unless run with `--music`, so pass that flag only when the user asked.

The user's name for this style is **«لو»**. The reference build is the nuclear shelter video: `videos/nuclear-shelter/`
(script, voice, `cartoon/`, 26 lines, 276 words, 1:45) and its cover `brand/eh-elhekaya/cover-nuclear-shelter-3d-tiktok.html`.
Its structure came from a video the user sent (a 3D back-garden shelter explainer, "but… so you add…"); the script and the
drawings are our own.

It is not a replacement for the «إيه الحكاية؟» animation style: use it only when the user asks for «لو».

Talk to the user in Egyptian Arabic. Ask the quick-mode question first, as in the animation skill. **The screen is 3D with a reacting character (section 4), in
every «لو» video.** Voice (Gemini Puck),
reference research, audio pipeline, sounds, render, QA, cover and titles all work exactly as in
`.claude/skills/animation/SKILL.md`. Only the script shape, the voice style text, the on-screen title and the way the
shots build up change.

## 1. Topics that fit

Something the viewer could, in theory, build or set up themselves, where each part exists to solve a problem: a shelter,
a house that survives an earthquake, a well, a raft, a pyramid, a space suit, a city on Mars. If the topic is "how does X
work" with no building, use the animation style instead and say why.

## 2. Script → `videos/<slug>/script.txt`

- 24–28 lines, one sentence per line, about 240–280 words → 1:40–1:50 of voice.
- Casual Cairo Egyptian Arabic, speaking to the viewer as «إنت» («بتنزّل», «بتحفر», «بتركب»).
- **No «إيه الحكاية؟ هشرحهالك في دقيقة.» line.** The hook question does that job.
- Fixed shape:
  - line 0: the naive idea as a question: «لو <عملت الحاجة البسيطة>، يبقى عملت <الحاجة>؟»;
  - line 1: why it fails: «للأسف لأ، …»;
  - line 2: the first real step: «عشان كده بتـ…», with a real number;
  - the middle: 5–7 rounds of **«بس <مشكلة جديدة>.» → «عشان كده <الحل>.»**. A round may get one extra line for a number or
    the reason the fix works («والخبر الحلو إن…», «فالـ… بيوقفوا…»). Each fix adds one visible part to the build;
  - one misconception pair near the end: «ناس كتير فاكرة إن…» → «والحقيقة إن…», with the surprising number;
  - one line of finishing touches: «ضيف …، و…، و…»;
  - the payoff: «ومبروك، كده إنت عملت <الحاجة>.»;
  - last line, exactly: «قولولنا، عايزين تعرفوا حكاية إيه المرة الجاية؟».
- Write numbers as words when the voice must say them («تسعين سنتي», «تسعة وتسعين وتسعة من عشرة في المية»).
- Verify every fact and list the sources in `refs/SOURCES.md`. Tell the user which facts are surprising and that they were
  checked.
- Run it through the `humanizer` skill, keeping the «بس / عشان كده» pattern and the last line word for word. Give the script
  in one copy-ready code block, commit it, then give the voice settings.

## 3. Voice style text (`videos/<slug>/style.txt`)

Same voice and model as the animation skill (Puck, gemini-3.8-flash-tts, temperature 1). Fill in the topic and the key
words:

```
Speak in casual Egyptian Arabic (Cairo dialect), like a friendly YouTuber walking the viewer step by step through building <the thing>, each problem followed by its fix. Warm, confident and curious, with real amazement on the surprising facts and numbers, and a little suspense on each "بس" problem before the "عشان كده" fix. Natural, relaxed conversational speed, not rushed. Take a short natural breath between sentences, and don't stop at commas. Emphasize key words like <word>, <word>, <word>. Make the opening question intriguing and the final "ومبروك" proud and playful. Never use Modern Standard Arabic pronunciation; pronounce ق as a glottal stop like Cairenes.
```

## 4. Screen — 3D, with a character who lives through every step (the user's fixed rule)

**Every «لو» video is 3D, never a flat 2D cartoon** (the user's decision after «تعمل قبو سري إزاي؟», whose first cut was 2D
and was rejected). It must look like the 3D video the user sent as the style reference for «لو»: a 3D diorama of the build,
cut open in section, with the camera moving around it. **Watch the reference before building** (see below); if it is not in
the repo, ask the user to send it once and save it there.

- **Reference video:** `videos/_reference/law/` (the user's 3D build-along video; put it there with a `README.md` of what each
  part shows the first time the user sends it, then never ask again). Pull frames and motion strips with ffmpeg and copy its
  look: the materials, the lighting, the camera moves, how parts appear, how the character moves.
- **Built in three.js**, like the shelter and basement covers (`brand/eh-elhekaya/cover-nuclear-shelter-3d-tiktok.html`,
  `cover-secret-basement-3d-tiktok.html`): the same diorama scene is the video. One page renders every frame with
  `renderAt(t)` (the same render/QA tools as the cartoon panel), in the 16:9 panel under the Noto title, with the
  word-by-word captions and the brand.
- **One build that grows.** The scene is built once with every part as an object; each «عشان كده» line turns one more part
  on (it rises, slides or is poured into place) and parts stay on in later lines. The camera pushes in on the new part,
  then pulls back.
- **A real person who reacts to every step (the user's fixed rule).** A rigged human (a glTF with a skeleton, e.g.
  `brand/eh-elhekaya/models/person.glb`, posed and animated by turning its joints; real proportions, a face, elbows and
  knees, never primitive shapes), who **lives through each line**: digs, climbs down into the build and up out of it, walks,
  sits, pulls the book, opens the door. On every «بس…» problem the person reacts to the failure (startled, steps back, covers
  the head, coughs, panics); on every «عشان كده…» fix the person reacts to the success (relieved, thumbs up, tries the new
  part, nods). Never leave the person standing still through a line, and never let any body part pass through a wall,
  floor or piece of furniture: check from the front, the side and above.
- **Problem lines** show the danger hitting the build in 3D (earth caving in, water rising, the gas rising) with a red ✗;
  **fix lines** show the part arriving, with a brush tag naming it and the number.
- **The payoff line** orbits the whole build, every part in place, the person happy inside.
- Motion and QA rules as in the animation skill (qa.py must PASS).

## 5. Cover

Same rules as the animation skill (full bleed, dark top and bottom, a warm glow behind the subject, Noto text, safe area
y 120–840). The «لو» reference is the shelter cover: a 3D (three.js) diorama of the finished build cut open, with one
or two tags for the key numbers. The hook title is the on-screen title («تعمل … إزاي؟»), the yellow sub-title the setting,
and the punch line is the misconception fact («هتقعد فيه أسبوعين بس / مش سنين زي ما فاكر!»). Serve the repo with
`python3 -m http.server` from the root to shoot a three.js cover.
