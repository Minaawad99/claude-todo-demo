/* «إيه الحكاية؟» — the host as a cut-out puppet (the user's rule, Nov 2026: people must move). Parts cut from the Gemini
   rig sheet sheets/s12-host-rig-parts.jpg into rig/*.png. Every part is placed by its two joints, so any pose is a few
   angles, and poses tween smoothly. The face blinks, the brows act and the mouth follows the voice.

   PERSON.rig(pose, x, feetY, height, t) → SVG. pose (all optional; angles in degrees, 90 = straight down, 0 = to the
   viewer's right, -90 = up):
     lean        body tilt (deg, + leans to the viewer's right)        bob: 0..1 a small dip (a step, a nod)
     head        head tilt (deg)
     armN/armF   near arm (viewer's left) / far arm: [upper-arm angle, forearm angle, hand, hand-angle offset]
                 hands: relaxed, fist, palm, thumbs, point, grip (grip holds a thin stick, drawn by the caller after)
     legN/legF   [thigh angle, shin angle]
     eyes        "open" | "half" | "closed" | "angry"   (blinks by itself every ~3.5 s while "open")
     brows       "neutral" | "raised" | "worried" (brows are drawn only for neutral/raised/worried; angry eyes carry their own)
     mouth       "smile" | "neutral" | "open" | "wide" | "o" | "small" | "frown"; or talk: 0..1 (the voice level) picks one
   PERSON.rigPose(name) → a preset pose; PERSON.rigMix(a, b, k) tweens two poses; PERSON.rigJoints(...) returns the joints
   (hands, head) so a prop can be placed in a hand. */
(function () {
var base = (function () { var s = document.currentScript && document.currentScript.src; return s ? s.replace(/[^/]*$/, "") + "rig/" : "rig/"; })();
var SZ = {"legA":[185,671],"legB":[226,667],"head":[276,371],"neck":[108,136],"torso":[359,629],"hips":[301,238],"uarmA":[171,352],"uarmB":[187,343],"farmA":[104,200],"farmB":[91,181],"thighA":[160,392],"thighB":[156,385],"shinA":[161,405],"shinB":[189,401]};
// joints of each part in its own pixels: [from, to] (from = the joint nearer the body)
var J = {
  torso: { hip: [190, 600], neck: [197, 40], shN: [52, 180], shF: [312, 180] },
  hips: { waist: [150, 30], hipN: [92, 120], hipF: [210, 120] },
  neck: [[54, 120], [54, 18]], head: [[160, 330]],
  uarmA: [[118, 48], [48, 296]], farmA: [[42, 22], [72, 182]],
  uarmB: [[66, 48], [138, 292]], farmB: [[56, 20], [42, 165]],
  thighA: [[80, 40], [84, 352]], shinA: [[44, 22], [56, 296]],
  thighB: [[78, 40], [80, 342]], shinB: [[52, 18], [62, 296]],
  legA: [[80, 40], [71, 562]], legB: [[80, 40], [90, 562]]   // thigh and shin stitched into one straight leg (no knee break)
};
// hands: wrist point and the direction of the fingers in the image
var HAND = { relaxed: [[63, 205], -90], fist: [[60, 150], -90], palm: [[70, 205], -90], point: [[63, 212], -90], thumbs: [[8, 112], 0], grip: [[14, 332], -20] };
var HS = { relaxed: [126, 214], fist: [121, 157], palm: [141, 214], point: [126, 220], thumbs: [160, 164], grip: [179, 377] };
var HS2 = { relaxed: [126, 213], fist: [118, 150], palm: [141, 215], point: [126, 220], thumbs: [159, 164], grip: [177, 377] };
var FACE = { eyeL: [147, 205, .72], eyeR: [236, 203, .5], browL: [145, 168, .72], browR: [243, 167, .5], mouth: [190, 292, .66] };
var FS = { "eyeL-open": [72, 44], "eyeR-open": [72, 44], "eyeL-half": [73, 51], "eyeR-half": [74, 50], "eyeL-closed": [73, 20], "eyeR-closed": [72, 21], "eyeL-angry": [102, 66], "eyeR-angry": [103, 67],
  "browL-neutral": [103, 33], "browR-neutral": [103, 34], "browL-raised": [102, 41], "browR-raised": [103, 41], "browL-worried": [108, 45], "browR-worried": [108, 46],
  "mouth-smile": [122, 38], "mouth-neutral": [111, 14], "mouth-open": [105, 47], "mouth-wide": [102, 70], "mouth-o": [83, 96], "mouth-small": [55, 58], "mouth-frown": [110, 37] };
var SKIN = "#d59879", f = function (n) { return (+n).toFixed(2); }, R = Math.PI / 180;
function img(name, w, h) { return '<image href="' + base + name + '.png" x="0" y="0" width="' + w + '" height="' + h + '"/>'; }
// place a part so that its joint a lands on world point A and its axis a→b points along ang (deg)
var CLIPID = 0;
function seg(name, A, ang, ja, jb, st, fromY, toY) { var s = SZ[name], phi = Math.atan2(jb[1] - ja[1], jb[0] - ja[0]) / R, inner = img(name, s[0], s[1]);
  if (fromY != null || toY != null) { var y0 = fromY || 0, y1 = toY || s[1], id = "rgc" + (++CLIPID); inner = '<clipPath id="' + id + '"><rect x="0" y="' + y0 + '" width="' + s[0] + '" height="' + (y1 - y0) + '"/></clipPath><g clip-path="url(#' + id + ')">' + inner + '</g>'; }   // only rows y0..y1 of the part (the rolled cuff; the forearm without its end cap)
  return '<g transform="translate(' + f(A[0]) + ' ' + f(A[1]) + ') rotate(' + f(ang) + ') scale(' + f(st || 1) + ' 1) rotate(' + f(-phi) + ') translate(' + f(-ja[0]) + ' ' + f(-ja[1]) + ')">' + inner + '</g>'; }
function end(A, ang, ja, jb, st) { var L = Math.hypot(jb[0] - ja[0], jb[1] - ja[1]) * (st || 1); return [A[0] + Math.cos(ang * R) * L, A[1] + Math.sin(ang * R) * L]; }
function hand(kind, W, ang, two) { var h = HAND[kind] || HAND.relaxed, s = (two ? HS2 : HS)[kind] || HS.relaxed, nm = (two ? "hand2-" : "hand-") + (HAND[kind] ? kind : "relaxed");
  return '<g transform="translate(' + f(W[0]) + ' ' + f(W[1]) + ') rotate(' + f(ang - h[1]) + ') scale(.86) translate(' + f(-h[0][0]) + ' ' + f(-h[0][1]) + ')">' + img(nm, s[0], s[1]) + '</g>'; }
function facePart(name, at, sc) { var s = FS[name]; if (!s) return ""; return '<g transform="translate(' + f(at[0] - s[0] * sc / 2) + ' ' + f(at[1] - s[1] * sc / 2) + ') scale(' + f(sc) + ')">' + img(name, s[0], s[1]) + '</g>'; }
var PRESET = {
  stand: { lean: 0, head: 0, armN: [100, 96, "relaxed"], armF: [82, 86, "relaxed"], legN: [92, 90], legF: [86, 89], eyes: "open", brows: "neutral", mouth: "smile" },
  sad: { lean: -2, head: 8, armN: [78, -96, "fist", 0], armF: [84, 88, "relaxed"], legN: [92, 90], legF: [86, 89], eyes: "half", brows: "worried", mouth: "frown" },
  think: { lean: 0, head: -6, armN: [98, -52, "fist", -30], armF: [84, 88, "relaxed"], legN: [92, 90], legF: [86, 89], eyes: "open", brows: "raised", mouth: "neutral" },
  pointUp: { lean: 2, head: -8, armN: [100, 96, "relaxed"], armF: [-50, -92, "point"], legN: [92, 90], legF: [86, 89], eyes: "open", brows: "raised", mouth: "o" },
  explain: { lean: 0, head: 4, armN: [110, 15, "palm", -20], armF: [72, -5, "palm", 10], legN: [92, 90], legF: [86, 89], eyes: "open", brows: "neutral", mouth: "open" },
  show: { lean: 1, head: -4, armN: [60, -100, "fist", 0], armF: [84, 88, "relaxed"], legN: [92, 90], legF: [86, 89], eyes: "open", brows: "raised", mouth: "smile" },
  thumbs: { lean: 0, head: 4, armN: [100, 96, "relaxed"], armF: [75, -45, "thumbs", -45], legN: [92, 90], legF: [86, 89], eyes: "open", brows: "neutral", mouth: "smile" },
  surprised: { lean: -3, head: -6, armN: [140, -120, "palm"], armF: [40, -60, "palm"], legN: [94, 90], legF: [84, 89], eyes: "open", brows: "raised", mouth: "wide" },
  shrug: { lean: 0, head: 6, armN: [115, 35, "palm", -40], armF: [65, 145, "palm", 40], legN: [92, 90], legF: [86, 89], eyes: "open", brows: "worried", mouth: "neutral" }
};
function rigPose(n) { return JSON.parse(JSON.stringify(PRESET[n] || PRESET.stand)); }
function rigMix(a, b, k) { var o = {}, key; k = Math.max(0, Math.min(1, k));
  for (key in Object.assign({}, a, b)) { var x = a[key], y = b[key];
    if (typeof x === "number" && typeof y === "number") o[key] = x + (y - x) * k;
    else if (Array.isArray(x) && Array.isArray(y)) o[key] = x.map(function (v, i) { return typeof v === "number" && typeof y[i] === "number" ? v + (y[i] - v) * k : (k < .5 ? v : y[i]); });
    else o[key] = k < .5 ? (x == null ? y : x) : (y == null ? x : y); }
  return o; }
function build(p, x, fy, h, t, wantJoints) {
  p = Object.assign(rigPose("stand"), p || {}); t = t || 0;
  var br = Math.sin(t * 1.7) * 3, bob = (p.bob || 0) * 14, lean = p.lean || 0;
  // the skeleton in sheet pixels, feet at 0: the hips sit at -(thigh+shin) from the ground
  var legLen = 312 + 274, P = [0, -legLen - 92 + bob], hipsJ = J.hips;
  var hp = function (j) { return [P[0] + (j[0] - hipsJ.waist[0]), P[1] + (j[1] - hipsJ.waist[1])]; };
  var hipN = hp(hipsJ.hipN), hipF = hp(hipsJ.hipF), s = "";
  var tor = J.torso, ta = -90 + lean, tphi = Math.atan2(tor.neck[1] - tor.hip[1], tor.neck[0] - tor.hip[0]) / R;
  var TT = function (j) { var dx = j[0] - tor.hip[0], dy = j[1] - tor.hip[1], a = (ta - tphi) * R; return [P[0] + dx * Math.cos(a) - dy * Math.sin(a), P[1] - 8 + br * .3 + dx * Math.sin(a) + dy * Math.cos(a)]; };
  var shN = TT(tor.shN), shF = TT(tor.shF), nk = TT(tor.neck);
  var FST = 1.16;   // the forearm part is drawn short: stretch it to the real forearm length (0.146 H against the upper arm's 0.186 H)
  function arm(A, sh, nm, two) { var u = nm === "A" ? J.uarmA : J.uarmB, fr = nm === "A" ? J.farmA : J.farmB, el = end(sh, A[0], u[0], u[1]), wr0 = end(el, A[1], fr[0], fr[1], FST), wr = end(el, A[1], fr[0], fr[1], FST * .9);
    var ha = A[1] + (A[3] || 0), prop = A[4] ? '<g transform="translate(' + f(wr[0]) + ' ' + f(wr[1]) + ') rotate(' + f(ha) + ') translate(62 0)">' + A[4] + '</g>' : "";   // the grip is ~62 px past the wrist, in the curled fingers
    // upper arm, then hand and forearm over it (a bent arm folds in front), then the rolled cuff again round the elbow
    var cuffY = nm === "A" ? 248 : 244;
    return { svg: seg("uarm" + nm, sh, A[0], u[0], u[1]) + prop + hand(A[2] || "relaxed", wr, ha, two) + seg("farm" + nm, el, A[1], fr[0], fr[1], FST, null, nm === "A" ? 176 : 160) + seg("uarm" + nm, sh, A[0], u[0], u[1], 1, cuffY), wr: wr, el: el, ha: ha }; }
  function leg(L, hip, nm) { if (Math.abs(L[0] - L[1]) < 8) return seg("leg" + nm, hip, (L[0] + L[1]) / 2, J["leg" + nm][0], J["leg" + nm][1]);
    var th = J["thigh" + nm], sh = J["shin" + nm], kn = end(hip, L[0], th[0], th[1]);
    return seg("shin" + nm, kn, L[1], sh[0], sh[1]) + seg("thigh" + nm, hip, L[0], th[0], th[1]); }
  var aF = arm(p.armF, shF, "B", true), aN = arm(p.armN, shN, "A", false);
  // far arm, legs, hips, torso, neck, head, near arm
  // legs first, then only the top of the hips (waistband and seat) over the thigh tops
  s += aF.svg + leg(p.legF, hipF, "B") + leg(p.legN, hipN, "A");
  s += '<clipPath id="rigHip"><rect x="0" y="0" width="' + SZ.hips[0] + '" height="132"/></clipPath><g transform="translate(' + f(P[0] - hipsJ.waist[0]) + ' ' + f(P[1] - hipsJ.waist[1]) + ')"><g clip-path="url(#rigHip)">' + img("hips", SZ.hips[0], SZ.hips[1]) + '</g></g>';
  s += seg("torso", TT(tor.hip), ta, tor.hip, tor.neck);
  var ntop = [nk[0], nk[1] - 6], hc = J.head[0], hr = (p.head || 0) + lean + Math.sin(t * 1.1) * 1.2;
  var face = "", eyes = p.eyes || "open";
  if (eyes === "open" && ((t + 0.37) % 3.6) < .13) eyes = "closed";   // a blink
  var mouth = p.mouth; if (p.talk != null) mouth = p.talk > .62 ? "wide" : p.talk > .4 ? "open" : p.talk > .18 ? "small" : (p.mouthRest || "neutral");
  // cover the drawn eyes, brows and mouth with skin, then draw the acting ones
  face += '<ellipse cx="147" cy="200" rx="40" ry="32" fill="' + SKIN + '"/><ellipse cx="238" cy="198" rx="22" ry="30" fill="' + SKIN + '"/><ellipse cx="190" cy="297" rx="48" ry="18" fill="' + SKIN + '"/>';
  face += facePart("eyeL-" + eyes, [FACE.eyeL[0], FACE.eyeL[1]], FACE.eyeL[2]) + facePart("eyeR-" + eyes, [FACE.eyeR[0], FACE.eyeR[1]], FACE.eyeR[2]);
  if (eyes !== "angry") face += facePart("browL-" + (p.brows || "neutral"), [FACE.browL[0], FACE.browL[1]], FACE.browL[2]) + facePart("browR-" + (p.brows || "neutral"), [FACE.browR[0], FACE.browR[1]], FACE.browR[2]);
  face += facePart("mouth-" + (mouth || "smile"), [FACE.mouth[0], FACE.mouth[1]], FACE.mouth[2]);
  s += '<g transform="translate(' + f(ntop[0]) + ' ' + f(ntop[1] + 10) + ') rotate(' + f(hr) + ') scale(.8) translate(' + f(-hc[0]) + ' ' + f(-hc[1]) + ')">' + img("head", SZ.head[0], SZ.head[1]) + face + '</g>';
  s += aN.svg;
  var k = h / 1560;   // feet to the top of the hair, in sheet pixels
  var out = '<g transform="translate(' + f(x) + ' ' + f(fy) + ') scale(' + f(k) + ')">' + s + '</g>';
  if (!wantJoints) return out;
  var W = function (q) { return [x + q[0] * k, fy + q[1] * k]; };
  return { svg: out, wristN: W(aN.wr), wristF: W(aF.wr), head: W(ntop), k: k };
}
window.PERSON = window.PERSON || {};
window.PERSON.rig = function (p, x, fy, h, t) { return build(p, x, fy, h, t, false); };
window.PERSON.rigJoints = function (p, x, fy, h, t) { return build(p, x, fy, h, t, true); };
window.PERSON.rigPose = rigPose; window.PERSON.rigMix = rigMix;
})();
