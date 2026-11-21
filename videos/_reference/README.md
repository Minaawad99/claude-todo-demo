# المرجع: فين اترسم أي حاجة قبل كده

**القاعدة (بتاعة المستخدم، لكل مهارة رسم: sketch وlaw وstory-2d وanimation وأي مهارة تتعمل بعد كده):** قبل ما ترسم أي
حاجة، دوّر عليها في الجدول ده. لو اترسمت في فيديو مرجع أو في حلقة عملناها، افتح فريماتها وشوف اتقطعت إزاي، وأجزاءها فين،
والكاميرا دخلت عليها منين، وبعدين ارسمها بأسلوب المهارة اللي شغال بيها. المرجع بيوريك **إيه** اللي يترسم، والمهارة بتقولك
**بأنهي إيد**. ممنوع تنسخ رسمة أو سطر سكريبت.

| المكتبة | فيها إيه | أسرع طريقة تبص |
|---|---|---|
| `tabizzay/` | 20 فيديو «طب إزاي؟» (`vNN`)، أصل أسلوب الاسكتش | `sheets/vNN.jpg`، والدليل `STYLE.md` |
| `law/` | 14 فيديو «ابنيها بنفسك!» (`rNN`)، أصل أسلوب «لو» | `sheets/rNN.jpg` |
| `videos/<الحلقة>/` | حلقاتنا اللي اتعملت (الكود والسكريبت والصوت) | افتح `index.html` بـ `tools/strip.js` |
| ريبو `Minaawad99/claude-media` (خاص) | `examples/naps-sketch.mp4` و`person-demo.mp4`، والـ zip الأربعة في Release `v1` | الـ README بتاعه بيقول تنزّل إزاي |

تطلّع فريم أو حركة من أي فيديو:

```bash
ffmpeg -ss 12.5 -i tabizzay/videos/v08.mp4 -frames:v 1 out.png                          # فريم واحد
ffmpeg -ss 40 -t 2.4 -i law/videos/r12.mp4 -vf "fps=5,tile=6x2" -frames:v 1 strip.png   # حركة: 12 لقطة
```

## الفهرس حسب الموضوع

| الموضوع | المرجع | حلقاتنا |
|---|---|---|
| **جسم الإنسان** (مخ، قلب، رئة، أعصاب، جلد، عضم، جنين) | v04 مخ ونعاس · v07 إيد وعضمها · v11 مخ مقطوع · v17 جنين وقلب ورئة · v20 أعصاب وجلد ونخاع | choking · naps · xray-diagram |
| **أشخاص** (بيتحركوا، نايمين، بيتفاعلوا) | كل فيديوهات `law/` (الراجل بيمثّل كل خطوة) · v04 · v11 | عُدّة الأشخاص `_templates/people/` · person-demo · choking · naps |
| **أجهزة البيت** (غسالة، تلاجة، تكييف، ميكروويف، إيرفراير، حلة) | v02 إيرفراير · v09 غسالة أطباق · v12 تكييف · v13 غسالة · v16 حلة ضغط · v19 طفاية | washer · dishwasher · fridge · fridge-3d · microwave · inverter-ac · gas-heater · lcd-tv · printer · robot-vacuum |
| **عربيات ومحركات** | v03 طيارة · v08 جير · v18 عربية مقطوعة وسلندر وبستم | car-egypt · car-us · car-water · airplane · helicopter · engine.js |
| **طريق ومرور ومدينة** | v05 رادار · v10 كاميرا مرور · v15 مدينة إيزومتري وزحمة | gps-traffic · monorail · sheikh-jaber-bridge · bridge-water |
| **بيت مقطوع / أوضة إيزومتري** | v06 · v11 · v12 أوضة · v19 مطبخ · r09 مخبأ تحت السرير · r14 صرف البيت | secret-basement · solar-building · nuclear-shelter · elevator |
| **كهربا وطاقة** | r02 طاقة شمسية · r08 محطة نووية · r12 عمود وشبكة | solar-building · egypt-saudi-power · high-dam · chernobyl |
| **بترول وغاز ومية** | v18 غاز · r06 بير بترول ومصفاة · r14 بيارة | offshore-oil · gas-cylinder · sea-cables |
| **بناء ومعدات** | r05 مسامير · r07 شنيور · r11 خرسانة · r13 ونش برجي · r01 كوريك | tbm-tunnel · container-ship · qolla |
| **أرض وبحر وسما** (كرة أرضية، مد، سحاب، برق) | v14 كرة أرضية بسواحل حقيقية · v03 سحاب · v15 أقمار | tides · lightning · rainbow · earthquake · sonic-boom · birds |
| **أكل ونار** | r03 شوي في حفرة · v16 · v19 سلسلة النار | — |
| **أقفال وآلات صغيرة** | v01 قفل ومفتاح · v08 تروس | atm · touchscreen · phone-call |
| **سفن وقصص حقيقية** | — | titanic · salam98 · costa-concordia · hiroshima · chernobyl · ship · submarine |
| **جرافات وأرقام** | v04 مراحل النوم · v11 موجات · v12 جرافين جنب بعض | naps (هيبنوجرام) |

لو الموضوع مش في الجدول: ابدأ بصور حقيقية للشكل، وبص على أقرب حاجة في الجدول علشان تعرف إزاي تتقطع وتتشرح.
