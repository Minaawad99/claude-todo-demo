# Opening clips for the «الصور» style

The user's own clips (720×1280, ~30 fps, no speech: the music plays over them). `make.py` takes any of them:
`python3 videos/_templates/photo-list/make.py videos/<slug>/list videos/_intros/<file> --intro-dur <s>`.

| file | length | place | what happens | use |
|---|---|---|---|---|
| `1-room-black-point-up-down.mp4` | 10.0 s | indoors, black T-shirt, framed picture behind | points up, then down at the screen (from ~5.5 s) | cut 0–5.5 s for "listen up"; or 5.5–10 s for "look at this ↓" (`--intro-start 5.5`) |
| `2-room-maroon-point-down-up.mp4` | 6.8 s | indoors, maroon T-shirt, teal wall | points down, then up | serious topics (history, science) |
| `3-hut-jersey-gesture-hand-cover.mp4` | 5.2 s | beach hut, «08» jersey, palms | gestures "come here", then covers the lens with his hand | light topics (food, inventions); the hand cover runs into the first photo |
| `4-bench-night-point-hand-cover.mp4` | 5.5 s | bench at night, scarf (same look as the «أخطاء صغيرة غيّرت العالم» reference) | finger up, "wait", then hand to the lens | the default: surprising facts, mistakes; cut at 5.1 s before the pink flash |
| `5-bench-night-smile-hand-cover.mp4` | 5.7 s | same bench, smiling | finger up, smile, hand to the lens | funny or "you won't believe it" lists; cut at 5.0 s before it goes dark |
| `6-pool-jersey-point-hand-cover.mp4` | 6.8 s | by the pool, «08» jersey | points up, waves, hand to the lens | summer, travel, sea, fun facts |

Rules:
- Don't use the same clip in two videos in a row; say which one was picked and why.
- Clips 3–6 end with the hand over the lens: cut while the hand still fills the frame, so the 0.5 s cross-fade runs from the
  hand into the first photo.
- The title card sits at the top (37 px of 640); in all six clips the face is below it.
