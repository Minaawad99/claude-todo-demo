# Style: facts-cards (كروت المعلومات)

Style #1. Cards of facts over photos: a white title card on top, one photo per 5-second frame,
two frames per item, the user's intro clip with a hook card first. Read this whole file before making a video in this style.

## Workflow

1. **Topic and list.** Propose the list of items (10–20). Verify every fact. For any list of *living*
   people, check recent news first (people die; death hoaxes are common).
2. **Ask which intro** (افتتاحية) the user wants: 1, 2 or 3 (see table below). Ask every time.
3. **Write `content.json`** (see `styles/facts-cards/examples/sayedat_content.json`).
4. **Images: two per item, 5 s each** (10 s per item). Default order: person first, then the thing.
   - Prefer the user sending images (fewer tokens, fewer wrong downloads). Ask for all images in **one message, in list order**.
   - For topics like countries/animals/history, fetch from Wikimedia Commons with `shared/tools/search.py` + `shared/tools/fetch_top.py`
     (slow because of rate limits — run it in the background). Always review a contact sheet: Commons search
     often returns wrong images.
5. **Build** (commands below), check a preview strip, then send the user: the video, the cover, and `facebook_post.txt`.

## Hard rules (the user asked for these)

- On-screen text in **Modern Standard Arabic (الفصحى)**, spell-checked, with diacritics on ambiguous words.
  Chat with the user in Egyptian Arabic.
- Writing style: **title = the thing / name**, body = **intent → shocking outcome**, ending with `…` and `!`.
  Engaging, makes the viewer *feel* it. 2 lines (3 max).
- Font: **Almarai** (in `shared/fonts/`).
- **No illustrative/stock substitute images for real people.** If there is no real photo of a person, drop the
  person or use only the invention/object image. Do not use AI-generated images. Never label a photo with a
  name unless you're sure it's that person (several viral photos are misattributed).
- Mark legend/unverified claims with «يُروى». Don't copy facts from other pages without checking them.
- Hook card on the intro must sit **close to the head** (not far above it). For intro 3, the title goes
  **under the pointing finger**.
- Keep token usage low: don't over-verify, batch work, avoid repeated image reviews.

## Intros

| # | File | Description | Trim | `HOOKTOP` | Cover `cardTop` | Extra |
|---|---|---|---|---|---|---|
| 1 | `shared/intros/intro1.mp4` | garden at night, shawl | 5.2 s | 170 | 230 | — |
| 2 | `shared/intros/intro2.mp4` | by the pool, "08" t-shirt | 5.15 s | 235 | 90 | — |
| 3 | `shared/intros/intro3.mp4` | pointing down | 4.55 s | 990 | 960 | `CROP=720:1104:0:170` (black bar) |

Cover backgrounds: `shared/intros/introN_cover_bg.jpg`.

## Slides JSON

```json
[
 {"id":"00_hook","hook":true,"title":"عنوان<br>الفيديو 😱","body":""},
 {"id":"01_xa","imgs":[["x_a","وسم أصفر"]],"title":"💡 العنوان","body":"السطر…!"},
 {"id":"01_xb","imgs":[["x_b","وسم أصفر"]],"title":"💡 العنوان","body":"السطر…!"},
 {"id":"99_cta","cta":true,"imgs":[["x_a",""]],"title":"🤔 سؤال للتعليقات؟","body":"اكتبه في التعليقات 👇 وتابعنا ليصلك المزيد!"}
]
```

Images live in `<project>/img/<key>.jpg` (convert user uploads with `ffmpeg -i in -vf format=rgb24 -q:v 2 img/key.jpg`).
`render.js` prints the line count per card — shorten any body that isn't 2–3 lines.

## Build commands

```bash
VF=/path/to/video-factory; P=/path/to/project   # P contains img/ and slides.json
node $VF/shared/tools/render.js $P                     # all slides
HOOKTOP=170 node $VF/shared/tools/render.js $P 00      # hook overlay for the chosen intro
SEC10=54 $VF/shared/tools/build.sh $P/out/slides $P/out/body.mp4      # 5.4 s per slide (≈5 s after crossfade)
$VF/shared/tools/withintro.sh $VF/shared/intros/intro1.mp4 5.2 $P/out/hook_overlay_transparent.png $P/out/body.mp4 $P/out/final.mp4
# intro 3: CROP=720:1104:0:170 $VF/shared/tools/withintro.sh $VF/shared/intros/intro3.mp4 4.55 ...
node $VF/shared/tools/cover.js $P                      # needs $P/cover.json, writes out/cover.jpg
```

Output must be H.264 **yuv420p** (already set) — yuv444p doesn't play on phones.
Videos have no music; the user adds audio in CapCut.

## Commons downloads

```bash
python3 -I $VF/shared/tools/search.py key "search query" $P/cands/key.json   # needs $P/cands/
python3 -I $VF/shared/tools/fetch_top.py $P key 2                            # -> img/key_1.jpg, img/key_2.jpg + img/credits.json
```
`upload.wikimedia.org` works; `thumb.wikimedia.org` is blocked by the proxy. Expect HTTP 429s; scripts retry.
Credit CC BY / CC BY-SA authors in the post description.

## Deliverables per video

- `final.mp4` (named after the topic, e.g. `sayedat_intro1.mp4`)
- `cover.jpg` (user's intro frame + title card + 3 tiles + red pill)
- `facebook_post.txt`: title + 2 descriptions (short Reels one; longer regular post with 3 emoji teaser
  lines, CTA question, follow line, hashtags incl. `#awadfacts`, photo credits)

## Past topics (don't repeat)

أخطاء صغيرة غيّرت العالم · أبشع طرق الإعدام · صُدفٌ لا يصدّقها عقل · استيقظوا بمهارات خارقة (غيبوبة) ·
حيوانات بقوى خارقة · أوبئة غيّرت مسار البشرية · أمهات كسرن حدود المنطق · اختراعات ندم عليها أصحابها ·
أكبر النجوم عمرًا وما زالوا أحياء · دول تعبرها مشيًا · أشياء من اختراع السيدات
