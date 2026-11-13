# إيه الحكاية؟ — project notes for Claude

- Talk to the user in Egyptian Arabic.
- **New videos are made in the «اسكتش» style unless the user names another:** `.claude/skills/sketch/SKILL.md`.
  The reference episode is «المد والجزر» (`videos/tides/`), the shared template `videos/_templates/sketch/`
  (its README lists the drawing helpers), the sound kit and series music `videos/_templates/sketch/sfx/`.
- **The 20 reference videos the style comes from are in the repo**, so never ask the user to upload them again:
  `videos/_reference/tabizzay/`. Start with its `README.md` (an index of what each video draws), then open the
  matching `sheets/vNN.jpg`, or pull frames and motion strips from `videos/vNN.mp4` with ffmpeg. `STYLE.md` has the
  measured rules (narration, layout, colours, fonts, motion, sound). They are references to look at: draw in the
  same hand, with real shapes from reference photos, and never copy a drawing or a script.
- Other styles only when named: `animation` (cartoon panel), `law` («لو»), `story` («القصة»: a true story hour by hour in 3D, `.claude/skills/story/SKILL.md`), the old `diagram-v1` build for the X-ray video.
