# Real clips and photos sent by the user (2026-11-27)

Use: framed cards over the 3D interior. The user downloaded these from YouTube Shorts and other pages; several carry another channel's logo or burned-in text (v1, v7 «العين»), crop or cover those.

| file | what it shows | script line |
|---|---|---|
| v1-rose-water-outside | rose water poured on the marble round the Kaaba, outside; caption burned in | 25 (the mix) |
| v2-shaibi-key-stairs | the key holder of Bani Shaiba at the door on the stairs (360p) | 21–23 |
| v3-door-and-inside | the Haram at night, the gold door, then inside: door from inside, pillars, green ceiling | 8–9, 14 |
| v4-gold-door | the gold door close-up, people touching it | 8 |
| v5-stairs-to-door-1447 | the wooden stair pushed to the door, officials going up | 7, 23 |
| v6-inside-pillars-lamps | inside: pillars, lamps, green ceiling, people praying (360p) | 9–15 |
| v7-washing-inside-wipe | washing inside, walls wiped with cloths (Al-Ain news logo) | 1, 27–28 |
| p1/p2 museum | Exhibition of the Two Holy Mosques Architecture | 33–34 |
| p3 incense | a raised incense burner (in the Haram, not inside the Kaaba) | 30 |
| p4/p5 oud oil | oil poured on hands / the Black Stone perfumed (outside) | 25 |
| p7 wiping inside wall | an official wiping an inside wall during the washing | 28 |
| p8 wiping outside wall | wiping the outside wall, kiswa raised | — |
| p9 Bab al-Tawba | the real door of repentance inside (the 3D model follows it) | 16 |
| p6 | an AI thumbnail from another channel: not real, not ours, do not use | — |

Also sent: a second copy of the user's style reference video (identical file), not kept.

## Added later
| file | what it shows | use |
|---|---|---|
| v8-inside-360-720p | a 360° **computer render** of the interior (YouTube EAC layout, not real footage). Flatten with `ffmpeg -vf "v360=eac:flat:h_fov=80:v_fov=110:w=1080:h=1920:yaw=<deg>"`; yaw sweeps make slow pans | 3D reference; label as «محاكاة» if shown |
| p10 / p11 zubayr pillar | the old teak pillar from Ibn al-Zubayr's rebuilding in the Exhibition of the Two Holy Mosques Architecture (p11 from alharaman.gov.sa) | 33–34 |

v7 logo: `crop=720:660:0:320` removes the Al-Ain logo and the lower-third (source footage: Al-Ekhbariya).
| v9-washing-inside-almamlaka-1080p | Al-Mamlaka TV, 1080×1920, the washing inside: 0–8 s outside + captions; 8.2–32.4 s an official wiping the inner wall; 32.4–43.3 s the gold band of a pillar wiped with a white cloth (best hook shot); 43.3–48.4 s the stair; 48.4–60.3 s people inside; 60.3–65.6 s pillar wiped; 65.6–73 s stair and the Haram from above; 73 s+ channel end card | hook (lines 1–3), 27–29, 23. Crop the frame graphics: `crop=1080:1640:0:250` |
