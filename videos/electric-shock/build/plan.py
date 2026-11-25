"""«لو حد جنبك مسكته الكهربا» — the shot plan, shared by base.py (pictures), overlay.js (captions, chips, ✗) and cues.py.
Media are the user's Gemini pictures and Veo clips in ../media. Times come from ../timing.js (the narration, version B)."""
import json, os, re
HERE = os.path.dirname(os.path.abspath(__file__))
EP = os.path.dirname(HERE)
T = json.loads(re.sub(r"^window.TIMING = |;\s*$", "", open(os.path.join(EP, "timing.js"), encoding="utf-8").read().strip()))
L = T["lines"]; DUR = T["duration"]; TAIL = 1.6; END = DUR + TAIL
S = [l["start"] for l in L]

def at(i, word):
    """time the narrator reaches `word` in line i (by its place in the line's characters)"""
    t = L[i]["text"]; k = t.index(word)
    return L[i]["start"] + (L[i]["end"] - L[i]["start"]) * k / len(t)

# shots: (start time, media, options). Each runs until the next one starts.
SHOTS = [
    (0.0, "01-hook.mp4", {}),
    (S[1], "02-stop.mp4", {}),
    (S[2], "03-door.mp4", {}),
    (S[3], "04-arm.mp4", {}),
    (S[4], "05-fist.mp4", {}),
    (S[5], "06-heart.mp4", {}),
    (S[6], "07-both.mp4", {}),
    (S[7], "08-breaker.mp4", {}),
    (at(7, "أو شيل"), "08b-plug.mp4", {}),
    (S[8], "09-cardboard.jpg", {"zoom": (1.0, 1.08), "fy": 0.55}),
    (S[9], "10-broom.mp4", {}),
    (S[10], "11-high-voltage.mp4", {}),
    (S[11], "12-check.mp4", {}),
    (S[12], "13-cpr.jpg", {"zoom": (1.12, 1.0), "fy": 0.55}),
    (S[13], "13-cpr.mp4", {}),
    (S[14], "14-recovery.mp4", {}),
    (S[15], "15-tap.mp4", {}),
    (at(15, "وغطّيها"), "15b-cling.jpg", {"zoom": (1.0, 1.07)}),
    (S[16], "16-inside.mp4", {}),
    (S[17], "17-water.jpg", {"zoom": (1.0, 1.07)}),
    (S[18], "18-pull.jpg", {"zoom": (1.07, 1.0)}),
    (S[19], "19-toothpaste.jpg", {"zoom": (1.0, 1.07)}),
    (S[20], "20-im-fine.jpg", {"zoom": (1.0, 1.08), "fy": 0.55}),
    (S[21], "21-hospital.mp4", {}),
    (S[22], "RECAP", {}),
    (S[23], "23-share.jpg", {"zoom": (1.0, 1.06)}),
]
XF = 0.3   # crossfade between shots

# the recap card: the four icons cut from 06-22-heart-icons.jpg (768×1376), crop box and where each icon sits
RECAP_CROP = (150, 875, 470, 440)          # x, y, w, h in the source picture
RECAP_SCALE = 1080 / RECAP_CROP[2]
RECAP_Y = (1920 - RECAP_CROP[3] * RECAP_SCALE) / 2 + 120
def recap_xy(x, y): return ((x - RECAP_CROP[0]) * RECAP_SCALE, (y - RECAP_CROP[1]) * RECAP_SCALE + RECAP_Y)
RECAP_ICONS = [  # (centre in the source, size, word that lights it)
    ((268, 992), 190, "ماتلمسوش"), ((500, 992), 190, "اقطع"), ((268, 1215), 190, "كلّم"), ((500, 1215), 190, "اضغط")]

# captions: what is shown when it differs from what is said (numbers as digits)
CAPTEXT = {"تمنتاشر متر": "18 متر", "واحد اتنين واحد": "121", "واحد اتنين تلاتة": "123", "خمسة سانتي": "5 سانتي",
           "مية لمية وعشرين": "100 لـ 120", "عشرين دقيقة": "20 دقيقة"}
RED = ("اوعى", "ماتلمسوش", "ماترميش", "ماتسحبهوش", "ماتحطش", "يرتعش", "خطر", "ماتقربش", "ضغط", "عالي", "الضرر", "مضطرب", "تموّتكم", "اتنين.", "وماتعملش")
BLUE = ("الكهربا", "الكهربا:", "الكهربا،", "الكهربا.", "السلك", "السلك.", "إشارته،", "العضلات", "عضلات", "القلب", "القلب،")
GOLD = ("123", "121", "18", "5", "100", "120", "20", "ناشفة", "خشب", "بلاستيك", "نص", "جنبه،", "المستشفى", "رسم", "قلب،")
# chips: a number tag that holds under the picture from a word to the end of its line
CHIPS = [(10, "تمنتاشر", "ابعد 18 متر"), (10, "واحد اتنين واحد", "طوارئ الكهربا 121"), (11, "واحد اتنين تلاتة", "الإسعاف 123"),
         (13, "خمسة", "5 سم لتحت"), (13, "مية لمية", "100–120 ضغطة / دقيقة"), (15, "عشرين", "20 دقيقة ميّه جارية")]
# red ✗ over a picture, from a word to the end of the shot
CROSSES = [(6, "ماتلمسوش"), (17, "ماترميش"), (18, "ماتسحبهوش"), (19, "ماتحطش")]
# a big warning stamp
STAMPS = [(1, "اوعى تمد إيدك!")]

if __name__ == "__main__":
    for i, (t, m, o) in enumerate(SHOTS):
        nx = SHOTS[i + 1][0] if i + 1 < len(SHOTS) else END
        print(f"{i:2d} {t:7.2f} {nx - t:5.2f} {m}")
    print("end", END)
