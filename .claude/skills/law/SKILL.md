---
name: law
description: >
  Make an «إيه الحكاية؟» build-along explainer in the user's «لو» style, end to end, matching the 14 reference videos the
  user sent (videos/_reference/law/, series «ابنيها بنفسك!»): a full-screen 9:16 "2.5D" vector drawing of one cut-open scene
  that grows part by part, one big caption word at a time, a real-proportion man who acts out and reacts to every step,
  and the script shape «لو… يبقى عندك…» → «بس المشكلة إن…» → «عشان كده…» → «وده اسمه…» → «والغريب إن…» → «ومبروك عليك،
  عملت … بنفسك» in casual Cairo Egyptian Arabic. Covers topic choice, script, Gemini voice, alignment, the scene on the
  shared kit, joint-correct acting, checks, sound effects (no music), 1080×1920 render, qa.py, the reel cover and the
  TikTok / Instagram+Facebook / YouTube Shorts titles. Use when the user says "لو", "بأسلوب لو", "بطريقة لو",
  "اعملها بنفسك", "زي فيديو القبو", "زي فيديو الطاقة الشمسية", "build-along" or "law style".
---

# «إيه الحكاية؟» — the «لو» style (build it yourself, step by step)

Talk to the user in Egyptian Arabic. This file is complete on its own: a new session can make a «لو» video from it alone.

**Worked examples to copy from (both pass qa.py):**
- `videos/solar-building/` «تنوّر عمارة بالشمس إزاي؟» — **the template to copy**: built on the shared kit.
- `videos/secret-basement/` «تعمل قبو سري إزاي؟» — the first one; its `law/scene.js` is where the kit came from.

**The user's fixed rules for this style (never break them):**
1. **Look like the reference videos** in `videos/_reference/law/`, all 14 opened before every topic (never ask the user for them again; never copy a drawing
   or a script line from them).
2. **Full-screen 9:16 "2.5D" drawing**, not a cartoon panel, not three.js, not a black frame with a title.
3. **A real-proportion man reacts to every step**: shocked on each «بس…», relieved on each «عشان كده…», going into the build
   and back out.
4. **Joints and tools physically right** (section 6): he digs DOWN, leans forward to work, elbows and knees never bend the
   wrong way, nothing passes through walls.
5. **Sound effects only, no music of any kind** unless the user asks for music for that video (`videos/audio/sfx.py` leaves
   music out unless run with `--music`; never pass it on your own).
6. **Ask before every new topic** whether to run in quick mode or with the full checks (one short question). Full checks
   (the user's usual answer): pose sheet, a frame of every line, motion check, fix, then render. Quick: only the NaN
   check and qa.py.
7. **Don't re-render without the user's OK** once a video has been delivered; fix the code and say what changed.
8. Every video ends with the reel cover and the three platforms' titles, without being asked.

## 0. The reference videos (`videos/_reference/law/`)

14 videos (`videos/rNN.mp4`, 720×1280), a 16-frame sheet each (`sheets/rNN.jpg`), rough transcripts
(`transcripts/rNN.txt`) and `README.md` (what each builds, the measured look, the script shape). Before a new topic:
read the README, then **open all 14 sheets, every time** (the user's rule: the look comes from all 14, never from one
video or from our earlier episodes), and pull full-size frames with ffmpeg from the videos closest to the new topic, its
kind of place (roof, desert, street, inside a house, underground) and its main problem
(`ffmpeg -ss 30 -i videos/r09.mp4 -frames:v 1 /tmp/x.jpg`). Write in `refs/SOURCES.md` what the drawing takes from which
reference (e.g. "r13: the part lowered on a crane hook; r08: the cut-open tank with a label pill; r01: the close-up
cross-section of the valve"), so each episode borrows from several of the 14 and doesn't just repeat the kit's look of
the last episode (same sky, same palms, same light). The kit is the code to draw with, not the look to copy.

**If a reference video covers the same topic** (r02 = home solar, r05 = a diesel pile hammer, r07 = a bored pile, r09 = a hideout under the bed, r04 = a toilet, r13 = a
crane, r14 = drainage…), read its transcript first and make ours different on purpose: other steps, another order,
another «والغريب» fact. Note in `refs/SOURCES.md` what was avoided (see `videos/solar-building/refs/SOURCES.md`).

## 1. Topics that fit

Something the viewer could, in theory, build or set up, where each part exists to fix a problem: a basement, a solar
system, a well, a desert cooler, a fridge, a lift, a bridge, a safe, a bakery oven, a desalination plant, a house that
survives an earthquake. Start from the simplest version («لوح واحد ولمبة», «حفرة وسجادة»). If the topic is "how does X
work" with nothing to build, say so and suggest the animation or sketch style.

When the user asks for topic ideas, give a table: topic, then its hook line «لو …، يبقى عندك …» plus the first «بس…»; mark
the two you recommend and why (things Egyptians see every day, many problem → fix rounds).

## 2. Script → `videos/<slug>/script.txt`

- 23–26 lines, one sentence per line, 270–290 words → 1:45–1:55 of voice. Casual Cairo Egyptian Arabic, «إنت» throughout
  («بتحط», «بتركّب», «بتحفر»).
- Shape (from the reference transcripts, in our dialect):
  - line 0: «لو <the naive simple version>، يبقى عندك <the thing>.» (a statement, can be a question);
  - line 1: «بس المشكلة إن …» (why it fails);
  - then 6–9 rounds of **«بس …» → «عشان كده بت… …»**, each fix adding ONE visible part, many with a real number, and some
    naming the part: «…، وده اسمه منظّم الشحن» / «ودي اسمها طلمبة الرشح»;
  - one surprise pair near the end: «والغريب إن ناس كتير فاكرة إن …» → «والحقيقة إن …» with the number, then its fix;
  - one line of finishing touches: «وكده فاضل عليك …، و…، و…»;
  - the payoff: «ومبروك عليك، عملت <the thing> بنفسك.»;
  - last line, exactly: «قولولنا، عايزين تعرفوا حكاية إيه المرة الجاية؟».
- No mid-video plug (theirs says "الرابط في البايو"; we don't). No «إيه الحكاية؟ هشرحهالك في دقيقة.» line.
- Numbers the voice must say are written as words («خمسمية وات», «ستاشر في المية»).
- Verify every fact (WebSearch), write `refs/SOURCES.md` with links, and leave out what can't be confirmed (say so there).
  Tell the user which facts are surprising and that they were checked.
- Keep it natural (the `humanizer` skill's rules), keep the «بس / عشان كده» chain and the last line word for word.
  Show the script in one copy-ready code block and commit it.

## 3. Voice (generated here with Gemini TTS; the key comes from the environment, never read or print it)

`videos/<slug>/style.txt` (fill in the topic and the key words):

```
Speak in casual Egyptian Arabic (Cairo dialect), like a friendly YouTuber walking the viewer step by step through <building the thing>, each problem followed by its fix. Warm, confident and curious, with real amazement on the surprising facts and numbers, and a little suspense on each "بس" problem before the "عشان كده" fix. Natural, relaxed conversational speed, not rushed. Take a short natural breath between sentences, and don't stop at commas. Emphasize key words like <word>, <word>, <word>. Make the opening line intriguing and the final "ومبروك عليك" proud and playful. Never use Modern Standard Arabic pronunciation; pronounce ق as a glottal stop like Cairenes.
```

From `videos/<slug>/`:

```
python3 ../tools/tts.py script.txt style.txt voice-raw.wav --voice Puck --model gemini-3.8-flash-tts
M=<scratchpad>/asr/sherpa-onnx-whisper-small   # once: curl -L https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/sherpa-onnx-whisper-small.tar.bz2 | tar xj
python3 ../audio/tighten.py voice-raw.wav voice.wav --max 0.3
python3 ../align_asr.py voice-raw.wav script.txt raw-timing.json --model $M --gap 0.08 --db -34
python3 ../map_timing.py voice-raw.wav raw-timing.json voice.wav timing.js --max 0.3 --tempo 1.0
```

- If `voice-raw.wav` is missing after tts.py, run it once more (it can fail silently). A 429 = daily quota: tell the user.
- Read the heard-text column: a line that heard far more words than it has means invented text → generate again. Natural
  speed only, never atempo. Too long → shorten the script.

## 4. The look (measured from the references; `videos/_reference/law/README.md`)

- **Full bleed 9:16**: one SVG `viewBox="0 0 1080 1920"` redrawn every frame; the page is 360×640 CSS px rendered ×3.
- **"2.5D" vector**: gradients, inner shading, soft drop shadow (`filter="url(#sh)"`), highlights on glass/metal, thin dark
  outlines (`INK #2a2522`). A sky with a big soft sun glow and drifting clouds, a faded far town and palms, the ground
  line with grass, the earth cut open below with a stony soil texture; buildings cut open to show inside.
- **One scene that grows**: the build is drawn once with every part as a switch; each «عشان كده» line brings its part in
  with motion (lowered, poured, slid, drawn along its path) and it stays in later lines.
- **Camera**: always moving inside the scene, `[cx, cy, zoom]` from → to per line with a slow drift and a 0.35 s
  cross-zoom from the last shot. Frame the action: the man and the new part fill the frame (roof shots ≈ zoom 1.5–1.9).
  The payoff pulls back to the whole build.
- **Caption: one word at a time**, white, Noto Sans Arabic 900 40 px CSS, 7 px dark stroke, soft shadow, low on the
  screen (`top: 536px`) so it never covers the man; keywords in yellow (`K` in `build.py`).
- **Labels**: dark rounded pills with a pointer (`pill()`), yellow/green text for fixes, a red pill for failures
  («هيقع عليك!», «محبوس!»); a red ✗ in a circle (`xmark`) on what fails, a green ✓ (`vmark`), a yellow pulsing ring
  (`ring`) on the new part. Night (`sky(t, true)`) for "no power at night"-type problems; confetti on the payoff.
- **Brand**: the small red «إيه الحكاية؟» badge top-left (in the template).
- Sizes are real: the man is ≈1.75 m against the build (a 3 m floor ≈ 230–280 units → man scale ≈ 0.56 next to a
  building; scale 1 inside a 460-unit-high basement).

## 5. Build: copy the template episode

```
mkdir -p videos/<slug>/law && cp videos/solar-building/law/{template.html,build.py,scene.js} videos/<slug>/law/
```

- `template.html`: the 9:16 page, gradients in `<defs>`, then `../timing.js`, `window.LAW_GY = <ground y>`, the kit
  `../../_templates/law/kit.js`, then `scene.js`. Set the `<title>`; add gradients the new objects need.
- `build.py`: set `K` (caption keywords). `python3 build.py` → `index.html` with word timings spread over each line.
- `scene.js` (the episode): draw the place as functions (`building()`, `flat()`, `panel()`…), a `scene(t, o, h)` that
  stacks `K.sky`, palms, `K.ground`, the place and the parts from `K.has(o)`; `K.steps([[line, {part: 1}], …])` turns a part
  on from the line AFTER the one that adds it (that line draws it arriving itself); then exactly one
  `K.shot(line, [cx, cy, z], [cx, cy, z], function (u, d, t) { … })` per script line (`u` time into the line, `d` its
  length, `t` absolute). Export what the cover needs (e.g. `window.__solar = { scene: scene }`).
- **The kit** (`videos/_templates/law/kit.js`, `window.LAW`): helpers `R P F C T clamp ease lerp hash pop`, `sky`, `palm`,
  `bush`, `ground`, the man (`man`, `POSES`, `pose`, `mixPose`, `act`), `pill`, `xmark`, `vmark`, `ring`, `confetti`,
  `arrowH`, `arrowV`, `shot`, `steps`, `has`, `setLine`. Improve the kit rather than copying code into an episode.

### Acting with `act(u, keys, t)`

`keys = [[u0, {x, y, f, p, mood, …}], [u1, {…}], …]`: position eases between keys, the pose blends over the last 0.45 s.
`y` is the floor his feet stand on; `hip: [x, y]` instead for sitting or climbing; `f` 1/−1 facing; `jump: 1` on a key =
cut to that position (moving to another room/floor); `s` scale; `shirt`/`vest`/`hat` for other people (visitor,
engineer). A key with a different `x` and no pose walks him there. Poses: `stand walk dig hammer caulk climb shock cover
cheer thumbs point pointUp worry cough push breathe shrug collar wave reach crouch sit sitDesk ear hush`; moods:
`n happy proud shock worry dizzy sick`.

Each line needs both: **«بس…» lines** end on a failure reaction (`shock`, `cover`, `worry`, `cough`, `collar`+`dizzy`),
**«عشان كده…» lines** show him doing the fix (`push`, `hammer`, `reach`, `caulk`, `crouch`) then a success reaction
(`thumbs`, `cheer`, `breathe`+`happy`). He is never frozen through a line.

## 6. Joints and actions must be physically right

- Angles are from straight down, + towards where he faces; `lean` + leans the torso FORWARD (working, digging,
  coughing, pushing, crouching, picking up = forward, head over the hands).
- An elbow only folds forward/up (forearm ≥ upper arm), a knee only folds backward (shin ≤ thigh); `man()` clamps both.
- A tool's working end points at what it works on: the shovel blade goes down into the ground in front of his feet (top
  hand at the chest, lower hand forward on the handle) with a push-down stroke and a lift-and-toss stroke; a hammer head
  hits the nail; a caulk nozzle touches the crack; a reaching hand ends on the book or the box.
- Feet on the floor he stands on (never floating or sunk), sitting on the seat, climbing on the rungs; no body part
  through a wall, floor, ceiling or furniture; people stay in frame.

## 7. Checks (full mode) — all before rendering

```
cd videos/<slug>/law && python3 build.py
node -e "global.window={};const fs=require('fs');eval(fs.readFileSync('../timing.js','utf8'));window.LAW_GY=<GY>;eval(fs.readFileSync('../../_templates/law/kit.js','utf8'));eval(fs.readFileSync('scene.js','utf8'));let n=0;const s={set innerHTML(v){if(/NaN|undefined/.test(v))n++}};for(let t=0;t<window.TIMING.duration;t+=0.2)window.__scene(s,t);console.log('bad frames',n)"
node ../../tools/fsheet.js $PWD/index.html <scratch>/sheet 2.2     # one frame per line; tile with ffmpeg and LOOK
# poses: open videos/_templates/law/poses.html?ep=<slug> in playwright at 2000×1650, screenshot, LOOK
node ../../tools/motion.js $PWD/index.html 0 <duration>             # aim ≤ 0.3 s still
```

Tile the sheet: `ffmpeg -framerate 1 -i sheet/%02d.png -vf "tile=8x3:padding=4" -frames:v 1 sheet.png`. Look for:
a man too big/small for the build, a man at the frame edge, labels cut off or over his face, empty graphs, parts drawn
before their line, overlaps (screens on batteries), wrong joints. Fix and look again (usually 2–3 rounds).

## 8. Sound effects (no music)

`videos/<slug>/cues.js` → `cues.json` (copy `videos/solar-building/cues.js`): a whoosh before every line, then effects
on the actions with `a(t, fx, gain, dur)`; synthesized `fx_*` in `videos/audio/sfx.py` (pop, chime, ping, beep, tick,
whoosh, wipe, thud, clank, creak, motor, hum, zap, spark, sizzle, charge, servo, boom, drip, fill, slosh, steam, spin,
bell, notify…). Recorded clips with `rec(t, file, gain, from, dur, duck)` from `videos/*/sfx/px-*.mp3` and the kit
`videos/_templates/sketch/sfx/` (ding, water-rush, wind-gust, clock-ticking, swipe, paper; the cough, exhale and heartbeat
clips sit in `videos/secret-basement/sfx/`). Never the `px-music-*` files. Missing real sounds: ask the user for Pixabay
clips (they download them; never get around the bot check).

```
node cues.js && python3 ../audio/sfx.py voice.wav cues.json <scratch>/<slug>-mix.wav
```

## 9. Render and QA (from `videos/`, in the background; ~40–60 min for this look)

```
TAIL=1.5 node render.js $PWD/<slug>/law/index.html <mix.wav> <scratch>/<slug>-raw.mp4
ffmpeg -y -i <raw.mp4> -c:v copy -af "alimiter=limit=0.6:level=false:attack=1:release=60" -c:a aac -b:a 192k -ar 48000 <final.mp4>
python3 qa.py <final.mp4>     # must say PASS: no still > 0.75 s, frozen total in budget, ≈ −14 LUFS
```

A render loads `scene.js` once at the start: finish every edit before starting it (if you edit after, stop it and
restart). Send the mp4 with SendUserFile; keep mixes and mp4s in the scratchpad, never in git.

## 10. Cover and titles (always)

- **Cover** `brand/eh-elhekaya/cover-<slug>-tiktok.html` (copy `cover-solar-building-tiktok.html`): 540×960, the video's own
  scene (load timing.js, the kit, the episode's scene.js, `K.setLine(<last line>)`) zoomed on the finished build with the
  man reacting and one or two pills with the key numbers; dark fades top (0–330) and bottom (660–960); text in Noto Sans
  Arabic: «إيه الحكاية؟» 15 px at 132, the hook title 900 34–42 px at 154 (one line), a yellow 800 24 px sub-title at 214,
  the surprise punch line 800 34 px at 722 with the number in yellow (Arabic digits «١٦٪» so it reads right-to-left) and a
  grey 24 px second line. Keep all text inside y 120–840 and `left: 24px; right: 64px`.
  `node videos/tools/cover.js $PWD/<html> $PWD/brand/eh-elhekaya/tiktok-cover-<slug>-1080x1920.png`, look, fix, send.
- **Titles** in `videos/<slug>/titles.md` and in the reply, each in its own code block: TikTok 3 hook titles + a short
  description with hashtags (#إيه_الحكاية first); Instagram (shared to Facebook) one title + a longer description with 3–4
  emoji bullets and the closing question; YouTube Shorts one title ending in #shorts + a two-line description.

## 11. Git

Commit and push each step on the session's branch (script + voice; scene + cues; cover + titles), never the mp4s or mixes.
