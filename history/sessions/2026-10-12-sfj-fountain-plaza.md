# 2026-10-12 - The fountain plaza in front of SFJ, from the aerial photo

**Who:** Sean, working with Claude Code.

## What was asked
> update the looks of the fountain in front of the SFJ building, look at the reference "THE CURRENT IN GAME FOUNTAIN IN FRONT OF SFJ" on the assets folder and compare it on "FOUNTAIN IN FRONT OF SFJ" aerial photo of that area [...] from the road and to the fountain itself, as you can see on the image, the epiphany ends already before the SFJ building separated by trees, then enters the fountain in the middle with those tiles around it that makes such pattern, and the sfj itself

## What the photo showed, and what was drawn
Two new pictures in `assets/`: `FOUNTAIN IN FRONT OF SFJ.png` (a drone shot looking down on the plaza) and `THE CURRENT IN GAME FOUNTAIN IN FRONT OF SFJ.png` (a screenshot of the game before this session).

All of it is at the right-hand end of the Epiphany scene (`src/game/scenes/park.ts`, art in `src/game/art/sfj.ts`).

* **The Epiphany stops before SFJ.** The dark pavers, the white dashes, the tiled sidewalk and the statues' lawn used to run the whole width of the scene, under the fountain and on to the exit. They now end where the angels end, at a kerb. Past it the ground is plain grey concrete.
* **White diamonds, not dashes.** A third picture arrived during the session, `shot where the epiphany of angels walkway ends.png`, a drone shot down the Epiphany. It shows white diamonds down both edges of the road and a row of them across its end, so the dashes became diamonds. It also confirms the row of trees across the end of the road.
* **Trees close it off.** A lawn island with two trees, a palm and a shrub stands between the last angel and the plaza, in front of the left end of the building, and branches hang in from the camera's side. The Memorare stone is on that island.
* **The round plaza** (`fountainPlaza`): a white ring, a band of darker concrete inside it, then a pale disc with a square of lighter straps and eight circles outlined in dark grey, round a ring of lawn. Low black lamps stand round the ring and the lawn. It is worked out point by point from the pattern as seen from above and then flattened, so it is the same pattern the photo shows, seen from the side.
* **The pool** (`jetPool`) is in the middle of the plaza and much smaller than before: the water was about 12 m across and is now about 5 m. Same parts as before: lawn, stone rim, green water, ring of eight jets, bowl.
* **SFJ's front steps** were made taller (see the second pass).
* **A planter with a palm** at the far end of the steps, and **a planted island with a yellow kerb** and clipped shrubs at the bottom edge on the rotunda side.

## Second pass, same day
Sean looked at the first pass and asked for four more things.

* **Overlapping trees at the end of the road.** The drone shot shows a row of slender trees straight across the end of the Epiphany. They are now drawn as a row coming towards the camera: three behind you, each nearer, bigger and overlapping the one before, and a fourth in front of you (`nearTrees` in `park.ts`), shaded but still green, with the big trees on that side leaning in overhead.
* **SFJ's stairs.** They were there but only 12 px tall in two close greys, and read as a kerb. Now eight steps, each a pale tread over the shadow of its riser, with a landing and four handrails.
* **SFJ a little bigger.** About 9% in both directions: storeys 26 px instead of 24, the front 372 px wide instead of 341, starting further left so the doors stay behind the fountain. The pylon is slightly shorter above the roof so its cap still fits on screen.
* **The fountain's line.** Sean gave "Binubuksan lang nila 'to pag may bisita". Since the jets are running in the game, you now notice that it is on, say that line, and wonder who the visitor is.

## Decisions
* **Sizes come from the campus aerial**, not the drone shot, since the drone shot has no scale. The white ring measures about 19 to 22 m across on `Aerial shot of HAU enclosed in red line.png`; it is drawn 192 px, 21 m. Everything inside it is in the proportions of the drone shot (`BAND`, `LAWN`, `RIM`, `WATER` in `sfj.ts`).
* **You walk across the near half of the plaza**, in front of the pool. The plaza's far edge is at the foot of the steps.
* **Not drawn:** the brown-roofed guard house, the checkered paving beside it and the little concrete hut. They are on the camera's side of the plaza, behind you in this view.
* Nothing in `plan.ts` moved. The end of the angels and the middle of the plaza were already in the right places.

## Tested
* `npm run check` passes. `npm run check:links` reports all eight hotspots in the Epiphany working and the way to the plaza still joined up.
* Rendered in headless Chrome whole and in play, at 10 am, noon, 4 pm and 8 pm, and compared with the drone shot by eye.

## Needs a human
* **The pattern.** The straps look like one square in the photo. It could be a star (two squares) with half of it faded. Check on site.
* **The size of the plaza**, if anyone can pace it out: 21 m across the white ring is read off a satellite picture.
* **The trees.** How many and what is under them was guessed from the top of the canopy.
* **The fountain's line** is Sean's, with two lines round it written by a non-native speaker. Proofread.
