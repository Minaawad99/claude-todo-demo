# Demo episode for the shared template (no voice; timing is synthetic). Shows every phase and the main helpers.
CFG = {
    "title": "إزاي القفل بيعرف مفتاحه؟",
    "category": "آلات",
    "watermark": "",
    "outro": '<div class="q">إزاي القفل بيعرف مفتاحه؟</div><div class="art"><svg id="outroArt" viewBox="0 0 600 280"></svg></div>'
             '<div class="leg"><span><b>1</b>الأسطوانة</span><span><b>2</b>المسامير</span><span><b>3</b>السوستة</span><span><b>4</b>المفتاح</span></div>'
             '<div class="stat"><div class="n">100,000</div><div class="t">كلمة سر مختلفة على الورق:<br>5 سنان، وكل سنة لحد 10 أعماق</div></div>'
             '<div class="pts">1. المسامير حابسة الأسطوانة.<br>2. كل سنة في المفتاح بترفع مسمار لارتفاع محسوب.<br>3. المفتاح الصح بيجيب القطع الخمسة على الحد، فتلف.'
             '<div class="more">معلومة زيادة: الفكرة دي عمرها حوالي 4000 سنة، في قفل خشب اسمه القفل المصري.</div></div>',
}
K = {0: {"جدًا…": "o"}, 1: {"مابيفتحش": "o", "بابك.": "gr"}, 3: {"أسطوانة،": "b"}, 4: {"محبوسة.": "o", "مين": "u"},
     5: {"مسامير": "g"}, 6: {"الصح": "g", "بالظبط،": "o"}, 7: {"لأ.": "o"}, 8: {"100,000": "o"}}
CAPTEXT = {8: "كل سنة ليها لحد 10 أعماق، وعندك 5 سنان، يعني 100,000 كلمة سر."}
