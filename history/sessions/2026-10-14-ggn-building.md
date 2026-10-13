# 2026-10-14: GGN drawn from photos, at its real size

**Who:** Sean, with Claude Code.

## What was asked
Update the GGN building from the photos in `assets/GGN BUILDING/`. It is really big, so show it in the right proportion.

## What it was
A generic seven-floor front about 25 m wide with one small door, cut off by the right-hand edge of the Back Road scene.

## Decisions
* **Its real size, at the scale of the buildings next to it.** Eleven storeys counted off the photos: a lobby three storeys high under the canopy, eight over it. At the 22 pixels a floor the halls use, that is 264 pixels, and only 206 pixels of screen are above the ground. So the top two and a half storeys run off the screen. That is deliberate: it is what makes it read as much bigger than everything else.
* **Its whole front, 53 m.** The aerial photo gives the long side about 59 m. The Back Road scene now runs 36 m past the corner (`tail` in `streets.ts` went from 60 to 325) to hold it.
* **Shown on the Back Road, though it faces the street beside it.** In the photos the front with the lobby is the long side, which on the aerial is the red-finned side on the north-east. The game has no scene on that street, and GGN's door was already on the Back Road, so the front is drawn there. Not checked with Sean.
* **The sign to the chapel moved about 2 m** so it does not stand on GGN's steps. The way to the chapel lawn moved with it.

## What changed
* `src/game/art/ggn.ts` (new): `drawGGN` and `ggnCorner`. From the left: the dark glass corner, a tower of brown louvres with a red fin at every floor carrying the seal and GEROMIN G. NEPOMUCENO BUILDING, the campus map board on its plinth, the patchwork of white panels, dark windows, air-con units and red, orange and yellow fins, the cream frame of red slabs and tan louvre panels over the lobby, the canopy and its three columns, the two ways in with their yellow-edged steps and red carpets, the plant room doors, the strip of grey glass and the far tower.
* `src/game/scenes/halls.ts`: uses it; the generic front, its door and the maroon name wall are gone (the name is on the building now). The door hotspot is the left-hand steps.
* `src/game/scenes/aps.ts`: the sliver of GGN at its left edge is the louvred tower now.
* `src/game/campus/streets.ts`: the longer tail.
* `docs/campus-layout.md`, `history/CONTEXT.md`.

`npm run build` and `npm run check:links` pass.

## Left unfinished / known problems
* **Which road the front is on** (above). If the game gets a scene for the street beside GGN, the front belongs there and the Back Road should show its end wall.
* **Floor count** is from four photos taken looking up from the road.
* **The inside of the lobby** is what can be seen from the road in the photos: the mezzanine, the screen, the stone wall. You still cannot go in.
* **The campus map board** is only a prop. It could open the C map.
* The minimap puts you along the Back Road when you walk the far end of GGN's front, not on the street the front really faces.
