# «التبرع بالدم» — sources

## Topic and hook
- The user's source video (a 73 s Arabic explainer on how the body replaces donated blood). We took its hook («بيتسحب منك نص لتر… وتقوم تمشي عادي. جسمك بيرجّعه إزاي؟») and the way it draws the donation arm (forearm flat on an armrest, open hand, a cut window over the vein with the needle, the tube down to the bag). The script and every drawing are our own; the arm is now `PERSON.forearm` in the shared person kit.

## Facts (checked)
- Whole-blood donation ≈ 450 ml, about 8–10 minutes; an adult has ≈ 5 L (so about a tenth). — American Red Cross, «Blood donation process»; WHO, «Blood safety and availability».
- First minutes: vessels constrict and the heart rate rises a little to hold blood pressure (baroreflex). — standard physiology (Guyton & Hall, ch. 18).
- Plasma volume is restored within about 24–48 hours by fluid moving from the tissues into the vessels. — American Red Cross; NHS Blood and Transplant.
- The kidney senses lower oxygen delivery and releases erythropoietin (EPO), which tells the bone marrow to make more red cells. — Guyton & Hall, ch. 33.
- The marrow makes ≈ 2 million red cells per second; a red cell lives ≈ 120 days (so ≈ 1% of red cells are replaced every day). — Guyton & Hall; Dean, «Blood Groups and Red Cell Antigens» (NCBI Bookshelf).
- Red cells are back in about 4–6 weeks; iron takes longer, so the whole-blood interval is about 12 weeks for men and 16 for women (WHO); Egypt's National Blood Transfusion Service uses about 3 months.
- One unit is split into red cells, plasma and platelets and can help up to three patients. — American Red Cross.

## Reference drawings
- «طب إزاي؟» v07 (the hand and arm) and v20 (the arm cut, the marrow) in `videos/_reference/tabizzay/sheets/`, for how a limb is cut open and labelled.

## Sounds
- The «اسكتش» kit (`videos/_templates/sketch/sfx/`, credits in its cues.js): paper swipe, paper slide, pencil scribble, ding, rushing water. Everything else (drips, fill, heartbeat thuds, pops, ticks, beeps, whoosh) is synthesized by `audio/sfx.py`. No music.
