# دليل كل المشاريع والطرق

الملف ده بيجمع كل اللي اتعمل في جلساتك القديمة والجلسة دي، وكله بقى في فرع واحد. أي جلسة جديدة تقرا الملف ده الأول، وبعدين تكمّل بنفس الطرق.

## 1. اتجمع منين

| الفرع القديم | كان فيه إيه |
| --- | --- |
| `claude/content-page-design-system-gzz6oo` | الأساس: السيستم ديزاين «طب إزاي؟»، وبراند «إيه الحكاية؟»، وحوالي 28 حلقة، وأدوات الصوت والريندر والجودة، والـ PLAYBOOK، ومهارات animation وhumanizer وproduct-launch-motion، وRemotion |
| `ccr-dd959b0d-atqwwr` | ستايل «الواقعي» (3D بـ Three.js)، وحلقة الأسانسير بيه. الحلقة دي بقت في `videos/elevator-waqei/`، عشان `videos/elevator/` فيها نسخة الكارتون والإيزو |
| `ccr-7dfafa73-ad6ac9` | مهارات في `.agents/skills/`: canvas-design وdocx وxlsx وponytail و46 مهارة OmniRoute |
| `ccr-e6d09ea5-4kqs75` | إضافات Claude Code في `.claude/settings.json`: watch وsuperpowers وhumanizer وkarpathy-skills وimpeccable |
| `ccr-05ec744f-qzv4bp` | مسودة حلقة حفارة الأنفاق: `episodes/tunnel-boring-machine.html` |
| الجلسة دي | 4 حلقات جديدة: `videos/high-dam-page/` و`videos/high-dam-photo/` و`videos/high-dam-iso/` و`videos/water-pump/` (تفاصيلها في القسم 7) |

## 2. البراندات

- **«إيه الحكاية؟»:** الصفحة الأساسية. ملفاتها في `brand/eh-elhekaya/`: الشعار (بالونة كلام جواها «؟» حمرا وفوقها زرار ساعة)، وصور البروفايل، وأغلفة الريلز وتيك توك لكل حلقة. الغلاف بيتعمل من ملف `cover-<الحلقة>.html`.
- **«طب إزاي؟»:** السيستم ديزاين في `design-system/`، وصفحة المحتوى `index.html`. ورق مربعات، ورسم إيزومتري مقطوع، وألوان ليها معنى. نفس السيستم منشور كـ artifact اسمه «طب إزاي؟» في حسابك.
- **«Here's the Deal»:** الصفحة الإنجليزية، في `brand/heres-the-deal/`. حلقاتها `videos/airplane-us/` و`videos/car-us/`.

## 3. الأساليب، وإمتى تستخدم كل واحد

| الأسلوب | تستخدمه إمتى | الدليل | حلقة تبدأ منها |
| --- | --- | --- | --- |
| **الانيميشن (كارتون)** | الافتراضي لأي حلقة «إيه الحكاية؟» جديدة، أو لما تقول «بطريقة الانيميشن» | `.claude/skills/animation/SKILL.md` | `videos/gps-traffic/cartoon/` |
| **الإيزو المقطوع («طب إزاي؟»)** | لما الجهاز محتاج يتفتح من جوه | `design-system/README.md` و`design-system/components/Iso3D/` | `videos/dishwasher/` و`videos/*/iso/` و`videos/high-dam-iso/` |
| **محرك engine.js (أول حلقات)** | الحلقات الأولى قبل الإيزو والكارتون | `videos/README.md` و`videos/PLAYBOOK.md` | `videos/printer/` و`videos/washer/` و`videos/inverter-ac/` |
| **الواقعي (3D)** | لما المرجع فيديو 3D واقعي زي الهليكوبتر | `video-styles/al-waqei/STYLE.md` | `videos/elevator-waqei/` و`videos/water-pump/` |
| **صور حقيقية متحركة** | لما تحب تشوف المكان الحقيقي | قسم 7 تحت | `videos/high-dam-photo/` |
| **صفحة تفاعلية** | شرح يتفتح في المتصفح بدل الفيديو | قسم 7 تحت | `videos/high-dam-page/` |
| **إطلاق منتج** | فيديو دعاية لمنتج أو ميزة جديدة | `.claude/skills/product-launch-motion/SKILL.md` | أمثلة جوه المهارة |
| **Remotion** | نفس حلقة الكارتون بس بتترندر بـ Remotion (React)، والكابشن بيدخل بحركة spring | `remotion/` (الخطوات تحت) | `SpeedRadar` في `remotion/src/Root.tsx` |

### حلقة كارتون بـ Remotion

الرسومات واللقطات هي هي (`videos/<الحلقة>/cartoon/shots.js`)، وRemotion هو اللي بيرندر الفيديو بدل `render.js`:

1. ابني الحلقة عادي: `python3 videos/<الحلقة>/cartoon/build.py`.
2. من جوه `remotion/`، انسخها لـ Remotion: `npm run sync -- <الحلقة> <mix.wav>`. ده بيحط ملفاتها في `public/<الحلقة>/`، والفولدر ده مش في git.
3. ضيف `<Composition>` للحلقة في `src/Root.tsx`، زي `SpeedRadar` بالظبط.
4. رندر: `npx remotion render src/index.ts <Id> out.mp4 --concurrency=4 --crf=15 --x264-preset=slow`.
5. ظبط الصوت بنفس سلسلة `render.js` (loudnorm لحد −14، وlimiter 0.6) من الـ mix، وبعدها `qa.py` لازم يقول PASS.

الخطوط محفوظة في `remotion/public/fonts/`، عشان متصفح الرندر مش بيوصل لـ fonts.gstatic.com.

### مكتبة الأصوات

كل أصوات Pixabay اللي القناة نزّلتها موجودة في فولدر على Google Drive:
https://drive.google.com/drive/folders/1GttvrISb-SiRxQG32t14gY2Y4G0I43G4

أي جلسة تقدر تنزّل منه بموصّل Google Drive، وتحفظ الملف في `videos/<الحلقة>/sfx/px-*.mp3`. الملفات دي مش بتترفع على git، فاسم الملف الأصلي بيتكتب في `refs/SOURCES.md`.

## 4. خط الإنتاج (نفس الخطوات لكل أسلوب)

التفاصيل الكاملة في `videos/PLAYBOOK.md` وفي مهارة animation. دي الخطوات باختصار:

1. **السكريبت** في `videos/<الحلقة>/script.txt`، كل جملة في سطر:
   - أول سطر حاجة الناس شايفاها كل يوم، وبعده سؤالين.
   - السطر الرابع بالظبط: «إيه الحكاية؟ هشرحهالك في دقيقة.» (أو «طب إزاي؟ هشرحهالك في دقيقة.» لصفحة «طب إزاي؟»).
   - الأرقام بالحروف عشان تتنطق صح، وكل رقم يتراجع قبل التسجيل.
   - تشبيه أو اتنين من البيت.
   - آخر سطر بالظبط: «قولولنا، عايزين تعرفوا حكاية إيه المرة الجاية؟».
   - الكارتون 25 سطر (دقيقة ونص لدقيقة و45). الـ PLAYBOOK القديم كان 40 سطر.
2. **الصوت** بيتسجّل في Google AI Studio من Generate speech: Single-speaker، وTemperature 1، والتحميل WAV. نص الستايل في مهارة animation، القسم 2. السرعة طبيعية، ومن غير تسريع بـ atempo، لأنك رفضت الصوت السريع قبل كده.
3. **التوقيت:**

   ```
   cp <الملف>.wav voice-raw.wav
   python3 ../audio/tighten.py voice-raw.wav voice.wav --max 0.3
   python3 ../align_asr.py voice-raw.wav script.txt raw-timing.json --model <sherpa-onnx-whisper-small> --gap 0.08 --db -34
   python3 ../map_timing.py voice-raw.wav raw-timing.json voice.wav timing.js --max 0.3 --tempo 1.0
   ```

   موديل Whisper بيتنزّل من GitHub releases بتاعة k2-fsa/sherpa-onnx (`sherpa-onnx-whisper-small.tar.bz2`). بعدها راجع عمود الكلام المسموع سطر سطر.
4. **المشاهد:** انسخ أقرب حلقة في نفس الأسلوب (الجدول في القسم 3)، وغيّر الموديل واللقطات. الحركة لازم متقفش أبدًا. اعمل `node videos/tools/sheet.js` لصورة مجمعة، و`node videos/tools/motion.js` للوقفات.
5. **المؤثرات:** حطها في `cues.js`، وبعدين:

   ```
   node cues.js && python3 ../audio/sfx.py voice.wav cues.json <mix.wav>
   ```

   الراوي يفضل أعلى من أي حاجة بـ 15 ديسيبل. الأصوات الحقيقية من Pixabay بتنزّلها انت وتبعتها، لأن الموقع بيمنع التحميل الآلي.
6. **الريندر والجودة:**

   ```
   TAIL=1.5 node videos/render.js $PWD/videos/<الحلقة>/cartoon/index.html <mix.wav> out.mp4
   python3 videos/qa.py out.mp4
   ```

   الفيديو مايتبعتش غير لما qa.py يقول PASS: مفيش وقفة أطول من 0.75 ثانية، والصوت حوالي -14 LUFS.
7. **الغلاف والعناوين:** `brand/eh-elhekaya/cover-<الحلقة>.html`، وبيتصوّر بـ `node videos/tools/cover.js`. تيك توك ليه 3 عناوين يختار منهم، وفيسبوك عنوان واحد ووصف أطول.

## 5. المهارات والإضافات

- **`.claude/skills/`** (Claude Code بيقراها لوحده لما الجلسة تبدأ والمستودع ده مفتوح):
  - `animation`: الحلقة كلها بأسلوب الكارتون، من السكريبت للغلاف.
  - `humanizer`: بيشيل من الكلام الحاجات اللي بتبيّن إنه مكتوب بالذكاء الاصطناعي.
  - `product-launch-motion`: فيديوهات إطلاق المنتجات.
- **`.agents/skills/`:** canvas-design للبوسترات والتصميمات الثابتة، وdocx وxlsx لملفات Word وExcel، وponytail لأبسط حل في الكود، و46 مهارة OmniRoute.
- **`.claude/settings.json`:**
  - watch: Claude يتفرج على فيديو ويحلله.
  - superpowers وkarpathy-skills: طرق شغل في الكود.
  - impeccable: جودة التصميم.
  - humanizer: نفس المهارة اللي فوق، بس كإضافة.

  الإضافات دي بتتسطب أول ما الجلسة تبدأ، لو الإنترنت مسموح لـ GitHub.

## 6. الحلقات الموجودة

| الفولدر | الموضوع | الأسلوب |
| --- | --- | --- |
| `printer` | طابعة الليزر | رسم بمحرك `videos/engine.js` (الحلقة اللي اتظبط عليها الـ PLAYBOOK) |
| `ship` | المركب بتعوم إزاي | محرك `engine.js` |
| `airplane`، `airplane-v2` | الطيارة بتطير إزاي | أول نسخة رسم بسيط، والتانية محرك `engine.js` |
| `airplane-us` | الطيارة بالإنجليزي (Here's the Deal) | محرك `engine.js` |
| `car-us` | موتور العربية بالإنجليزي (Here's the Deal) | إيزو |
| `dishwasher` | غسالة الأطباق | إيزو (مرجع Iso3D) |
| `fridge` | التلاجة | إيزو |
| `fridge-3d` | التلاجة | محرك `engine.js` مع `world.js` |
| `washer` | الغسالة | محرك `engine.js` (مرجع أسلوب الغسالة في الـ PLAYBOOK) |
| `inverter-ac`، `robot-vacuum` | التكييف الإنفرتر، والمكنسة الروبوت | محرك `engine.js` مع `panels.js` (مرجع «الجهاز في مكانه») |
| `helicopter` | الهليكوبتر | كارتون |
| `gps-traffic` | خط الزحمة الأحمر على الخريطة | كارتون (المرجع الأساسي) + إيزو |
| `lcd-tv`، `offshore-oil`، `phone-call`، `submarine`، `atm`، `microwave`، `elevator` | الشاشة، والبترول من البحر، والمكالمة، والغواصة، والـ ATM، والمايكروويف، والأسانسير | كارتون + إيزو |
| `bridge-water`، `car-egypt`، `qolla`، `sonic-boom`، `touchscreen`، `tbm-tunnel`، `sea-cables`، `high-dam` | الكوبري والمية، والعربية، والقلة، والانفجار الصوتي، والتاتش، وحفارة الأنفاق، والكابلات البحرية، والسد العالي | كارتون |
| `elevator-waqei` | الأسانسير | الواقعي 3D |
| `speed-radar` | الرادار بيلقطك إزاي (دوبلر) | كارتون، ونسخة Remotion |

كل فولدر فيه `script.txt` و`voice.wav` و`timing.js`، وأغلبهم فيه `cues.json` و`refs/SOURCES.md`.

## 7. حلقات الجلسة دي

كل واحدة فيها `render.js` بيطلّع الفريمات، وبعدها ffmpeg بيعمل منهم MP4:

```
node videos/<الحلقة>/render.js            # كل الفريمات في frames/
node videos/<الحلقة>/render.js 12,30      # فريمات معاينة بس في preview/
ffmpeg -framerate 30 -i frames/%05d.jpg -c:v libx264 -pix_fmt yuv420p -crf 20 out.mp4
```

- **`high-dam-page/`:** صفحتين تفاعليتين، «رحلة الكهربا من السد العالي» و«من السويس». الصفحة فيها مقطع متحرك وأزرار للمراحل. ومعاها `video-render.js`، اللي بيحوّل الصفحة لفيديو أفقي فيه حركة كاميرا وترجمة.
- **`high-dam-photo/`:** 6 صور حقيقية من ويكيميديا، بحركة كاميرا وزاوية ميل بتخليها تبان مجسمة، وفوقها خطوط منوّرة وبطاقات شرح. أسماء أصحاب الصور في `meta.json`، وبتظهر في آخر الفيديو. `search.py` و`fetch.py` بيدوروا على الصور وينزّلوها.
- **`high-dam-iso/`:** حلقة «طب إزاي؟» طولية: «إزاي مية النيل بتنوّر بيتك من على بُعد 800 كيلو؟». فيها موديل إيزو واحد (البحيرة والسد والتوربينات والمحوّل والأبراج والبيت)، والكاميرا بتنتقل بين الأجزاء. التوقيت ثابت لأن مفيش صوت.
- **`water-pump/`:** موتور المية بالـ 3D بتاع Three.js (r128)، بأسلوب الفيديو المرجعي: الكابشن كلمة كلمة، والأرقام ملوّنة، والأرض بتتقطع، وجسم الموتور بيتقص من جوه. السكريبت الأخير في `script.txt`، مستني صوت AI Studio.

حاجتين اتعلمناهم في الجلسة دي:
- **الـ 3D:** Chromium من غير أي فلاج GL أسرع بكتير (حوالي 0.8 ثانية للفريم). تقدر تشغّل 3 نسخ مع بعض بـ `WORKER=0/3` و`WORKER=1/3` و`WORKER=2/3`، و`RANGE=200-460` بيعيد رندر حتة بس.
- **ويكيميديا:** بتقفل بعد كام صورة. نزّل صورة صورة، وسيب وقت طويل بين كل واحدة، واستخدم صور بعرض 960 أو 1280.

## 8. حاجات مش في git

- **ملفات الفيديو النهائية (MP4)** و`mix.wav` والفريمات: كبيرة، فبتتحفظ في الـ scratchpad وتتبعت في الشات بس.
- **أصوات Pixabay** (`videos/*/sfx/px-*.mp3`): مستبعدة من git، فكانت موجودة بس في الجلسة اللي اتبعتت فيها. ابعتها تاني لو حلقة جديدة محتاجاها.
- **موديل Whisper:** بيتنزّل من جديد في كل جلسة.

## 9. قبل ما تكمّل في جلسة جديدة

1. افتح المستودع على الفرع ده، أو على main بعد ما الفرع يندمج فيه.
2. اقرا الملف ده، وبعده دليل الأسلوب اللي هتشتغل بيه (الجدول في القسم 3).
3. لو هتحتاج صور أو أصوات من برّه، ضيف المواقع في إعدادات البيئة تحت Network access ثم Allowed domains. أمثلة: `upload.wikimedia.org` و`commons.wikimedia.org` و`images-api.nasa.gov` و`cdn.pixabay.com`.

## 10. خريطة المعرفة (Graphify)

فولدر `videos/` كله ليه خريطة معرفة في `graphify-out/`، معمولة بأداة [Graphify](https://github.com/Graphify-Labs/graphify):

- `graph.html`: الخريطة التفاعلية. افتحها في أي متصفح، ودوس على أي عنصر أو دوّر عليه.
- `GRAPH_REPORT.md`: ملخص المجموعات وأهم الروابط والأسئلة اللي الخريطة تقدر تجاوبها.
- `graph.json`: الخريطة كاملة، وأي جلسة تقدر تسألها.

الخريطة فيها الكود كله (حوالي 230 ملف) والسكريبتات والأدلة وصفحات الحلقات (128 ملف). الصور والأصوات ومكتبة Three.js المضغوطة متشالين منها.

**الاستخدام في أي جلسة فيها Graphify متسطب:**

```
graphify query "أنهي حلقة فيها قطع للأرض؟"
graphify explain "renderAt"
graphify path "tighten.py" "qa.py"
graphify update videos            # بعد أي حلقة جديدة: بيحدّث الكود من غير تكلفة
```

**التسطيب الدايم:** ضيف `pip install graphifyy` و`graphify install` في Setup script بتاع البيئة.
