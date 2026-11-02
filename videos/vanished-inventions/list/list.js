// «الصور» — اختراعات عبقرية… اختفت فجأة (suspense). Opening clip: videos/_intros/4-bench-night-point-hand-cover.mp4 (cut at 5.1 s; the user's choice)
// Only the inventions the user sent photos for (the user's rule: don't search for photos or items).
window.LIST = {
  dur: 10,   // 5 s per photo (the user's choice)
  intro: { frames: 153, fps: 30, title: "اختراعات عبقرية…\nاختفت فجأة 🕵️", top: 52, shift: 0 },
  items: [
    { emoji: "🎥", title: "ركب القطر… ومنزلش", photo: ["photos/01a-le-prince.jpg", "photos/01b-roundhay-1888.jpg"], labels: ["لويس لوبرنس", "لقطة من فيلمه سنة 1888"],
      body: "لويس لوبرنس صوّر أول فيلم متحرك سنة 1888، وبعدها بسنتين ركب قطر لباريس… والقطر وصل من غيره!" },
    { emoji: "🥂", title: "إزاز مبيتكسرش", photo: ["photos/03a-roman-head.jpg", "photos/03b-roman-glass.jpg"], labels: ["تمثال روماني قديم", "كاس إزاز روماني قديم"],
      body: "الحكاية بتقول إن صانع ورّا الإمبراطور طبريوس كاس بيتني ومبيتكسرش… فأمر بقطع راسه عشان السر يموت معاه!" },
    { emoji: "🛡️", title: "مادة مبتتحرقش", photo: ["photos/05a-starlite.jpg", "photos/05b-starlite-egg.jpg"], labels: ["موريس وارد وستارلايت", "بيضة متغطية بستارلايت قدام اللهب"],
      body: "حلاق إنجليزي اخترع «ستارلايت» اللي بتستحمل نار رهيبة… ومات سنة 2011 والتركيبة عمرها ما اتنشرت!" },
    { emoji: "🎈", title: "فنادق بتطير", photo: ["photos/11a-hindenburg.jpg", "photos/11b-hindenburg-fire.jpg"], labels: ["هيندنبورج قبل الكارثة", "لحظة الحريق سنة 1937"],
      body: "منطاد هيندنبورج كان بيعدّي المحيط بالركاب، واتحرق في ثواني سنة 1937… ولحد النهارده الشرارة الأولى لغز!" },
    { emoji: "🔥", title: "نار بتولع فوق المية", photo: ["photos/02a-greek-fire.jpg", "photos/02b-greek-fire.jpg"], labels: ["رسمة حديثة للنار الإغريقية", "رسمة حديثة لسفينة بيزنطية"],
      body: "البيزنطيين حرقوا بيها أساطيل كاملة، والمية مكانتش بتطفيها… وسرّها كان متخبي لدرجة إنه ضاع معاهم!" },
    { emoji: "🔌", title: "العربية الكهربا اللي اتفرمت", photo: ["photos/08a-ev1.jpg", "photos/08b-ev1.jpg"], labels: ["عربية EV1", "EV1 وهي بتتشحن"],
      body: "جنرال موتورز عملت 1117 عربية كهربا، والناس حبتها… وسنة 2003 سحبتهم كلهم من الناس وفرمتهم!" },
    { emoji: "✈️", title: "عربية بموتور طيارة", photo: ["photos/07a-chrysler-turbine.jpg", "photos/07b-chrysler-turbine.jpg"], labels: ["صورة قديمة لكرايسلر التوربين", "كرايسلر التوربين بلونها البرونزي"],
      body: "كرايسلر عملت 55 عربية بموتور توربين سنة 1963 واداتها للناس تجربها… وبعدين فرمت أغلبهم، وفاضل 9 بس!" },
    { emoji: "⚔️", title: "صلب دمشق الأسطوري", photo: ["photos/04a-damascus.jpg", "photos/04b-damascus.jpg"], labels: ["نقشة الصلب الدمشقي", "سكاكين حديثة بنقشة دمشقي"],
      body: "حدادين دمشق عملوا صلب أسطوري، وفجأة في القرن الـ18 الطريقة اختفت… ولحد النهارده محدش رجّعها بالظبط!" },
    { emoji: "🎻", title: "سر ستراديفاري", photo: ["photos/09a-stradivari.jpg", "photos/09b-stradivari-workshop.jpg"], labels: ["رسمة قديمة لستراديفاري", "رسمة لستراديفاري في ورشته"],
      body: "كمانجات ستراديفاري بتتباع بملايين، وهو مات سنة 1737… والعلماء لسه مختلفين إيه اللي مخلي صوتها كده!" },
    { emoji: "🫘", title: "عربية من فول الصويا", photo: ["photos/06a-soybean-car.jpg", "photos/06b-soybean-car.jpg"], labels: ["عربية فول الصويا وهنري فورد 1941", "عربية فول الصويا سنة 1941"],
      body: "هنري فورد عرض سنة 1941 عربية جسمها بلاستيك زراعي… وبعدها العربية اتكسرت ومحدش يعرف تركيبتها بالظبط!" },
    { emoji: "🏺", title: "كاس بيغيّر لونه", photo: ["photos/10a-lycurgus-green.jpg", "photos/10b-lycurgus-red.jpg"], labels: ["الكاس والنور عليه من بره", "نفس الكاس والنور من جواه"],
      body: "كاس روماني عمره 1600 سنة أخضر، ولما النور يعدّي منه يبقى أحمر… والسر طلع ذرات دهب وفضة متناهية الصغر!" }
  ],
  outro: { title: "تفتكر اختفوا صدفة… ولا حد كان عايزهم يختفوا؟ 🤔", sub: "قولنا في الكومنتات 👇 وتابع عشان الجزء التاني!", photo: "photos/01a-le-prince.jpg", labels: ["لويس لوبرنس"] }
};
