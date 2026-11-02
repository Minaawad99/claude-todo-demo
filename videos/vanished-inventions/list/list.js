// «الصور» — اختراعات عبقرية… اختفت فجأة (suspense). Opening clip: videos/_intros/4-bench-night-point-hand-cover.mp4 (cut at 5.1 s; the user's choice)
// Only the inventions the user sent photos for (the user's rule: don't search for photos or items).
window.LIST = {
  dur: 10,   // 5 s per photo (the user's choice)
  intro: { frames: 153, fps: 30, title: "اختراعات عبقرية…\nاختفت فجأة! 🕵️", top: 52, shift: 0 },
  items: [
    { emoji: "🎥", title: "ركب القطار… ولم ينزل منه", photo: ["photos/01a-le-prince.jpg", "photos/01b-roundhay-1888.jpg"], labels: ["لويس لوبرنس", "لقطة من فيلمه عام 1888"],
      body: "صوّر لويس لوبرنس أول فيلم متحرك عام 1888، وبعد عامين ركب قطارًا إلى باريس… فوصل القطار من دونه!" },
    { emoji: "🥂", title: "زجاج لا ينكسر", photo: ["photos/03a-roman-head.jpg", "photos/03b-roman-glass.jpg"], labels: ["تمثال روماني قديم", "كأس زجاجية رومانية قديمة"],
      body: "تروي الحكاية أن صانعًا عرض على الإمبراطور طيباريوس كأسًا تنثني ولا تنكسر… فأمر بقطع رأسه ليموت السر معه!" },
    { emoji: "🛡️", title: "مادة لا تحترق", photo: ["photos/05a-starlite.jpg", "photos/05b-starlite-egg.jpg"], labels: ["موريس وارد وستارلايت", "بيضة مغطاة بستارلايت أمام اللهب"],
      body: "اخترع حلاق إنجليزي مادة «ستارلايت» التي تتحمل لهبًا هائلًا… ومات عام 2011 دون أن ينشر تركيبتها!" },
    { emoji: "🎈", title: "فندق طائر", photo: ["photos/11a-hindenburg.jpg", "photos/11b-hindenburg-fire.jpg"], labels: ["هيندنبورج قبل الكارثة", "لحظة الحريق عام 1937"],
      body: "كان منطاد هيندنبورج يعبر المحيط بالركاب، واحترق في ثوانٍ عام 1937… وما زالت الشرارة الأولى لغزًا حتى اليوم!" },
    { emoji: "🔥", title: "نار تشتعل فوق الماء", photo: ["photos/02a-greek-fire.jpg", "photos/02b-greek-fire.jpg"], labels: ["رسم حديث للنار الإغريقية", "رسم حديث لسفينة بيزنطية"],
      body: "أحرق بها البيزنطيون أساطيل كاملة، ولم يكن الماء يطفئها… وكان سرّها مكتومًا لدرجة أنه ضاع معهم!" },
    { emoji: "🔌", title: "السيارة الكهربائية التي سُحقت", photo: ["photos/08a-ev1.jpg", "photos/08b-ev1.jpg"], labels: ["سيارة EV1", "سيارة EV1 أثناء الشحن"],
      body: "صنعت جنرال موتورز 1117 سيارة كهربائية أحبها الناس… وفي عام 2003 سحبتها كلها منهم وسحقتها!" },
    { emoji: "✈️", title: "سيارة بمحرك طائرة", photo: ["photos/07a-chrysler-turbine.jpg", "photos/07b-chrysler-turbine.jpg"], labels: ["صورة قديمة لسيارة كرايسلر التوربينية", "كرايسلر التوربينية بلونها البرونزي"],
      body: "صنعت كرايسلر 55 سيارة بمحرك توربيني عام 1963 ليجربها الناس… ثم سحقت أغلبها، ولم يبقَ إلا 9!" },
    { emoji: "⚔️", title: "فولاذ دمشق الأسطوري", photo: ["photos/04a-damascus.jpg", "photos/04b-damascus.jpg"], labels: ["نقشة الفولاذ الدمشقي", "سكاكين حديثة بنقشة دمشقية"],
      body: "صنع حدادو دمشق فولاذًا أسطوريًا، ثم اختفت طريقته في القرن الـ18… ولم يُعِدها أحد بدقة حتى اليوم!" },
    { emoji: "🎻", title: "سر ستراديفاري", photo: ["photos/09a-stradivari.jpg", "photos/09b-stradivari-workshop.jpg"], labels: ["لوحة قديمة لستراديفاري", "رسم لستراديفاري في ورشته"],
      body: "تُباع كمنجات ستراديفاري بالملايين، وقد مات عام 1737… وما زال العلماء مختلفين في سر صوتها!" },
    { emoji: "🫘", title: "سيارة من فول الصويا", photo: ["photos/06a-soybean-car.jpg", "photos/06b-soybean-car.jpg"], labels: ["سيارة فول الصويا وهنري فورد 1941", "سيارة فول الصويا عام 1941"],
      body: "عرض هنري فورد عام 1941 سيارة هيكلها من بلاستيك زراعي… ثم دُمّرت، ولا أحد يعرف تركيبتها بدقة!" },
    { emoji: "🏺", title: "كأس تغيّر لونها", photo: ["photos/10a-lycurgus-green.jpg", "photos/10b-lycurgus-red.jpg"], labels: ["الكأس والضوء عليها من الخارج", "الكأس نفسها والضوء من داخلها"],
      body: "كأس رومانية عمرها 1600 عام، خضراء… وحين يعبرها الضوء تصير حمراء، والسر ذرات ذهب وفضة دقيقة!" }
  ],
  outro: { title: "هل اختفت صدفة… أم أراد أحدٌ إخفاءها؟ 🤔", sub: "أخبرونا في التعليقات 👇 وتابعونا ليصلكم الجزء الثاني!", photo: "photos/01a-le-prince.jpg", labels: ["لويس لوبرنس"] }
};
