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
- Other styles only when named: `animation` (cartoon panel), `law` («لو»), the old `diagram-v1` build for the X-ray video.
- **Sound: no recorded clips unless the user asks.** No background sounds and no recorded music (the Pixabay kit in
  `videos/_templates/sketch/sfx/`, the series music): only `audio/sfx.py`'s generated music bed and synthesized effects.
  In `cues.js` keep `RECORDED = false` (see `videos/fetus-breathing/cues.js`); ask the user before turning the kit on.
- **Narration: generate it in chunks of 5–7 lines** (`tts.py --lines`), never one long take: a long take drifts to
  another speaker partway. Measure each chunk's median pitch and regenerate any chunk that stands out.
- **Words the voice mispronounces:** prefer the Egyptian word (حيطة, not جدار) or add tashkeel (طَبَق); keep the caption
  plain with `CAPTEXT`.
