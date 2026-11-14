# Titanic — where each drawing's shape comes from

Downloaded from Wikimedia Commons (looked at for shape only, nothing reused):

| drawing | reference | what was taken |
|---|---|---|
| the ship (`ship()`) | `RMS_Titanic_3.jpg` — F.G.O. Stuart's photograph of the Titanic leaving Southampton, 10 April 1912 | black hull with a white strake and gold line, white upperworks in two tiers, four raked buff funnels with black tops, two tall masts with rigging, the row of white lifeboats on the boat deck, straight stem and counter stern |
| the sinking (shots 39–40), lifeboats and icebergs | `Stöwer_Titanic.jpg` — Willy Stöwer's 1912 painting | the stern rising as the bow goes under, open white lifeboats full of people rowing away, icebergs around, debris in the water |

Commons' search API refused this session (HTTP 429), and other guessed file names did not exist, so the rest is drawn
from documented features: the Californian (one funnel, four masts), the Carpathia (one tall red funnel with a black
top, four masts), the Marconi room (desk, apparatus, headphones, telegram spike), the crow's nest on the foremast with
its bell, 1912 clothes (bowler and flat caps, long dresses and wide hats, navy uniforms, cork lifebelts), and Hamad
Hassab as a Cairo dragoman in a tarboush.

Sound: no music. `sfx/morse.wav` is synthesized here (CQD SOS MGY, the Titanic's call sign); `sfx/horn.wav` is the ship
horn synthesized for the crossing episode; the rest are `audio/sfx.py` voices and clips from `../_templates/sketch/sfx/`.
