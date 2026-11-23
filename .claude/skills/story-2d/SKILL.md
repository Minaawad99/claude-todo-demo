---
name: story-2d
description: |
  Make an «إيه الحكاية؟» true-story video the way the Titanic video «تيتانيك» was made (the user's best-performing
  video, fixed as the standard for every story): a cinematic cold open that grabs the eye in the first second, a calm
  storyteller in Egyptian Arabic telling the night hour by hour, drawn as full-screen cinematic 2D frames — cel-shaded
  SVG with dark outlines, hard light, light rays, dust and film grain, characters drawn with the shared person kit (videos/_templates/people/person.js) —
  1080×1920 60 fps. Reference build `videos/titanic/`. Use whenever the user asks for a story: "اعملي قصة",
  "عايز أعمل قصة", "قصة عن…", "حكاية…", "القصة 2D", "زي فيديو تيتانيك", "زي فيديو هيروشيما الأولاني" or "story 2D style"
  (the 3D «القصة» skill only when the user says 3D). Every story opens on a REAL recording or real footage of the event
  (black box, air-traffic control, a distress call, a broadcast, a witness video) and plays more real clips inside the
  story, as in «عبّارة السلام 98» (`videos/salam98/`).
---

# «إيه الحكاية؟» — the «القصة 2D» style (the Titanic recipe)

**This is the standard for every story.** When the user says "اعملي قصة" (or any story request without naming 3D),
use this skill and the Titanic recipe below: the Titanic video got the channel's highest views, and the user fixed its
narration and its opening as the style. The 3D version (`story` skill) is only for when the user says 3D.

**Reference before every drawing (the user's rule for every skill):** before you draw any object, body part, machine, place or scene, look it up in `videos/_reference/README.md` (a subject index of the 34 reference videos and of our own episodes), open the frames that show it and see how it was cut open, labelled and framed. Then draw it in this skill's own style. Never copy a drawing.

Talk to the user in Egyptian Arabic. Show each stage before the next (the user's rule: "اعمله واعرضه عليا الأول"). The
reference build is `videos/titanic/` (`script.txt`, `style.txt`, `cues.js`, `film/`); start every new video from a copy
of `videos/titanic/film/` (Hiroshima `videos/hiroshima/` and Chernobyl `videos/chernobyl/` are later examples of the
same look; Chernobyl also shows real-photo cards).

## 0a. The real hook — open on something that really happened (fixed after «عبّارة السلام 98», the user's rule)

«عبّارة السلام 98» (`videos/salam98/`) opened on the ferry's real black-box voice and played two more real clips inside
the story; it got very high views and the user fixed it as the way every story script is written from now on. It sits
on top of the Titanic recipe below: the real clip comes first, then the Titanic cold open, the clock thread and the rest.

**Pick a story that has real material.** Before writing, find what real sound or picture of the moment exists and say
which in the topic proposal: a black box / VDR or cockpit recording, air-traffic or coast-guard radio, a distress or
emergency call, a live radio or TV broadcast, a witness phone video, a famous real line («Houston, we've had a problem»).
Prefer official or public-domain sources (NASA, FAA/ATC archives, court records, the investigation report). When there
is no audio, only a published transcript, say so plainly and use the transcript as an on-screen quote, never a fake
"recording".

**The script shape.**
- **Line 0 is the real clip, not the narrator:** 5–8 seconds, the most gripping words of the event (Salam 98: «المركب
  بتغرق يا قبطان!»). The caption shows the words in «…». Nothing before it: no title, no voice-over.
- **Line 1 says it is real and whose voice it is:** «الصوت ده حقيقي… من الصندوق الأسود لـ…». Then the Titanic cold open:
  date and place, the people, the scale number, two questions, «ودي حكاية الليلة دي، ساعة بساعة. نبدأ من …».
- **Two more real clips inside the story,** each at the moment it belongs to (Salam 98: «احنا نزلنا عشرين درجة…
  المركب هتقلب!» right before the roll, «المركب غرقت يا قبطان… لا حول ولا قوة إلا بالله» right after it). The line
  before a clip sets it up («…الصوت في كابينة القيادة بقى كده:»); the line after it lets it land («ودي من آخر الأصوات
  اللي اتسجلت.»). One clip goes right after the climax, never as the opening repeat.
- **Pay the hook off near the end:** say where the recording came from («الصندوق الأسود طلع من قاع البحر… ومعاه
  الأصوات اللي سمعتوها»).
- Put each clip line in `script.txt` with the words heard; the narrator's lines alone go in `voice-script.txt` for TTS.

**Getting the clips.** YouTube and most video sites are blocked from this container: ask the user for the file by name
(the video title or link) and wait for it; carry on with the script meanwhile. In the file:
- read the burned-in subtitles every 0.5 s (`fps=2,crop=…` tiles) and find each line's seconds; whisper is useless on
  noisy radio audio;
- cut each clip with `highpass=f=140,lowpass=f=5000`, short fades and `loudnorm=I=-16:TP=-2` into `sfx/px-<name>.mp3`;
- tell the user the clip words were read from the subtitles and ask them to confirm by ear before posting.

**Timing.** `videos/salam98/clips.py` cuts gaps into the tightened narration (`voice-narr.wav`) after the narrator line
each clip follows, writes `voice.wav`, `script.txt` and `timing.js` with `TIMING.clips`; `cues.js` mixes each clip in at
its time with `duck: false` and a low drone under it. Copy it and edit its `CLIPS` list.

**On screen during a clip.** A dark «تسجيل حقيقي · <source>» bar with a red REC dot and a moving orange level meter
(`rec()` in `videos/salam98/film/shots.js`), over a frame of that exact moment (the ship listing 20°, the sea closed
over her). Add real photos as «صورة حقيقية» cards (`photoCard()`), at least the subject itself and one of the event.

**The reel cover.** Write the user a Gemini / AI Studio image prompt in English, in a code block, every time, without
being asked (the user's rule): the subject drawn from its real reference photo (say "use the attached photo as the
reference for the shape" and tell them to attach it), the key moment, the channel's cel-shaded look, 9:16, top and
bottom quarters left empty for the titles, and "Strictly no text anywhere in the image". Build the cover on their
picture as in `brand/eh-elhekaya/cover-salam98-tiktok.html`; until it arrives, a frame from the film stands in.

**The captions (TikTok and Instagram).** Two lines at most, because the platform shows only those: line 1 makes them
watch to a moment (Salam 98: «الصندوق الأسود سجّل آخر دقايق في العبّارة… اسمع اللي اتقال عند 2:14»), line 2 is a
question that asks for a comment («كنت فين لما سمعت الخبر؟»), then 4 hashtags. Never retell the story or repeat the
words already on screen: the first Salam 98 caption did both and got 6 comments for 81 saves.

## 0. The Titanic recipe — why it works (keep all of it)

**The cold open (lines 0–6, the first ~25 seconds).** No greeting, no channel name, no «تعالوا أحكيهالكم».
- Line 0 drops the viewer *inside the scene*: date + place as a film title («ليلة أربعتاشر أبريل سنة ألف تسعمية
  واتناشر، في نص المحيط الأطلنطي.»). Shot 0 is already a full cinematic frame in motion from frame one: the subject
  itself (the ship sailing at night, stars, sea glints), the camera creeping, the date in big white type and the place
  in yellow popping in by 0.3–0.8 s. Ambient sound starts at 0.0 s (waves + wind), never silence.
- Lines 1–2: atmosphere in the senses (cold, stars, a sea still as glass), then scale with one big number on screen
  («أكتر من ألفين ومتين إنسان» → `bigNum("2,200+")`).
- Line 3: the irony the whole story will break («السفينة اللي ما بتغرقش»), one huge word on screen.
- Lines 4–5: two sharp questions with a number and a mystery («إزاي غرقت في ساعتين وأربعين دقيقة؟» / «ليه أقرب
  سفينة شافت الصواريخ… وما اتحركتش؟»). The second question is a hook that is only paid off at the end.
- Line 6: the promise and the frame of the telling: «ودي حكاية الليلة دي، ساعة بساعة. نبدأ من الصبح.»

**The narration (the body).**
- A clock thread: every few lines starts with a time («الساعة حداشر وأربعين دقيقة…»), and the time is on screen.
- A chain of small, human mistakes that add up (the cancelled drill, the ignored warning under a paperweight, the
  binoculars locked in a cupboard): each one short, concrete, almost unbelievable.
- A planted thread with an explicit order to remember it («افتكروا السفينة دي.») and a callback later («فاكرين
  كاليفورنيان؟»), paid off again at the end («عرفت الصبح… لما عاملها صحي»).
- Quoted dialogue in Egyptian, short and blunt («اسكت! أنا مشغول.»; «زعق: جبل جليد قدامنا!»).
- A turn line «وهنا بدأت الحكايات.» before the human stories: a couple's last words, the band playing to the end.
- **An Egyptian / Arab link when one exists** (Hamad Hassab, the Egyptian translator who survived): introduced
  mid-story, and he gets the last line before the CTA. Research one for every story; it drove comments.
- One second-person line of immersion («تخيّل إنك واقف على السطح، والأرض بتميل تحت رجلك…»).
- The climax as three short beats with «…» and a whisper («…ونزلت.»), then the number of the dead, heavy and plain.
- One strange survival fact, the rescue, the bitter callback, what changed after (the law), the Egyptian person.
- **The mid-video bio line (always, the user's rule):** one line in the middle of the video, about 50–65% in, placed
  right after a cliffhanger so nobody leaves: the line before it opens a question that the next scene answers (in
  Titanic it would sit right after «تخيّل إنك واقف على السطح، والأرض بتميل تحت رجلك…», before the ship breaks). Then
  the bio line, then straight back into the scene:
  - the cliffhanger: «…وفي اللحظة دي حصل اللي محدش كان متوقعه.» (or the story's own suspense line);
  - the bio line, word for word: «ولو عايز تعمل فيديوهات زي دي… اضغط على اللينك اللي في البايو.»;
  - back in: «نرجع للسفينة…» / «نرجع لـ<place/person>…», and the next line pays off the cliffhanger.
  On screen during the bio line: the scene keeps moving behind it (the frozen cliffhanger frame with the camera still
  creeping), and a yellow pill «اللينك في البايو ↑» near the top; one soft `pop` on the pill. In the voice style text
  add: "say the bio line warmly and quickly, like a friendly aside, then drop back into the story's tension".
- Sentences short; one moment per line; real numbers and times; no hype words, no MSA.
- Last line exactly «قولولنا، عايزين تعرفوا حكاية إيه المرة الجاية؟».

**Length:** about 45–50 lines, 560–620 words → about 3:45 (Titanic: 47 lines, 3:46). Longer only if the user asks
(Chernobyl ran 61 lines, 4:56).

## 1. Script → `videos/<slug>/script.txt`

Follow section 0 line by line (open with `videos/titanic/script.txt` beside you). Casual Cairo Egyptian Arabic, calm
and moving. Use «…» where the voice should pause. Numbers as words; verify every fact and tell the user which were
checked. Humanizer pass, one copy-ready code block, commit.

## 2. Voice

Generated here with `videos/tools/tts.py` (Puck, `gemini-3.8-flash-tts`, temperature 1; about 10 free requests a day,
a 429 means wait) or made by the user in AI Studio from the script and this style text (`videos/<slug>/style.txt`);
offer a short sample first (`--lines`). Start from `videos/titanic/style.txt` (it ends with "Say only the text given, nothing more.", which stops invented takes):

```
Speak in casual Egyptian Arabic (Cairo dialect), like a calm, heartfelt storyteller telling a true, tragic story to a friend late at night: <the story>. Low, warm, intimate voice, close to the microphone, never excited or salesy, never like a YouTuber. Slow, unhurried pace with real pauses: a long pause at every "…", and a short breath between sentences. Let the tension build quietly before <the turning point>, almost a whisper on "<key word>", then heavy, sad and respectful on the numbers of the dead. Gentle and tender on <the people we follow>. Make "إيه الحكاية؟" soft and inviting, not playful. End with quiet hope on the last lines. Never use Modern Standard Arabic pronunciation; pronounce ق as a glottal stop like Cairenes.
```

Audio pipeline as in the animation skill (section 4) with longer pauses kept: `tighten.py --max 0.6`,
`map_timing.py ... --max 0.6`; read the heard text of every line (an extra sentence means an invented take).

## 3. The look (fixed; `film/template.html`, `film/_helpers.js`, `film/shots.js`, `film/build.py`)

- **Full bleed:** one SVG (`viewBox 0 0 360 640`) fills the 360×640 page; dark fades top and bottom; a small chip
  («تيتانيك · 14 أبريل 1912») on the opening lines; captions Noto Sans Arabic 800 19px (17px over 62 characters) at
  top 470px with a text shadow, keywords yellow `#f2c230` (`K` in `build.py`), word-by-word reveal; brand at the bottom.
- **Painted, cinematic, cel-shaded** like the user's train pictures: flat colours, ink outlines (`INK #121419`), one hard
  shadow shape per part (`cel()` clips a darker copy to the side away from the light), warm light rays (`rays`), dust
  (`dust`), vignette and film grain on every frame, sky gradients per mood (morning, high altitude, fire, ash, dusk, today).
- **Characters:** the page copied from `videos/titanic/film/` already loads `../../_templates/people/person.js` before
  `scenes.js`; draw every person with `PERSON.front` / `PERSON.side`, never with an older figure function from the copied
  episode. **People: the shared person kit, always** (the user's fixed rule for every skill): every human is drawn with `videos/_templates/people/person.js` (read `videos/_templates/people/README.md`; demo `videos/person-demo/`). Use `PERSON.front()` for the front or three-quarter view and `PERSON.side()` for walking and for lying flat (`rot: -90`). It keeps real proportions (fingertips at mid-thigh), flowing limbs with the joints hidden in one outline, straight reaching arms, five-finger hands with nails, and a face that acts. Add a missing pose or costume to the kit; never draw a person another way. In this skill call `PERSON.front` and `PERSON.side`, because the film helpers have their own `person()`. Set `PERSON.setInk("#121419")`, dress each character with `colors` (period clothes), and lay the cel shadow, light rays and grain over them. Big figures in the foreground (scale 2–2.6). Close-ups use `PERSON.head` for the emotional lines. A costume or a child the kit lacks is added to `person.js`. The old `person`/`portrait`/`face` from `film/_helpers.js` are retired for people. **Clothes follow the topic:** dress every person for who they are in this video with `outfit` (presets `home`, `casual`, `office`, `doctor`, `worker`, `pilot`, `chef`, or your own parts and colours; see `videos/person-demo/outfits.html`). Add a missing outfit to the kit, front and side.
- **Compositions:** wide establishing frames, interiors seen from behind a character (the tram cab), triptychs of three
  stacked panels (`tri()`, like the user's three-panel picture), split frames for "meanwhile", big quiet numbers
  (`bigNum`) and labels (`label`).
- **Real shapes:** draw every object from its real shape (look at photos first; Wikimedia Commons as in the animation
  skill, and if it blocks you, say so and use the documented features). Note the sources in `refs/SOURCES.md`.
- **Shot 0 = the hook frame:** the most beautiful, most recognisable frame of the subject (the real shape from
  photos), already moving at t=0, title-card date/place in big type. Never open on a black frame, a logo, a map or a
  person talking. Shots 1–5 keep the same place and light (one world), each adding one big word or number on screen.
- **Real photos (optional, as in Chernobyl):** small framed prints («صورة حقيقية») in an empty corner, never over a
  drawing, a label or the captions; check every card on a full-frame sheet.
- **Motion:** every shot keeps the camera creeping (`push`), plus the drift in `__panel`, and something moving in the
  frame; shots cross-fade over 0.35 s. White flashes and dark holds need moving rings, rays or dust (qa.py counts a
  plain white frame as still).

Build with `python3 build.py`, look at a contact sheet of full frames, fix, and send the user a preview sheet before
the render.

## 4. Sound (`videos/<slug>/cues.js`, `{"bed": false}`) — effects only, no music

**No background music unless the user asks for it** (the user's rule). The mix is the voice plus effects made for the
story: a ticking clock that stops on the hook, real details (tram bell = `bell`, a siren made with ffmpeg into
`sfx/siren.wav`), a low drone (`px-space-drone.mp3`) and ticks during a countdown, boom + thud + wind gust and
near-silence at the turning point, paper sounds, a low `bell` with `f: 220` for remembrance, soft whooshes (gain ~0.12)
between lines. Leave out the `px-music-*` clips.

## 5. Render and QA (background, about 30 minutes for 3 minutes)

```
TAIL=1.5 node render.js $PWD/<slug>/film/index.html <mix.wav> <scratchpad>/<slug>.mp4
ffmpeg -y -i <mp4> -i <mix.wav> -map 0:v -map 1:a -c:v copy -t <dur> -af "apad,afade=t=out:st=<dur-0.8>:d=0.8,aresample=192000,volume=6dB,alimiter=limit=0.5:level=false:attack=1:release=80,loudnorm=I=-14:TP=-1.5:LRA=11,aresample=192000,alimiter=limit=0.8:level=false:attack=1:release=60,aresample=48000" -c:a aac -b:a 192k -ar 48000 -movflags +faststart <final.mp4>
python3 qa.py <final.mp4>
```

If the mix has loud explosions and qa.py reports a peak above -0.5 dBFS, use the harder chain (Chernobyl: -14.5 LUFS,
peak -2.8 dBFS): `volume=7dB,alimiter=limit=0.45:level=false:attack=1:release=80,loudnorm=I=-14:TP=-2.5:LRA=9,aresample=192000,alimiter=limit=0.7:level=false:attack=1:release=60`.
Dark night scenes need more motion than day ones: a stronger camera drift and moving glints, boats or embers (Titanic).

The quiet storyteller voice comes out near -16 LUFS without that remux; with it, about -14.4 LUFS. QA must PASS. Send
the mp4, commit and push; keep mixes and videos in the scratchpad. Cover and titles follow the animation skill's
section 9, and the cover prompt and captions follow section 0a; send them with the video without being asked.
