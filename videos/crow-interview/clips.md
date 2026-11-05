# الكليبات — «اعترافات برّية» حلقة الغراب

صور الماستر A وB وC وD اتوافق عليها. كل كليب هنا ليه **رقم**: سمّي الملف بيه (`H01.mp4` و`C01.mp4` و`R04.mp4`…) وارفعهولي.

## الأدوات

| النوع | الأداة | ليه |
|---|---|---|
| **H**: لقطات المذيع وهو بيتكلم | **Hedra** (hedra.com، Character-3) أو **Kling → Avatar / Lip Sync** | ترفع الصورة وملف الصوت، فتطلع شفايفك متزامنة مع الكلام بالظبط |
| **C**: لقطات الغراب في الاستوديو | **Veo** (من Gemini) أو **Kling** (Image to Video) | ترفع صورة الماستر وتكتب برومبت الحركة |
| **R**: لقطات الشرح (B-roll) | **Veo** أو **Kling** (Text to Video) | برومبت بس، من غير صورة |

**ملاحظات عامة:**
- كل الكليبات طولية **9:16**.
- لو Veo طلّع صوت أو كلام في الكليب، مش مهم، أنا هشيله في المونتاج.
- **ماتطلبش إن الغراب يتكلم بكلام معين في Veo.** إنت محتاج حركة منقار بس، والصوت عندي.
- لو لقطة طلعت فيها حاجة غريبة (صوابع زيادة، أو غراب بمنقارين)، أعدها، أو ابعتها وأنا أقصّ الجزء السليم.

---

## 1. لقطات المذيع H (Hedra)

ملفات الصوت في `final/` (اتبعتتلك). ارفع **الصورة + ملف الصوت**، وفي خانة الـ prompt اكتب:
`Natural talk-show host, subtle head movement, natural blinking, calm hand gestures, warm studio light.`

| الكليب | الصورة | ملف الصوت | المدة |
|---|---|---|---|
| H01 | A | `01-host.wav` | 4.5 ث |
| H03 | D | `03-host.wav` (لسه ناقص، اعمله من AI Studio أو استنى لما أعمله) | ~2 ث |
| H06 | D | `06-host.wav` | 4.1 ث |
| H09 | D | `09-host.wav` | 2.1 ث |
| H12 | A | `12-host.wav` | 4.0 ث |
| H16 | D | `16-host.wav` | 4.5 ث |
| H22 | A | `22-host.wav` | 6.4 ث |
| H23 | D | `23-host.wav` | 3.1 ث |

> **لقطة 16 (الجوزة):** لو الأداة بتسمح، أضف للبرومبت `holding up a walnut between two fingers`. ولو ماطلعتش، مش مشكلة.

---

## 2. لقطات الغراب في الاستوديو C (Veo / Kling، صورة ← فيديو، 8 ثواني)

هستخدمهم تحت كلام الغراب، وكمان بين لقطات الشرح.

**C01 (من صورة B):**
```
The crow on the armchair backrest turns its head toward the camera and talks: its beak opens and closes naturally in short bursts as if speaking, small head tilts, feathers ruffle slightly. The man in the foreground stays still, listening. Static camera, warm amber light, no zoom.
```

**C02 (من صورة C):**
```
The crow speaks into the brass microphone: its beak opens and closes naturally in short bursts as if talking, slow head tilt, eye blinks once. Very slow push-in. Warm amber lamp light, cinematic.
```

**C03 (من صورة C):**
```
The lamp light dims slightly, the crow leans closer to the brass microphone and speaks in short beak movements, as if telling a secret. Very slow push-in.
```

**C04 (من صورة C، اللقطة الأخيرة):**
```
The crow slowly tilts its head to one side, stares into the lens, a small glint flashes in its eye, it opens its beak briefly as if saying a short sentence, then blinks once. Static camera.
```

**C05 (من صورة A، المذيع بيسمع):**
```
The host listens to his guest, nods slowly, slight smile, then raises one eyebrow in surprise. The crow in the foreground moves its head slightly. Static camera, no speech.
```

**C06 (من صورة D، رد فعل):**
```
The man listens with growing amazement, eyes widen slightly, he leans back in the armchair and exhales a short laugh. No speech. Static camera.
```

---

## 3. لقطات الشرح R (Veo / Kling، نص ← فيديو، 8 ثواني)

انسخ البرومبت كله زي ما هو.

> **اتغير:** معظم لقطات الشرح بقيت لقطات موشن جرافيك بعملها أنا (فولدر `inserts/`). فاضل عليك **4 بس** من Veo.

**R04 (قابيل: الغراب بيحفر):**
```
Vertical 9:16 cinematic shot. An ancient barren desert valley at dusk, a black crow digging in the dry soil with its beak in the foreground, far in the background the dark blurred silhouette of a kneeling man seen from behind, no face visible, amber sunset haze, dust drifting. Very slow dolly-in. Photorealistic.
```

**R05 (ماكرو، التراب بيتردم):**
```
Vertical 9:16 macro shot of a black crow's beak pushing soil to cover a small hole, grains of sand falling in slow motion, dramatic warm amber rim light, dark background, shallow depth of field. Photorealistic.
```

**R11 (اجتماع الغربان):**
```
Vertical 9:16 cinematic shot. A dead crow lying on a wet city sidewalk, a circle of crows gathered around it on the ground and on overhead wires, hopping closer, heads turning, one caws. Overcast moody light, slow orbit. Photorealistic.
```

**R21 (القمر):**
```
Vertical 9:16 cinematic silhouette of a crow on a bare branch against a huge amber full moon, mist drifting, slow push-in.
```

---

---

## 4. الترتيب في المونتاج (عليّا)

**M** = لقطات موشن جرافيك بعملها أنا. **PIN** = كرة أرضية عليها دبوس المكان (2.6 ث).

| السطر | الكليبات |
|---|---|
| 01 | H01 |
| 02 | C01 |
| 03 | H03 |
| 04 | R04 ← R05 |
| 05 | C02 |
| 06 | H06 |
| 07 | PIN_WA ← M07 |
| 08 | M07 (تكملة) ← C05 |
| 09 | H09 |
| 10 | M10 |
| 11 | R11 ← M11 |
| 12 | H12 |
| 13 | PIN_NC ← M13 |
| 14 | M14 ← C06 |
| 15 | PIN_JP ← M15 |
| 16 | H16 |
| 17 | C03 |
| 18 | M18 ← C02 |
| 19 | PIN_SE ← M19 |
| 20 | PIN_DE ← M20 |
| 21 | R21 |
| 22 | H22 |
| 23 | H23 |
| 24 | C04 ← شاشة النهاية |

**المطلوب منك: 8 H + 6 C + 4 R = 18 كليب** (بدل 29).
