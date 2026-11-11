/* «ابنيها بنفسك» — المسبح: when each thing happens, derived from the voice timing.
   Shared by the page (window.EV) and by the sound script (node: require("./events.js")(TIMING)).
   W(i, "word") is when that word of line i is spoken (by character share of the line, like the captions). */
(function (root) {
  function make(TIMING) {
    var LN = TIMING.lines;
    function L(i) { return i >= LN.length ? TIMING.duration : LN[i].start; }
    function E(i) { return i >= LN.length ? TIMING.duration : LN[i].end; }
    function words(i) { return LN[i].text.split(" "); }
    function W(i, w) {
      var ws = words(i), tot = ws.join("").length, acc = 0;
      for (var k = 0; k < ws.length; k++) { if (ws[k].indexOf(w) === 0) return L(i) + (E(i) - L(i)) * acc / tot; acc += ws[k].length; }
      throw new Error("word not found: " + i + " " + w);
    }
    var ev = {
      dig: L(0) + 0.1, fill0: W(0, "وملأتها"), yay0: W(0, "مبروك"),
      soak: L(1) + 0.4, mud: W(1, "وفي"),
      shell: W(2, "بالخرسانة"),
      fill1: L(3) + 0.2, ton: W(3, "ثمانيةً"), crack: W(3, "فتتشقّق"),
      rebar: W(4, "شبكةً"), spray: W(4, "وترشّ"), sprayEnd: E(5) - 0.3,
      tagShot: W(5, "الخرسانة"),
      fill2: L(6), green: W(6, "يتحوّل"),
      pump: W(7, "مضخةً"), flow: W(7, "تدفع"), sand: W(7, "خزانٍ"), clear: L(8) + 0.3, tagSand: W(8, "فلتر"),
      leaves: L(9) + 0.1, skimmer: W(10, "فتحةً"), suckLeaves: W(10, "تسحبها"), tagSkim: W(10, "اسمها"),
      drain: W(11, "وفتحةً"), dirt: W(11, "الأوساخ"),
      dive: L(12), grab: W(12, "يُمسك"),
      twin: W(13, "فتحتين"), meter: W(13, "قرابة"), dome: W(13, "غطاءٌ"), free: W(13, "لا"),
      micro: L(14) + 0.1, microEnd: E(14) + 0.2,
      salt: W(15, "ملحًا"), cell: W(15, "وجهازٌ"), kill: W(15, "كلور"),
      tagCell: W(16, "مولّد"), salty: W(16, "وملوحة"),
      swim2: L(17), sweat: W(17, "بعرق"), haze: W(17, "كوّن"), eyes: W(17, "تحرق"),
      tagCa: W(18, "الكلورامين"), gauge: W(18, "فإذا"),
      shower: W(19, "دُشًّا"), wash: W(19, "يغتسل"),
      card: L(20) - 0.1, cardWhite: W(20, "لو"), cardBlue: W(20, "أزرق"), cardRed: W(21, "يمتصّ"), cardDeep: W(21, "وكلما"), cardEnd: E(21) + 0.25,
      tiles: W(22, "بالبلاط"), ladder: W(22, "السلّم"), lights: W(22, "والإضاءة"), fence: W(22, "وسورًا"),
      yay: W(23, "ومبروك"), vote: L(24) + 0.3,
      L: L, E: E, W: W, n: LN.length, end: TIMING.duration
    };
    return ev;
  }
  if (typeof module !== "undefined") module.exports = make;
  else root.EV = make(root.TIMING);
})(this);
