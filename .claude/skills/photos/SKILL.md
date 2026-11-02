---
name: photos
description: >
  Make a «الصور» (photo-list) video in the style of the user's reference «أخطاء صغيرة غيّرت العالم»: the user's own
  opening clip (a few seconds of them on camera) with a big white title card, then 10–14 items, each one real photo on a
  blurred copy of itself with a white card on top (emoji + short title + a two-line fact with a year), cross-fading
  every ~8 s, and a closing question card that asks for comments and teases part two. Music only, no narration. The user
  only picks the topic; Claude writes the items, finds the photos and renders. Use when the user says "بالصور",
  "بطريقة الصور", "زي فيديو الأخطاء", "افتتاحية وبعدين صور", "photo list style", or sends an opening clip for a list video.
---

# «الصور» — opening clip + facts on photos

The reference is a video the user sent: «أخطاء صغيرة غيّرت العالم 😱», 720×1280, 1:41, 12 items. Its measurements are
built into `videos/_templates/photo-list/template.html`; don't redesign the card unless the user asks.

Talk to the user in Egyptian Arabic. The user picks the topic and sends the opening clip; everything else is Claude's.

## 1. Shape of the video

| part | length | what's on screen |
|---|---|---|
| opening | ~5 s (the clip's length) | the user's clip, full frame; a white rounded card near the top with the hook in two lines and one emoji |
| items | 10–14 × 8 s: **two photos per item, 4 s each, same card** (0.4 s dissolve between them), 0.5 s cross-fade between items | the photo, full width, centred a little below the middle; the same photo blurred and darkened behind it; the card at the top |
| closing | ~4.5 s | the first item's photo again; a bigger card with a question to the viewer and «احكيلنا في الكومنتات 👇 وتابع عشان الجزء التاني!» |

Total 1:30–1:50. No narration and no captions under the picture: the card is the only text.

## 2. Topics that fit

Lists of surprising true stories: «أخطاء غيّرت العالم», «اختراعات اتعملت بالصدفة», «أكل اتخترع غلط», «حاجات
اتمنعت زمان», «أغرب أسباب حروب». Each item needs a real photo (a person, an object, a place or an old document). If the topic
is "how does X work", say the animation style fits better.

## 3. The items → `videos/<slug>/list/list.js`

- Hook (opening card): short, ends with one emoji («أخطاء صغيرة غيّرت العالم 😱»). If it's part two, add «(الجزء التاني)».
- Each item:
  - `emoji`: one emoji that matches the item (🚗 🧫 ⛵ 🩻 ❤️ 🟣 🪟 🔥 🛞 🥣 🍭);
  - `title`: 2–5 words, a hook or the thing's name («لفّة غلط بدأت حرب عالمية», «البنسلين»);
  - `body`: one sentence of 16–24 words that fits in two lines: who, the year, what went wrong, and the twist after «…»,
    ending with «!». Casual Cairo Arabic, digits for years («سنة 1928»).
- Order: open with the biggest story, keep a strong one for last, mix eras and fields.
- Closing card: a question that invites comments, linked to the topic («إنت عمرك غلطت غلطة طلعت في الآخر حلوة؟ 🤔»), and
  the sub line above.
- Check every fact (names, years, the twist) and list the sources in `videos/<slug>/refs/SOURCES.md`. Drop a story that is a
  myth, or word it as a story («بيقولوا إن…»). Tell the user which ones were myths.
- Run the bodies through the `humanizer` skill, then show the full list to the user in one copy-ready block and wait for
  an OK before looking for photos.

## 4. Photos → `videos/<slug>/list/photos/`

- **Two photos per item** (`photo: ["photos/01a-….jpg", "photos/01b-….jpg"]`), all sent by the user, in pairs, in the
  list's order. **Never search for photos or items yourself** (the user's rule, after the Titanic video); drop items with no
  photo and tell the user which. One photo for an item: crop it into two views (e.g. the Lycurgus cup green, then red).
- Drop an item with no real photo instead of showing an unrelated or replica picture; tell the user which and why.

- One real photo per item: the actual person, object or event (the 1914 car in Sarajevo, Fleming in his lab, the first X-ray
  of Bertha Röntgen's hand). No AI images, no drawings, unless no photo exists; then a period engraving or painting.
- Prefer Wikimedia Commons (public domain or CC). Download the original, keep its file page, licence and author in
  `refs/SOURCES.md`, and credit CC-BY photos in the post description.
- Landscape or square works best (shown 360 px wide). Portrait is fine: it's fitted into a 360×320 box.
- At least 1000 px on the long side; crop out watermarks, borders and old captions. Save as JPEG, `photos/<n>-<word>.jpg`.
- Look at every photo before using it (Read the file) to confirm it shows the right thing.

## 5. Opening clip and music

- **No sound by default** (the user's rule): `make.py` writes silence; use `--music track` or `--bed` only when asked.
- Place the title card just above the head with `intro.top` / `intro.shift` (table in `videos/_intros/README.md`).

- The user's opening clips are in `videos/_intros/` (six so far; `README.md` there says what each one shows, how long it
  is, where to cut it and what topics it suits). Pick the one that fits the topic, not the one used last time, and tell the
  user which one and why. If they send a new clip, add it there with a row in that README.
- Music: the user usually adds a trending sound in TikTok. Render with the user's track if they send one (`--music`),
  otherwise with the original music bed from `videos/audio/sfx.py` (no copyright problems), and tell them they can mute it
  and pick a sound in the app.

## 6. Build and render

```
D=videos/<slug>/list                       # list.js + photos/ already there; list.js has intro: {frames: 0, fps: 30, title: …}
python3 videos/_templates/photo-list/make.py $D videos/_intros/<clip>.mp4 [--music track.mp3] [--intro-start 0] [--intro-dur 5.2]
cd videos && TAIL=0 node render.js $PWD/<slug>/list/index.html <slug>/list/music.wav <scratchpad>/<slug>-photos.mp4
```

Before rendering, run `node videos/_templates/photo-list/lines.js $PWD/<dir>/index.html`: every body must be exactly 2 lines (a
lone word on a third line looks broken); shorten the sentence, don't shrink the font.

`make.py` cuts the clip into `intro/*.jpg` (Chromium can't decode H.264 here, so the page shows frames), copies the
template to `index.html` and writes `music.wav`. Render at the default 60 fps, 1080×1920 (about 5 minutes for 1:40).
Don't commit `intro/` or `music.wav` (they can be rebuilt with `make.py`); the clip itself is already in `videos/_intros/`.

## 7. Check before sending

- Contact sheet, one frame a second (`ffmpeg -i out.mp4 -vf "fps=1,scale=240:-1,tile=10x2" sheet%d.png`), and open
  every sheet: each card has a title, an emoji and two body lines (three at most), no photo is stretched or cropped
  badly, and no card covers a face.
- One full-size frame per item: the Arabic text is crisp and the numbers are in order.
- `python3 videos/qa.py out.mp4`: the frozen-screen check fails by design (the photos are still); the first-frame and
  loudness checks must pass.
- Send the mp4 with SendUserFile, then commit and push.

## 8. Cover and titles

As in the animation skill: a 1080×1920 reel cover with the strongest photo full-bleed and the hook in big type
(`brand/eh-elhekaya/cover-<slug>-tiktok.html`), and TikTok / Facebook / YouTube Shorts titles with a question or a number
(«12 غلطة غيّرت العالم… رقم 3 أنقذت ملايين 😱»).
