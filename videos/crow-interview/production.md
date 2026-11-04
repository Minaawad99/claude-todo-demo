# «اعترافات برّية» — الحلقة 1: الغراب

## 1. اسم البرنامج

**الاسم المختار: «اعترافات برّية»**

الفكرة إن كل حيوان بيقعد على الكرسي ويعترف بالحقيقة اللي الناس فهماها غلط. أسماء بديلة لو حبيت تغيّر:

| الاسم | ليه |
|---|---|
| **اعترافات برّية** ⭐ | قصير وبيشرح الفكرة، وبيمشي مع أي حيوان |
| الضيف الغريب | بسيط وفيه فضول |
| على كرسي الضيف | بيركّز على شكل البودكاست |
| حوار مع المخلوقات | واضح، بس أقل جاذبية |
| مقابلة مستحيلة | فيه تشويق، وبيسمح بضيوف غير الحيوانات (نجوم، أعضاء جسم، جماد) |

العلامة المائية: `اعترافات برّية`، شفافة 25%، في نص الشاشة تحت. ده نفس مكانها في المرجع، بس بخط مختلف.

---

## 2. الهوية البصرية (مختلفة عن المرجع)

المرجع كان **تركواز ونيون وأسود**. إحنا هنشتغل **كهرماني دافي وخشب وجوز وبراس**، يعني إحساس «أرشيف تاريخ طبيعي قديم» بالليل.

- **اللون الأساسي:** كهرماني `#E8A33D`. الخلفية فحمي غامق `#121010`. وفيه لمسة لون تانية خفيفة أخضر زيتوني غامق `#2F3A2A`.
- **الاستوديو:** مكتبة خشب جوز غامق، ورفوف عليها برطمانات عينات وكتب جلد قديمة ولوحات تشريح مرسومة باليد لحيوانات، وريش متثبت بدبابيس في إطارات، ونَجَفات صغيرة بلمبات تنجستن. بين الكرسيين ترابيزة صغيرة عليها كرة أرضية براس قديمة.
- **الكراسي:** كرسيين جلد بني كونياك (المرجع كان أسود).
- **المايك:** مايك ريترو براس على ستاند صغير قدام الضيف.
- **لقطات الـ B-roll:** خلفية سودا، وإضاءة جانبية كهرمانية (rim light)، وغبار في الهوا بيلمع في النور.
- **النصوص على الشاشة:** خط مونو صغير أبيض مكسور، وفي الركن الشمال فوق جوه أقواس `⌜ ⌝`، زي ملصقات المتاحف.

---

## 3. المذيع (إنت)

**صور المرجع:** `front.png` (وش من قدام) و`side.png` (جنب). **ارفعهم مع كل برومبت صورة فيها وشك.** ده أهم حاجة عشان الشبه يفضل ثابت.

**وصف ثابت (انسخه زي ما هو في كل برومبت):**

```
HOST = a young Egyptian man in his mid-20s, athletic broad-shouldered build, short dark-brown thick wavy-curly hair with volume on top and short tapered sides, thick dark straight eyebrows, warm brown eyes, light olive skin, short neatly trimmed stubble beard and mustache, strong jawline, no glasses. Wearing an open dark olive-green overshirt jacket over a plain black crew-neck t-shirt, dark trousers, a simple black watch. Exactly matches the face in the reference photos.
```

**اللبس ثابت في كل الحلقات:** أوفرشيرت زيتوني على تيشيرت أسود. ده بقى جزء من البراند بتاعك.

**الأداء:** مذيع هادي وفضولي، بيرفع حاجب عند المفاجآت. ماسك فايل جلد بني فيه ورق الحلقة.

---

## 4. الضيف: الغراب

```
CROW = a large, glossy all-black crow (Corvus) with iridescent blue-purple sheen on its feathers, sharp intelligent dark eyes with a tiny amber catch-light, thick strong black beak, perched upright on the backrest of a cognac-brown leather armchair, photorealistic, highly detailed feathers.
```

- **وهو بيتكلم:** المنقار بيتفتح ويتقفل بشكل طبيعي مع الكلام، والراس بتميل يمين وشمال بحركات الغراب المعروفة.
- **الشخصية:** حكيم، واثق، ساخر شوية.

---

## 5. البرومبتات الأساسية (Master)

```
STUDIO = a dark, moody late-night podcast studio styled like an old natural-history archive: dark walnut bookshelves with leather-bound books, glass specimen jars, framed hand-drawn anatomical plates of animals, pinned black feathers in frames, small warm tungsten practical lamps, an antique brass globe on a low table between two cognac-brown leather armchairs, a vintage brass microphone on a small stand. Warm amber key light, deep shadows, light haze in the air, cinematic, shallow depth of field, shot on 35mm, vertical 9:16, photorealistic. Color palette: amber, walnut brown, charcoal black.
```

```
BROLL = isolated on a pure black background, dramatic warm amber rim light from one side, floating dust particles glowing in the light, macro cinematic, shallow depth of field, vertical 9:16, photorealistic, no text.
```

### طريقة الشغل
1. **الصور:** Gemini (Nano Banana) أو Midjourney. اكتب `HOST` و`CROW` و`STUDIO` كاملين مكان الكلمات دي، وارفع `front.png` و`side.png` في كل لقطة فيها المذيع.
2. **ابدأ بـ 4 صور ماستر:** A وB وC وD تحت. كل لقطات الاستوديو اللي بعد كده بتتعمل من الصور دي بالتحريك، فالديكور يفضل ثابت.
3. **التحريك:** Veo 3 أو Kling 2.x (Image-to-Video). كل كليب 5 أو 8 ثواني.
4. **مزامنة الشفايف:** في لقطات الكلام، استخدم Lip-sync (Kling Lip Sync أو Hedra) **بملف الصوت بتاع السطر نفسه** من فولدر `voice/`.

### صور الماستر

**A: من ورا كتف الغراب، والمذيع في الكادر**
```
{STUDIO}. Over-the-shoulder shot from behind the CROW (out of focus, dark silhouette of its head and shoulders in the right foreground) looking at the HOST sitting relaxed in a leather armchair facing camera, holding a brown leather folder on his knee, mid-gesture as if asking a question. {HOST}
```

**B: من ورا كتف المذيع، والغراب في الكادر**
```
{STUDIO}. Over-the-shoulder shot from behind the HOST (out of focus back of his curly dark hair and olive jacket in the left foreground) looking at the CROW perched on the backrest of the opposite leather armchair, facing camera, vintage brass microphone in front of its beak. {CROW}
```

**C: كلوز أب للغراب**
```
{STUDIO} softly blurred behind. Close-up portrait of the CROW, head slightly tilted, beak near the brass microphone, intense intelligent gaze into the lens, amber catch-light in its eye. {CROW}
```

**D: كلوز أب للمذيع**
```
{STUDIO} softly blurred behind. Medium close-up of the HOST in his armchair, looking slightly off-camera to the right at his guest, curious expression with one eyebrow raised. {HOST}
```

---

## 6. قايمة اللقطات (Shot list)

> **الأعمدة:** «الصوت» هو رقم السطر في `lines.tsv` واسم ملفه في `voice/`. «المصدر» يعني تحرّك أنهي صورة ماستر، أو «جديدة» لو محتاجة صورة لوحدها.
> المدد التقريبية في `timing.md`، وبتتولد أوتوماتيك من الصوت.

| # | الصوت | المصدر | الوصف | برومبت الحركة (Image→Video) |
|---|---|---|---|---|
| 1 | 01 | A | المذيع بيسأل السؤال المحرج | `The host leans forward slightly and speaks, raising one eyebrow, subtle hand gesture. Slow push-in. Lip-sync.` |
| 2 | 02 | B | الغراب بيرد بثقة | `The crow tilts its head, opens and closes its beak as it speaks, feathers ruffle slightly. Static camera.` |
| 3 | 03 | D | المذيع مستغرب | `The host frowns in surprise and asks a short question. Lip-sync.` |
| 4 | 04 (أول نص) | جديدة | أرض قاحلة قديمة وقت الغروب، وغراب بيحفر في التراب بمنقاره. في الخلفية خيال إنسان راكع من ضهره، مش واضح خالص | صورة: `An ancient barren desert valley at dusk, a black crow digging in the dry soil with its beak in the foreground, far in the background the dark blurred silhouette of a kneeling man seen from behind, no face visible, amber sunset haze, cinematic, vertical 9:16.` حركة: `The crow digs and scatters soil, dust drifts, very slow dolly-in.` |
| 5 | 04 (تاني نص) | جديدة | ماكرو: المنقار بيردم التراب | `Macro shot of a black crow's beak pushing soil to cover a small hole, grains of sand falling in slow motion, amber rim light.` |
| 6 | 05 | C | الغراب جدّي | `The crow speaks slowly and solemnly, slight head bow at the end. Slow push-in.` |
| 7 | 06 | D | المذيع بيعترض | `The host shrugs slightly and speaks, skeptical half-smile. Lip-sync.` |
| 8 | 07 (أول نص) | جديدة | باحث لابس قناع مطاطي غريب على وش «إنسان الكهف»، شايل شبكة في حرم جامعة، وغربان على النجيلة | `A researcher on a university campus lawn wearing a rubber caveman mask and holding a bird net, several crows on the grass nearby, overcast daylight, cinematic documentary style, vertical 9:16.` حركة: `The masked man slowly approaches the crows, they take off.` |
| 9 | 07 (تاني نص) | جديدة | إيدين بتطلّق غراب يطير | `Close-up of two gloved hands releasing a black crow which flies away toward the sky, slow motion.` |
| 10 | 08 | جديدة | غربان على أعمدة النور بتصرخ في شخص ماشي لابس نفس القناع | `Several crows perched on lamp posts and wires cawing aggressively and diving toward a person walking below wearing the same rubber caveman mask, campus path, overcast.` |
| 11 | 09 | D | المذيع ضحكان ومش مصدق | `The host laughs softly in disbelief and asks. Lip-sync.` |
| 12 | 10 | جديدة | غراب كبير وجنبه فرخ صغير على غصن، الاتنين بيبصوا تحت بتركيز | `An adult black crow and a fluffy juvenile crow side by side on a branch, both staring down intently, dusk amber light, telephoto.` حركة: `Both crows slowly turn their heads in sync toward camera.` |
| 13 | 11 (أول نص) | جديدة | غراب ميت على الرصيف، وحواليه دايرة غربان على الأرض والسلوك | `A dead crow lying on a wet city sidewalk, a circle of crows gathered around it on the ground and on overhead wires, cawing, overcast moody light, cinematic.` حركة: `Crows hop closer, heads turning, one caws. Slow orbit.` |
| 14 | 11 (تاني نص) | جديدة | كلوز على عين غراب بتمسح المكان | `Extreme close-up of a crow's eye scanning left and right, reflection of a street in the pupil.` |
| 15 | 12 | A | المذيع بيقلب في الفايل | `The host flips a page in his leather folder, looks up and speaks. Lip-sync.` |
| 16 | 13 | جديدة | غراب كاليدونيا الجديدة بيستخدم عود معقوف ويطلّع دودة من جذع شجرة | `{BROLL} A black crow holding a small hooked twig in its beak, probing into a hole in a mossy log and pulling out a white grub, macro.` |
| 17 | 14 | جديدة | أنبوب إزاز فيه مية وقطعة أكل عايمة، والغراب بيرمي حجارة والمية بتعلى | `{BROLL} A tall clear glass tube half filled with water with a small treat floating inside, a black crow drops a pebble into it, splash, the water level rises, slow motion.` |
| 18 | 15 | جديدة | تقاطع في اليابان بالليل، وغراب بيرمي جوزة في الشارع وعربية بتكسرها | `A Japanese city crosswalk at dusk, a crow drops a walnut on the road, a car rolls over and cracks it, the crow hops down to eat while pedestrians wait at the red light, cinematic, vertical 9:16.` |
| 19 | 16 | D | المذيع ماسك جوزة في إيده ورافعها | `The host holds up a walnut between two fingers, looks at it, then at the guest and speaks. Lip-sync.` |
| 20 | 17 | C | الإضاءة بتوطى، والغراب بيقرّب من المايك | `The lights dim slightly, the crow leans toward the microphone and speaks in a low voice. Slow push-in.` |
| 21 | 18 | جديدة | راس غراب شفافة بتنوّر، وجواها مخ بشبكة خلايا عصبية كهرمانية كثيفة | `{BROLL} A translucent glowing x-ray style crow head in profile, inside it a small brain densely packed with glowing amber neurons firing, scientific visualization.` حركة: `Slow zoom into the brain, neurons spark.` **نص على الشاشة:** `⌜ PALLIUM NEURONS ≈ PRIMATE ⌝` |
| 22 | 19 | جديدة | غراب أسود في معمل قدامه صينية عليها أدوات، بيختار أداة ويخبيها | `{BROLL} A large raven in front of a tray of small objects, it picks up a little stone tool with its beak and hides it under a cloth, a wall clock in soft focus.` **نص:** `⌜ FUTURE PLANNING ⌝` |
| 23 | 20 | جديدة | غراب قدام شاشة عليها رقم 3، وبيفتح منقاره 3 مرات | `{BROLL} A crow perched in front of a small screen showing the digit "3", it caws three times, beak opening each time.` **نص:** `⌜ COUNT: 1–4 ⌝` |
| 24 | 21 | جديدة | خيال غراب على غصن قدام قمر كهرماني كبير | `Silhouette of a crow on a bare branch against a huge amber full moon, mist, slow push-in, cinematic.` |
| 25 | 22 | A | المذيع بيقفل الفايل وهو مبتسم | `The host smiles, closes his leather folder and speaks warmly. Lip-sync.` |
| 26 | 23 | D | المذيع بيبص للغراب بنص عين | `The host gives a playful side glance and speaks. Lip-sync.` |
| 27 | 24 | C | الغراب بيميل راسه، وعينه بتلمع، وبعدين بيرمش | `The crow slowly tilts its head, a glint flashes in its eye, it speaks, then blinks. Hard cut to black.` |
| 28 | — | — | شاشة سودا عليها اسم البرنامج | (هعملها أنا في المونتاج) |

---

## 7. الصوت

- **الأصوات:** المذيع **Charon**، والغراب **Algenib**. متولدين من Google AI Speech (Gemini TTS). الأصلي في `voice/`، والمتظبط في `final/`: الوقفات اتقصّرت، والغراب اتسرّع (أسرع 35%) واتعمّق شوية، من غير صدى.
- **سطرين ناقصين (02 و03):** الحصة المجانية اليومية خلصت. إما أكمّلهم أنا بكره، أو تعملهم إنت في دقيقة من Google AI Studio → Generate speech (Single-speaker، Temperature 1) وتحمّلهم WAV:
  - **02 (Voice: Algenib)**
    - Style: `Read this line in Modern Standard Arabic as an ancient, wise and slightly mysterious talking crow. Deep, slow, deliberate and confident, with a hint of dry humor.`
    - النص: `نذيرُ شؤم؟ أنا أوّلُ معلّمٍ في تاريخِ البشر.`
  - **03 (Voice: Charon)**
    - Style: `Read this line in Modern Standard Arabic as a calm, curious, professional talk-show host. Warm, clear, slightly surprised.`
    - النص: `معلّم؟ علّمتَ مَن؟`
- **المدة:** حوالي 3:00 دقيقة (التفاصيل في `timing.md`). المرجع كان 3:11.

## 8. المطلوب منك بعد كده

1. اعمل صور الماستر الـ 4 (A وB وC وD) وابعتهالي أراجع الشبه والديكور **قبل** ما تكمل. ده بيوفّر عليك وقت كتير.
2. بعدها اعمل الكليبات بالترتيب، وسمّي كل كليب برقم اللقطة: `01.mp4` و`02.mp4` وهكذا.
3. ارفعهملي، وأنا هعمل الآتي:
   - أركّب الصوت على الكليبات.
   - أضيف الموسيقى والمؤثرات: ريح، نعيق غربان، تراب.
   - أضيف النصوص اللي على الشاشة والعلامة المائية وشاشة النهاية.
   - أطلّع فيديو 9:16 جاهز للنشر، وغلاف وعناوين وهاشتاجات.

---

## 9. مصادر المعلومات (للمراجعة)

| المعلومة | المصدر |
|---|---|
| الغراب وقابيل | سورة المائدة، آية 31 |
| تجربة الأقنعة وإن الغربان بتفتكر الوشوش وبتنقلها لغيرها | John Marzluff، جامعة واشنطن، 2006 وبعدها (Cornell et al. 2012, Proc. R. Soc. B) |
| «جنازات» الغربان | Kaeli Swift & Marzluff، 2015، Animal Behaviour |
| أدوات غراب كاليدونيا الجديدة | Hunt 1996، Nature، وأبحاث كتير بعده |
| رمي الحجارة في أنبوب المية | Jelbert et al. 2014، PLOS ONE |
| الجوز والعربيات في اليابان | Nihei 1995، مدينة سنداي (موثّق في وثائقي BBC) |
| كثافة الخلايا العصبية | Olkowicz et al. 2016، PNAS |
| التخطيط للمستقبل والمقارنة بأطفال في الرابعة | Kabadayi & Osvath 2017، Science، جامعة لوند، السويد |
| العد بالصوت من 1 لـ 4 | Liao, Brecht & Nieder 2024، Science، جامعة توبنجن، ألمانيا |
