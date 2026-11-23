// ── American English version: the same shots as videos/dog-vision (dog.js + shots.js), with every drawn word swapped
// here. The page is LTR, so text anchors "start" / "end" (written for the RTL page) are swapped to keep the layout.
var EN_DICT = {
  "20 متر": "60 ft", "5 متر": "15 ft", "50 متر": "50 m", "؟": "?", "أبيض وإسود": "Black & white", "أحمر": "Red", "أخضر": "Green",
  "أزرق": "Blue", "أصفر": "Yellow", "ألوان قليلة": "Fewer colors", "أوضة الريحة": "Smell room", "إزاز مشجّر": "Frosted glass",
  "إنت": "You", "إنت: 3 أنواع": "You: 3 kinds", "الحركة": "Motion", "الضلمة": "The dark", "المجر 2020": "Hungary, 2020",
  "المخ": "Brain", "النقطة دي": "This spot", "توأم متطابق": "Identical twins", "حاسس!": "Got it!", "ريحة صاحبه": "Owner",
  "ريحتك = بصمة": "Your smell = fingerprint", "ريحتك": "Your smell", "زفير": "Breathe out", "زيك بالظبط": "Same as you",
  "شهيق": "Breathe in", "عينك": "Your eye", "عينه": "Its eye", "فتحة على الجنب": "Side slit", "قفا": "Back", "كلبك": "Your dog",
  "للنفس": "To the lungs", "مخ الكلب": "Dog's brain", "مخك": "Your brain", "مركز الفرحة": "Reward center", "معلقة سكر": "1 tsp sugar",
  "مغبّشة": "Blurry", "مفيش": "Nope", "مليون بس": "million", "مليون خلية شم": "million scent cells", "من هنا": "From here",
  "هو": "Dog", "هو: نوعين بس": "Your dog: just 2", "وش": "Face"
};
var T_AR = T;
T = function (text, x, y, sz, col, w, anchor) {
  var a = anchor === "start" ? "end" : anchor === "end" ? "start" : anchor;
  return T_AR(EN_DICT[text] || text, x, y, sz, col, w, a).replace("Noto Sans Arabic", "Noto Sans");
};
var TAG_AR = tag;
tag = function (text, x, y, k, sz, col) { return TAG_AR(EN_DICT[text] || text, x, y, k, sz, col); };
