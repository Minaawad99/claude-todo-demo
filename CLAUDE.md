# CLAUDE.md

This repo makes short vertical videos (1080×1920) for the user's channel **«إيه الحكاية؟»**: script, voice, visuals, render,
cover and titles, all generated here. Read this first in every session; the details live in the skills and READMEs it points to.

## Talking to the user

- Always reply in **Egyptian Arabic** (Cairo dialect), short and clear. Code, commits and file contents stay in English
  unless they are on-screen text.
- The user picks the topic (and sometimes sends photos or clips); Claude does everything else end to end.
- Before a new topic, show the item list or script and wait for an OK before rendering.
- Check every fact, name, year and number before it goes on screen, and list sources in `videos/<slug>/refs/SOURCES.md`.
  Drop or hedge myths and tell the user which ones.
- Send finished videos and covers with SendUserFile, then commit and push.

## Video styles (each is a skill in `.claude/skills/`)

| Style | Skill | When |
|---|---|---|
| الانيميشن (cartoon panel, voice-over) | `animation` | default for a new «إيه الحكاية؟» explainer |
| الرسم الهندسي (technical diagram) | `diagram` | "بالرسم الهندسي" / "زي فيديو الأشعة" |
| «لو» (build-along) | `law` | "بأسلوب لو" / "زي فيديو الملجأ" |
| **الصور** (opening clip + facts on real photos, music only) | `photos` | "بالصور" / "زي فيديو الأخطاء" / list topics like «حاجات لقوها في تيتانيك» |

For the animation style, ask once per topic: quick mode (default) or full checks.

## «الصور» rules the user set

- Opening: one of the user's own clips in `videos/_intros/` (see its README: 6 clips, where to cut each, which topics fit).
  Pick one that suits the topic, don't repeat the last video's clip, and say which one. Clips 3–6 end with a hand over the
  lens: cut there so it dissolves into the first photo.
- **Two photos per item, 4 seconds each, same card on both.** The user sends the photos, in pairs, in list order.
  **Never search for photos or for extra items yourself** (the user's rule): use only what the user sent, and drop any
  item the user sent no photo for (say which). If an item has one photo, split or crop it into two views.
- **No sound** in the video: `make.py` writes a silent track by default (the user adds a sound in the app; `--bed` or
  `--music` only if asked).
- The opening title card sits **just above the head** (`intro.top`/`intro.shift`, values per clip in `videos/_intros/README.md`);
  break a long title by hand with `\n`.
- Card: emoji + short title + **exactly two lines** of body (check with `videos/_templates/photo-list/lines.js`).
- Build: `videos/_templates/photo-list/` (`make.py`, `template.html`), render with `videos/render.js`.
- Reference build: `videos/titanic-finds/`.

## Covers

- 1080×1920, full bleed, title in **Noto Sans Arabic** (never Aref Ruqaa), dark top and bottom, warm yellow accent (#f2c230).
- **The cover must have suspense and show the subject itself** (e.g. the Titanic ship fading down to the wreck, with the
  most expensive find in the middle and its price on a tag). A close-up of one object alone was not enough.
- Keep text inside the 3:4 crop (y 120–840 of 960) and away from TikTok's right-hand buttons.
- Files: `brand/eh-elhekaya/cover-<slug>-tiktok.html` → `tiktok-cover-<slug>-1080x1920.png` via `videos/tools/cover.js`.

## Environment notes

- Cloud container, reset between sessions: anything worth keeping must be committed and pushed. Nothing outside the repo
  survives (this file is the memory).
- Work on the branch the session names; push with `git push -u origin <branch>`.
- Network is limited. Wikimedia Commons and upload.wikimedia.org have worked (for covers; not for «الصور» item photos); if a host is blocked, tell the user which
  host to add under Allowed domains in the environment settings.
- Whisper ASR (sherpa-onnx, `small` model) is installed per session into the scratchpad when needed (see `videos/PLAYBOOK.md`).
