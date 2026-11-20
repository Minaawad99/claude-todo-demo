# «ليه صوابعك بتطقطق؟» — sources

## Facts (checked)
- The crack is a gas cavity forming in the synovial fluid when the joint surfaces are pulled apart, filmed with real-time
  MRI: Kawchuk et al., "Real-Time Visualization of Joint Cavitation", PLOS ONE 10(4): e0119470 (2015), University of
  Alberta (https://pmc.ncbi.nlm.nih.gov/articles/PMC4398549). One volunteer; the older view (1970s) was bubble collapse.
- Refractory period of about 20 minutes before the same joint cracks again (same paper and its press release).
- Synovial fluid: thick, egg-white-like (synovia, "with egg"); it lubricates the joint and holds dissolved gases,
  mostly carbon dioxide.
- After cracking the joint space is a little wider and the range of motion is a little larger (relief).
- Donald Unger cracked the knuckles of his left hand only, at least twice a day for more than 60 years; neither hand
  had arthritis (Arthritis & Rheumatism, 1998 letter). Ig Nobel Prize in Medicine 2009; his mother and aunts had told
  him it would cause arthritis (https://improbable.com/2009/11/05/interview-with-dr-knuckle-cracker/,
  https://www.scientificamerican.com/article/crack-research/).
- Larger studies (Castellanos & Axelrod 1990, about 300 people; deWeber 2011, 215 people) found no link to arthritis;
  the 1990 study saw more hand swelling and weaker grip in habitual crackers, hence the "pain or swelling: see a doctor" line.

## Drawing
- The hand is the rig from «ليه البنصر مش بيترفع؟» (`videos/finger-stuck/`), which the user approved; here it gets a
  bone overlay (carpals, metacarpals, three phalanges per finger) after the «طب إزاي؟» reference v07, a finger pull and a
  knuckle ring.
- The knuckle cut follows real anatomy of the metacarpophalangeal joint (sagittal section): the round metacarpal head,
  the shallow cup of the proximal phalanx, cartilage on both faces, the capsule, extensor and flexor tendons.
  Schematic reference: Wikimedia Commons, "Expansion de gaz du liquide synovial.jpg".
- People with real body proportions (Drillis & Contini), copied from `videos/choking/sketch/shots.js`.

## Sound
- Real knuckle cracks the user picked on Pixabay (freesound_community uploads, Pixabay Content License), in `sfx/`:
  - `px-knuckle.mp3` «knuckle cracking» (97875): one sharp crack at 0.28 s → «طق!», the MRI clicks, the recap.
  - `px-knuckles-series.mp3` «human cracking knuckles» (062747, 80359): cracks at 2.645, 3.755, 4.88, 6.21 s → the four
    fingers pressed in the hook, Unger's left hand, the mother scene.
  - `px-finger-crack.mp3` «finger bones crack» (97273): the crack at 0.155 s → the stretch in the hook.
  - `px-bone-crack.mp3` «bone crack 1» (84755): the crack at 0.14 s → the second crack of the stretch.
  Each slice starts 20 ms before its crack and is barely ducked under the narrator (duck 0.25) so every crack is heard.
- Kit clips from `videos/_templates/sketch/sfx/`: swipe, paper, pencil-scribble, ding, clock-ticking.
- Synthesized in `videos/audio/sfx.py`: knuckle (a stand-in only if a clip above is missing), pop,
  whoosh, tick, chime, ping, creak, intake, fizz, slosh, servo, hum.
- No music.
