# 2026-10-12 - SJH, SFJ, the fountains, the courtyard and the gate from photos

**Who:** Sean, working with Claude Code.

## What was asked
> lets update the SJH BUILDING, I've uplaoded new resources on the assets folder look every image that has the name SJH on it, make sure to update the ingame building to look exactly as the inspo building, EXACTLY since we are replicating reality on this game, then the next building you will update is the SFJ [...] and update both the roundabout fountain [...] update the interior of the DJN main building named INSIDE DJN BUILDING, and the CLOSER VIEW INSIDE DJN, piece it all together. then after all of those update the gate view, the one where student are scanning their ID'S I've uploaded the HAU SIDE GATE DESIGN thats the design of the sign gate and when students enter they will be first deployed on main building, you may also put some 3d renditions while the student is outside the HAU before the scanning id where a car can pass by.

Before that, in the same session: pulled `main`, found no open pull requests, merged `add-play-script` and `osm-campus` (which held `campus-map`) into `main`, and deleted the merged branches on GitHub.

## What the photos showed, and what was drawn
Nine new pictures in `assets/` (not committed, like the others).

* **St. Joseph Hall** (`SJH BUILDING.jpg`, `SJH BUILDING BESIDE CHAPEL.jpg`): two long wings of open corridors behind white balcony walls, teal panels that step down towards the middle, a strip of blue glass between brown piers under a maroon roof line, a grey-blue tower over the entrance with a tan lift room on top, a tan entrance block with a brown band of windows and the name, a tan stair tower at each end, the red and white mast, and the statue of St. Joseph out front. The right wing is a floor taller than the left. New file `src/game/art/sjh.ts`.
* **San Francisco de Javier** (`SFJ BUILDING AND FOUNTAIN.jpg`, `SFJ BUILDING CORNER VIEW.jpg`): the tall bay of green glass over the doors, the tan pylon with its dark sloped cap, cream wings with ribbon windows, the glass podium with the name band, the flat canopy on columns, the stone base with the white ribbon sculpture, the front steps. New file `src/game/art/sfj.ts`.
* **The pool in front of SFJ**: lawn, a rim of grey stone slabs, green water, a ring of eight foaming jets and a stone bowl in the middle. It used to be a small basin on a patterned plaza.
* **The rotunda fountain** (`SFJ AND FOUNTAIN SIDE VIEW.jpg`): a low round wall of red brick standing on the road, a plate on the front, rock under the statue, thin jets from the rim arcing in. It used to be a stone basin on a grass island. The statue's wings now rise past the angel's head. A yellow arrow on the road and a wet-floor sign beside it, both in the photo.
* **The DJN courtyard** (`INSIDE DJN BUILDING.jpg`, `CLOSER VIEW INSIDE DJN.jpg`): rebuilt. The theatre front with 1933, LAUS DEO SEMPER and 1953 under three garlands, three bays of dark glass between mosaic columns (a doorway in the middle one, the red curtain in the right one), the stage with four curved terrazzo steps and their little lights, a staircase and landing each side, two-storey wings with an upstairs corridor under a grey metal roof, the steel and glass roof with spotlights, vines hanging from it, pink tiles with grey bands and a ring. Four trees in planters became two, at the ends; the lamp posts and string lights went, since the photos show roof spotlights instead.
* **The gate** (`HAU SIDE GATE DESIGN.jpg`): the white gatehouse with the seal, HOLY ANGEL UNIVERSITY in black and the glass pyramid roof; black iron railings with cream pillars instead of the cream wall; pale yellow barricades with HAU plates along the kerb; palms and campus buildings behind; the big tree trunk in the foreground, as in the photo.

## Decisions
* **You now arrive at the Main Building.** The gate scene's way in goes to the plaza's `start` point, at its gate end, and that gate takes you back out. Sean asked for this.
* **The Epiphany stays reachable from the gate** by a second, smaller path, so nothing was cut off. This was Claude's call; see "Needs a human" below.
* **Traffic for depth.** `src/game/art/traffic.ts` draws a car, an SUV, a jeepney and a tricycle once each; the gate scene slides them past in two lanes. The far lane is normal size and slow, the near lane twice the size, fast and half out of frame, which is what makes the street read as deep. Headlights at night. They pass behind the foreground tree and are gone, which also hides where the street ends and the campus drive begins.
* **The street got longer** (1010 to 1180 px) so there is a screen of street before the checkpoint. You start 190 px right of the gatehouse; the arrival cutscene walks about the same distance as before.
* **SJH and SFJ floors are squeezed** to 20 and 24 px so the whole building fits on screen; a true-to-scale storey is 31 px.
* **SFJ is drawn wider than its plot** so its doors sit behind the pool, and the Epiphany scene is 80 px longer at that end.
* The two old fountain drawings (`fountainBasin`, `fountainPlaza`) were deleted; nothing else used them.

## Tested
* `npm run check` and `npm run build` pass. `npm run check:links` passes: 12 areas, every way out works and has a way back.
* Every scene rendered whole and in play, by day and at night, in headless Chrome and compared with the photos by eye. The arrival cutscene still runs from the new starting point.

## Needs a human
* **Which gate is it?** The photo says "side gate"; the scene still says Main Gate, Sto. Rosario St. Tell us the gate's real name and street, and whether the gate at the end of the Epiphany is the same one.
* **Floor counts** on SJH and SFJ, on site.
* **The red bay** in the theatre front: it is red in the night photo and dark glass in the day photo. Drawn as a red curtain.
* The checkpoint (tent, tables, turnstile) is still a guess.

## Left unfinished
* The plaza still shows the old guard house lettered "GATE 1" at the end you now arrive by. It should become the inside of the gatehouse.
* The lobby was not touched; no photo of it was in this batch.
* Committed as Sean in six steps on `photos-sjh-sfj-courtyard-gate` and merged to `main`.
