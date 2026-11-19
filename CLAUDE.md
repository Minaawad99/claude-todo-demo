# إيه الحكاية؟ — project notes for Claude

- Talk to the user in Egyptian Arabic.
- **New videos are made in the «اسكتش» style unless the user names another:** `.claude/skills/sketch/SKILL.md`.
  **Locked for every sketch episode:** the drawing style of «لو حد شرق قدامك» (`videos/choking/`) with people in real body
  proportions; **no background music** (narrator plus sound effects only, unless the user asks for music in that video); Claude makes the effects and asks the user
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
- Other styles only when named: `animation` (cartoon panel), `law` («لو»), the old `diagram-v1` build for the X-ray video.
- **Every «لو» video is 3D (three.js), never 2D,** like the 3D reference video the user sent for that style
  (`videos/_reference/law/`), and has a real rigged person (face, joints, real proportions) who acts out and reacts to every
  step: shocked on each «بس…» failure, relieved on each «عشان كده…» fix, going down into the build and back up. See
  `.claude/skills/law/SKILL.md` section 4.
