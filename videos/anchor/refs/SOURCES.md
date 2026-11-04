# Anchor episode: fact sources

- VLCC (~300,000 DWT) anchors about 18–24.5 t each; one 27.5 m shackle of chain about 9 t, so 12+ shackles (330 m+) weigh 100 t+. Seafaring reference tables (search, Nov 2026).
- An anchor holds by digging in (flukes, like a plough) when the pull is near horizontal; the chain's weight (catenary) keeps the pull low, adds seabed friction in moderate weather and absorbs shocks; in strong wind the chain straightens and the anchor can drag. Waterway Guide "Anchoring tips: scope, don't skimp"; BoatTest "Reconsidering the rode".
- Scope of 4–6 × depth is the usual seamanship rule; ships anchor in water mostly under 100 m.
- Oct 2023: the Hong Kong-flagged Newnew Polar Bear dragged its anchor and damaged the Balticconnector gas pipeline between Finland and Estonia; the anchor was raised near the pipeline (ERR News; Finnish NBI).

## Drawing references (the user's 13 photos, Nov 2026; visual reference only, not reused or committed)
- Stockless anchors on quays (black, front and three-quarter views): two broad flukes with chisel tips rising either side of a square shank, heavy chamfered crown, tripping palms, D-shackle → `anchorFront()` and the side profile in `anchor()`.
- Anchors stowed in the hawse (rusty, against blue/black bows): shank inside the hawse pipe, flukes pressed against the plating, a round raised bolster around the hawse → `tanker({stowed})`.
- A rusty anchor hanging under a blue bow with the swivel and links above → shot 3 (dropping) and the balance in shot 1.
- Stud-link chain heap (dark grey, large studs) → `chainAlong()` shading.
- Red bow windlass with the chain over the gypsy and a warping drum → `windlass()`.
- VLCCs (aerial and in dock): black topsides, red bottom, long flat deck with pipes, white accommodation aft → `tanker()`.
- Underwater anchor scenes: light shafts from the surface, sandy seabed, chain rising to the hull → `cutaway()`.
