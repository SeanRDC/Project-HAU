# 2026-10-14: the side gate entryway and its flag plaza

**Who:** Sean, with Claude Code.

## What was asked
Sean added six photos in `assets/sidegate entryway/`. Students come in by the side gate, but they do not come out straight in front of the Main Building: there is an entryway first, a walkway, then a round area with the Philippine flag in the middle and three staircases going off it. Using `closer view.jpg` as the reference: the right staircase goes to SFJ and the Epiphany, the middle one to the parking where St. Therese is. Update the game and the map to match, precisely and beautifully.

## What it was
Tapping your ID at the gate set you down in front of the Main Building, at the St. Barachiel Gate end. The side gate sat at St. Barachiel Gate on the plan and the map.

## Decisions
* **Where it is.** Read off the aerial photo: the side gate is on Holy Angel Avenue at pixel (507, 604), facing Holy Rosary Parish across the street. The light strip of the walkway runs north from it about 25 m to the round plaza under the "Courtyard" pin at (504, 535). That puts the rotunda about 20 m north of the plaza, the SFJ fountain about 20 m west and the drive in front of the Main Building just east. The gate-area diagram agrees: it is the "Courtyard/Pedestrian Gate", and the round thing with the star next to the parking is the flag plaza. These are `sideGate` and `flagCircle` in `plan.ts`, with `flagEast` and `flagWest` for the feet of its side steps.
* **The scene is the closer-view photo.** The camera stands on the plaza looking south, back down the walkway to the gate, so left and right on the screen are the photo's left and right. You walk left and right across the plaza. The walkway goes away into the distance, in perspective, to the back of the gate. Holy Rosary's towers stand to the right of it, as in the photo. It is the only scene with a perspective corridor like this: the walkway is drawn with its own vanishing point (`Walkway` in `art/entry.ts`), and the plaza is flattened less than the SFJ fountain (0.22 against 0.2) because you stand right at its edge.
* **The three staircases:**
  * right: down to the SFJ fountain and the Epiphany (the park scene's right end)
  * middle: towards the camera, down to the parking lane by STL
  * left: down to the drive in front of the Main Building

  **The left one was not given by Sean.** The photos and the aerial photo show it heading to the drive in front of the Main Building, so it goes there. Check it.
* **The pole sits between DEO and SEMPER.** The walkway and the gate are on the flagpole's line, but the camera is 6 px left of that line, as it is in the photo, so the pole does not cover a letter of LAUS DEO SEMPER 1933.
* **St. Barachiel Gate is for cars.** Pressing E there used to take you out to the street; now it says it is for vehicles and that students use the side gate by the flagpole. The guard and the boom barrier there stay.
* **Ella moved** from the front of the Main Building to the flag plaza, since that is where you now come out after her.
* **A new guard, Ate Weng**, in the all-white uniform from the photo, stands by the plaza and explains the three staircases. She greets you in Kapampangan by the time of day.

## What changed
* `src/game/art/entry.ts` (new): the star plaza (cobble ring, eight-point star of ground cover, dark pebble-wash triangles outlined in cobbles, the raised pad), the tapered six-sided granite pedestal, the flagpole with its yellow rope, the waving Philippine flag, the eight yellow and black posts with the rusty chain, the EVACUATION SITE 5 sign, the diamond-tiled walkway, benches along it, path lights, palms tied round with white rope (`tiedPalm`, with a fuller crown than `palm`), the covered walks along the fence and the back of the gate.
* `src/game/scenes/entry.ts` (new): the scene, id `entry`, "Side Gate Entryway". Holy Rosary Parish in the far layer, the Main Building's south end and parked cars on the left, the tiled pavilion and red-tipped shrubs on the right, the side steps, the middle steps and the lower ground off each end. Lit at night: the gate, the path lights, the lamps, the flag from below.
* `src/game/story/entry.ts` (new): the hotspots (three ways down, the flagpole, the way out through the gate), Ella and Ate Weng, and the walks up and down the walkway. While you walk behind the chained posts the scene draws them again in front of you (`trip` in the scene).
* `src/game/story/gate.ts`, `scenes/gate.ts`: tapping in goes to `entry`, and going out of the entryway brings you back out of the gate (spawn `entry`, was `plaza`).
* `scenes/plaza.ts`, `scenes/park.ts`, `scenes/lane.ts` and their story files: a FLAGPOLE / SIDE GATE sign and a way up the steps in each. In the park, the MAIN BLDG / ROTUNDA sign moved a little left to make room.
* `campus/plan.ts`, `campus/streets.ts`: the new places and the `entry` street (`looks` can now be `'S'`). The gate scene is tied to `sideGate`, not St. Barachiel Gate.
* `art/campusmap.ts`, `ui/map.ts`: the C map draws the side gate posts, the walkway, the plaza with its star and pole; "Side Gate Entryway" is on the list of places.
* `story/cast.ts`: `WENG`. `game.ts`: her voice.
* `assets/README.md`, `docs/campus-layout.md`: the entryway photos are listed as drawn.

`npm run check`, `npm run build` and `npm run check:links` pass. Checked by screenshot at 10 AM, 4:30 PM and 7:30 PM, and mid-way through walking in and out.

## Left unfinished / known problems
* **The left staircase's destination** (above).
* **Ate Weng's lines** need a native speaker, especially "Mayap a abak" and "Mayap a bengi".
* **Holy Rosary Parish** is drawn loosely from the backgrounds of the photos: a front with a round window, a dome and two bell towers with white spires. Not checked against a photo of the church itself.
* **The pavilion, the parked cars and the Main Building's south end** are from the edges of the photos, not close-ups.
* **"The other gates"** in `CONTEXT.md`'s Not Done Yet still lists "the pedestrian gate": that is this gate. Left as it is so Mikko's open pull request (#12), which edits the lines next to it, still merges cleanly. Fix it after #12 is in. For the same reason the "Last updated" line and the area count in `CONTEXT.md` were not changed.
* You cannot walk the walkway itself; going down it is a cutscene into the gate scene.
