# 2026-10-15: the chapel walkway as five lanes, with the student center

**Who:** Sean, with Claude Code.

## What was asked
Sean added 31 photos in `assets/images/buildings/beside the main building + the main walkways/`. Build the student center directly beside the Main Building, then sidewalk 1, sidewalk 2, the road, and the same sidewalks 1 and 2 on the PGN side. The player can walk any of them and enter the student center. Update the background view beside the Main Building. The pillars of sidewalk 1 should pass in front of the screen as you walk, for depth. Nothing should overlap or clutter.

## Questions asked, and Sean's answers
* **Which way does the camera face?** Each side faces its own buildings.
* **How do you change lanes?** Only at real openings, with E.
* **Where do the lanes end?** The Main Building side ends at MGN, the PGN side at PGN.
* **Where does the DJN courtyard's side gate open now?** Into the student center.

## Decisions
* **The lanes on the plan:**
  * the student center along the DJN's walkway face, at v 17
  * Main Building side: sidewalk 1 at v 13, sidewalk 2 at v 9.5
  * PGN side: sidewalk 2 at v -3, sidewalk 1 at v -6

  A spot on the walkway is at the same x in every lane on the same side, so going through an opening keeps you where you were.
* **The old `walkway` scene became the PGN side's sidewalk 2** and kept its id, so the links from the plaza and the lawn still work. The old brick walk, flagpoles and generic STL and PGN fronts are gone.
* **Openings:**
  * two gaps in the student center's planter (u -122 and -150)
  * two breaks in each side's hedge (u -100 and -140)
  * two road crossings (u -110 and -92)
* **The covered sidewalk 1 ends at the rotunda beside sidewalk 2**, so its rotunda exit steps onto sidewalk 2. Only sidewalk 2 and the student center connect to the plaza directly.
* **Depth:** on sidewalk 1 the near pillars and the slatted roof are on a faster layer, so they sweep past in front of you. On sidewalk 2 the potted arecas, bins and road kerb are in front. In the student center the cream posts and planter rail are in front.
* **The plaza** now shows the student center's end and the first pillars of the covered walk beside the DJN's left wing, and has ways into both.

## What changed
* New: `art/walks.ts`, `scenes/walklanes.ts` (student center, Main Building side sidewalks 1 and 2, PGN side sidewalk 1), `story/walks.ts`.
* Rewritten: `scenes/walkway.ts` (PGN side sidewalk 2).
* `campus/streets.ts`: the lanes. `scenes/plaza.ts`, `story/plaza.ts`: the walk ends and the links. `story/courtyard.ts`: the gate opens into the student center. `story/streets.ts`: the old walkway hotspots removed. `game.ts`, `ui/map.ts`: registered and on the C map.

`npm run check`, `npm run build` and `npm run check:links` pass.

## Left unfinished / known problems
* **The crossroads before the chapel** (the yellow zebra crossings and the median) is only the edge of the scene. The lawn scene still joins at the end of the PGN side's sidewalk 2.
* **MGN** is drawn as a plain white block with balconies at the end of the Main Building side. Its photos show more detail (stairs, the Marian statue, the parking).
* **Cafe Juan has no inside.** Its door only describes it.
* **Dialogue** needs a native speaker's check.

## Polish pass (same day)
Sean asked for the lanes to be refined and the broken areas fixed.
* **Student center:**
  * fewer and slimmer posts in front, so they no longer hide Cafe Juan's sign and door
  * daytime cafe windows (the warm room inside, the sky reflected in the glass) instead of night-dark glass
  * a real doorway into Cafe Juan in place of a black block
  * the courtyard gate shows the courtyard's daylight, vines and steps
  * the left end opens out with MGN across the drive, instead of a flat wall
* **Main Building sidewalks:** a lawn with a tree and a hedge fills the gap between MGN and the student center, which used to show a flat green slab. The covered walk seen from sidewalk 2 has its pillars in pairs a bay apart, not a picket fence.
* **PGN sidewalk 2:** the full-height white lines (the median poles) are gone. The covered walk uses the same art as the Main Building side. STL is drawn as its cream pavilion under a hipped roof. The SLOW DOWN sign moved off the starting spot.
* **PGN sidewalk 1:** STL's pavilion, a redrawn PGN podium (framed windows, maroon floor line, pilasters), glass doors with yellow-edged steps, and the PGN tower rising behind.
* **MGN** is redrawn from its photos: open corridors, slab edges with rails, columns between the bays.

## The view down the walkway from the rotunda (same day)
Sean marked the background behind the rotunda fountain in the plaza scene (`assets/The portion to be fixed.png`) and asked for it to match `the whole sidewalk hierarchy from the fountain, facing the church.jpg`. The plaza now has a perspective view down the chapel walkway (`walkwayVista` in `scenes/plaza.ts`):
* the two road lanes and the grass median with its urns
* sidewalk 2 and the covered sidewalk 1 on both sides, with pillars, roofs and banner lamps
* the big trees on the Main Building side, smaller ones by PGN
* the PGN podium on the left, the student center and the DJN's side on the right
* the chapel at the far end, drawn with the lawn scene's `chapel()` and shrunk

To keep the view clear:
* the old front-on pergola, the tree at x 330 and the palm at x 372 are gone
* the lamp at x 300 moved to 236
* the Epiphany of Angels sign moved to x 470
* Holy Rosary Parish in the far layer moved right, so it no longer sits behind the chapel
* **Then made it the whole backdrop.** Sean asked for the view to fill the background, not sit in a small window. It is now the plaza's mid layer (`vista()` in `scenes/plaza.ts`, parallax 0.42), drawn large in one-point perspective, with the vanishing point at x 300 so the statue does not hide the chapel. The generic office tower is gone: the PGN tower stands on the left, in perspective, with its floor slabs running to the chapel, and the DJN's side and the student center are on the right. The view is clipped at layer x 520, so past the DJN the backdrop is the old banded block and trees.
