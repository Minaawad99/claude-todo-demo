---
name: story-2d
description: |
  Make an «إيه الحكاية؟» video in the «القصة 2D» style the user picked: a true, moving story (about 3 minutes) told by a
  calm storyteller in Egyptian Arabic, drawn as full-screen cinematic 2D frames — cel-shaded SVG with dark outlines, hard
  light, light rays, dust and film grain, triptych panels, and characters with real proportions and faces — 1080×1920
  60 fps. Built like the Hiroshima video «هيروشيما: الساعة تمانية وربع» (`videos/hiroshima/`), inspired by the illustrated
  train pictures the user sent. Use when the user says "القصة 2D", "القصة الـ2D", "بأسلوب القصة 2D", "زي فيديو هيروشيما
  الأولاني" or "story 2D style".
---

# «إيه الحكاية؟» — the «القصة 2D» style

A separate style: use it only when the user names it (the 3D version is the `story` skill «القصة»). Talk to the user
in Egyptian Arabic. Show each stage before the next (the user's rule: "اعمله واعرضه عليا الأول"). The reference build is
`videos/hiroshima/` (script, style, cues, `film/`); start every new video from a copy of `videos/hiroshima/film/`.

## 1. Script → `videos/<slug>/script.txt`

About **3 minutes**: 33–36 lines, one sentence per line, about 360–380 words (the storyteller reads about 125 words a
minute with its pauses; the Hiroshima script, 35 lines and 371 words, came out at 2:58 after trimming pauses).

- Casual Cairo Egyptian Arabic, calm and moving, no hype.
- Shape (as in Hiroshima):
  - line 0: the moment itself as a hook («الساعة تمانية وربع الصبح… وفي ثانية واحدة، مدينة كاملة اختفت.»);
  - lines 1–2: the questions the story answers;
  - line 3: «إيه الحكاية؟ تعالوا أحكيهالكم من الأول.»;
  - the story in time order, each line one moment, with real numbers and times;
  - a thread of real people to follow (the girl tram drivers, Sadako), planted early and brought back at the end;
  - a callback line («طب فاكرين…؟») and an ending of quiet hope and remembrance;
  - last line exactly «قولولنا، عايزين تعرفوا حكاية إيه المرة الجاية؟».
- Use «…» where the voice should pause: in this style the pauses are wanted.
- Numbers as words; verify every fact and tell the user which were checked. Humanizer pass, one copy-ready code block,
  commit.

## 2. Voice

Generated here with `videos/tools/tts.py` (Puck, `gemini-3.8-flash-tts`, temperature 1; about 10 free requests a day,
a 429 means wait) or made by the user in AI Studio from the script and this style text (`videos/<slug>/style.txt`);
offer a short sample first (`--lines`):

```
Speak in casual Egyptian Arabic (Cairo dialect), like a calm, heartfelt storyteller telling a true, tragic story to a friend late at night: <the story>. Low, warm, intimate voice, close to the microphone, never excited or salesy, never like a YouTuber. Slow, unhurried pace with real pauses: a long pause at every "…", and a short breath between sentences. Let the tension build quietly before <the turning point>, almost a whisper on "<key word>", then heavy, sad and respectful on the numbers of the dead. Gentle and tender on <the people we follow>. Make "إيه الحكاية؟" soft and inviting, not playful. End with quiet hope on the last lines. Never use Modern Standard Arabic pronunciation; pronounce ق as a glottal stop like Cairenes.
```

Audio pipeline as in the animation skill (section 4) with longer pauses kept: `tighten.py --max 0.6`,
`map_timing.py ... --max 0.6`; read the heard text of every line (an extra sentence means an invented take).

## 3. The look (fixed; `film/template.html`, `film/_helpers.js`, `film/shots.js`, `film/build.py`)

- **Full bleed:** one SVG (`viewBox 0 0 360 640`) fills the 360×640 page; dark fades top and bottom; a small chip
  («هيروشيما · 6 أغسطس 1945») on the opening lines; captions Noto Sans Arabic 800 19px (17px over 62 characters) at
  top 470px with a text shadow, keywords yellow `#f2c230` (`K` in `build.py`), word-by-word reveal; brand at the bottom.
- **Painted, cinematic, cel-shaded** like the user's train pictures: flat colours, ink outlines (`INK #121419`), one hard
  shadow shape per part (`cel()` clips a darker copy to the side away from the light), warm light rays (`rays`), dust
  (`dust`), vignette and film grain on every frame, sky gradients per mood (morning, high altitude, fire, ash, dusk, today).
- **Characters** (`person`, `portrait`, `face` in `_helpers.js`): real proportions (about 7 heads), faces with brows,
  almond eyes with a highlight, a small nose line and a mouth, lashes for women, hair with volume (short, bob, bun, cap),
  period clothes (monpe trousers), walking cycle, blinking close-ups, a child face option. Big figures in the foreground
  (scale 2–2.6) and close portraits for the emotional lines (`portrait(... { rim: true })`).
- **Compositions:** wide establishing frames, interiors seen from behind a character (the tram cab), triptychs of three
  stacked panels (`tri()`, like the user's three-panel picture), split frames for "meanwhile", big quiet numbers
  (`bigNum`) and labels (`label`).
- **Real shapes:** draw every object from its real shape (look at photos first; Wikimedia Commons as in the animation
  skill, and if it blocks you, say so and use the documented features). Note the sources in `refs/SOURCES.md`.
- **Motion:** every shot keeps the camera creeping (`push`), plus the drift in `__panel`, and something moving in the
  frame; shots cross-fade over 0.35 s. White flashes and dark holds need moving rings, rays or dust (qa.py counts a
  plain white frame as still).

Build with `python3 build.py`, look at a contact sheet of full frames, fix, and send the user a preview sheet before
the render.

## 4. Sound (`videos/<slug>/cues.js`, `{"bed": false}`)

The series music box (`../_templates/sketch/sfx/px-music-soft.mp3`, referenced by path) under the calm parts and again
for the aftermath to the end; a ticking clock that stops on the hook; real details (tram bell = `bell`, a siren made
with ffmpeg into `sfx/siren.wav`); a low drone (`px-space-drone.mp3`) and ticks during the countdown; boom + thud + wind
gust and near-silence at the turning point; paper sounds, a low `bell` with `f: 220` for remembrance. Soft whooshes
(gain ~0.12) between lines. See `videos/hiroshima/cues.js`.

## 5. Render and QA (background, about 30 minutes for 3 minutes)

```
TAIL=1.5 node render.js $PWD/<slug>/film/index.html <mix.wav> <scratchpad>/<slug>.mp4
ffmpeg -y -i <mp4> -i <mix.wav> -map 0:v -map 1:a -c:v copy -t <dur> -af "apad,afade=t=out:st=<dur-0.8>:d=0.8,aresample=192000,volume=6dB,alimiter=limit=0.5:level=false:attack=1:release=80,loudnorm=I=-14:TP=-1.5:LRA=11,aresample=192000,alimiter=limit=0.8:level=false:attack=1:release=60,aresample=48000" -c:a aac -b:a 192k -ar 48000 -movflags +faststart <final.mp4>
python3 qa.py <final.mp4>
```

The quiet storyteller voice comes out near -16 LUFS without that remux; with it, about -14.4 LUFS. QA must PASS. Send
the mp4, commit and push; keep mixes and videos in the scratchpad. Cover and titles follow the animation skill's
section 9 when the user asks.
