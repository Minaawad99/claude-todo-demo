# «ازاي تعمل موتور؟» — facts and sounds

Style: «ازاي نعمل» (`.claude/skills/ezay-n3mel/SKILL.md`), reference `videos/_reference/ezay-n3mel/`. Our own script,
our own silly start (a shaken soda bottle instead of the reference's firecracker and bean can), our own 3D models.

## Facts
- **«مية مرة في الثانية»:** a four-stroke engine fires each cylinder once every two turns of the crank. Four cylinders at
  3000 rpm (an ordinary highway cruise): 3000 ÷ 2 × 4 = 6000 bangs a minute = 100 a second.
  (Wikipedia, "Four-stroke engine"; "Firing order" for 1-3-4-2 on inline fours.)
- **«لعُشر حجمه»:** petrol engines run compression ratios of about 8:1 to 12:1, 10:1 is typical. (Wikipedia, "Compression ratio".)
- **«بتعدّي ألفين درجة»:** peak gas temperature in the combustion chamber is above 2000 °C (about 2200–2500 °C), which is why
  the engine needs water cooling and a radiator. (Heywood, *Internal Combustion Engine Fundamentals*; Wikipedia, "Internal combustion engine" → cooling.)
- Part names as said in Egyptian garages: البستم، عمود الكرنك، البوجيه، البلوف، الرادياتير، الشكمان، المارش، بخاخ البنزين.

## Sounds
All synthesized by `videos/audio/sfx.py` (pop, fizz, slosh, splash, clink, clank, spark, boom, idle, rev, intake, exhaust,
squeeze, sizzle, coolant, whoosh, bump, servo, beep, tick, chime), plus the kit's `px-ding` (Pixabay, credited in
`videos/_templates/sketch/sfx/SOURCES.md`). No music.

## Real car recordings (added after the first cut)
The user's Pixabay / Freesound clips, first sent for «أوكتان» (`videos/octane/sfx`), copied to `videos/car-engine/sfx/`:
engine idle (car-idle-1-blyth 62010), engine start (44357), acceleration inside a car (7087), engine knock (64227),
electric sparks (6130), car passing (soundque 442774), gas pump (29700). They replace the synthesized idle, rev, starter
and loud-exhaust sounds; slices are listed at the top of `cues.js`. No music.
