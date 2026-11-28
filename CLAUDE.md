# إيه الحكاية؟ — project notes for Claude

- Talk to the user in Egyptian Arabic.
- **People in every video, in every skill (sketch, animation, story-2d, law, and any skill made later): the Gemini person
  kit** `videos/_templates/people/gemini/` (read its `README.md`; `PERSON.sprite(name, x, feetY, height, {t})` from
  `sprites.js`, every sprite in `catalog.png`). The user chose it after the miswak review (Nov 2026): figures from Gemini
  character sheets, cut out as transparent sprites, never people drawn by code again. One character per episode; other
  people in the story from the outfit sets (office, doctor, worker, home, galabeya, a woman in hijab). A pose or outfit
  that is missing: make a new sheet with the prompts in that README (the user runs them in Gemini, or Claude does through
  the connected Gemini API) and cut it with `cutout.py`. The old vector kit `people/person.js` stays only for episodes
  already made.
- **The reference videos are the model for how anything is drawn, in every style and every skill:** before drawing any
  object or scene, look it up in `videos/_reference/README.md` (subject index of the 20 «طب إزاي؟» videos, the 14 «لو»
  videos and our own episodes; the big media sits in the private repo `Minaawad99/claude-media`), look at how it was
  drawn there, then draw it in the skill's own style. Never copy a drawing or a script.
- **New videos are made in the «اسكتش» style unless the user names another:** `.claude/skills/sketch/SKILL.md`.
  **Locked for every sketch episode:** the drawing style of «لو حد شرق قدامك» (`videos/choking/`) with people from the
  shared person kit; **no background music** (narrator plus sound effects only, unless the user asks for music in that video); Claude makes the effects and asks the user
  for any real recording it needs; and every video ends with the reel cover and the TikTok, Instagram (shared to Facebook)
  and YouTube Shorts titles, without being asked.
  The reference episode is «المد والجزر» (`videos/tides/`), the shared template `videos/_templates/sketch/`
  (its README lists the drawing helpers), the sound kit `videos/_templates/sketch/sfx/`.
- **Sound without asking: sound effects only, in every video and every skill.** No background music of any kind
  unless the user asks for it for that video.
  `videos/audio/sfx.py` leaves music out unless run with `--music`; never pass it on your own.
- **The 20 reference videos the style comes from are in the repo**, so never ask the user to upload them again:
  `videos/_reference/tabizzay/`. Start with its `README.md` (an index of what each video draws), then open the
  matching `sheets/vNN.jpg`, or pull frames and motion strips from `videos/vNN.mp4` with ffmpeg. `STYLE.md` has the
  measured rules (narration, layout, colours, fonts, motion, sound). They are references to look at: draw in the
  same hand, with real shapes from reference photos, and never copy a drawing or a script.
- **Stories («اعملي قصة», «حكاية…») use `.claude/skills/story-2d/SKILL.md`, and every story opens on a real recording or
  real footage of the event, with more real clips inside it** (the user's rule after «عبّارة السلام 98», `videos/salam98/`):
  see its section 0a. Propose story topics only where such real material exists, and say what it is.
- Other styles only when named: `animation` (cartoon panel), `law` («لو»), the old `diagram-v1` build for the X-ray video.
- **Every «لو» video looks like the 14 reference videos the user sent (`videos/_reference/law/`, read its README; never ask
  for them again):** full-screen 9:16 "2.5D" vector drawings (gradients, shading, soft shadows, a cut-open scene that
  grows), one big word of caption at a time, and their script shape («لو… بس المشكلة… عشان كده… وده اسمه… ومبروك عليك»)
  in casual Egyptian Arabic. A man drawn with the shared person kit acts out and reacts to every step: shocked on each «بس…»
  failure, relieved on each «عشان كده…» fix, going down into the build and back up. The whole method is the `law` skill (`.claude/skills/law/SKILL.md`, run it with `/law`); copy `videos/solar-building/` and build on
  the shared kit `videos/_templates/law/kit.js`.
- **All the account's own skills live in `.claude/skills/` too** (graphify, hyperframes, hyperframes-cli,
  hyperframes-registry, media-use, reverse-any-video, style-sampling, agent-reach, grill-me), so any
  Claude account that opens this repo gets them. When the user types `/graphify`, use `.claude/skills/graphify/SKILL.md`
  before doing anything else. The LinkedIn skills were taken out of the repo on purpose (they cost tokens in every
  video session); they stay on the account itself (`anthropic-skills:linkedin-*`).
