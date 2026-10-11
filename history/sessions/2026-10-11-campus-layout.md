# 2026-10-11 - Whole campus layout, anchored on the chapel

**Who:** Sean, working with Claude Code (model: Claude Opus 5.5) on his own PC. Evening sitting, after the Main Gate branch was merged.

**About the commits:** all of this was done in this one session on Sean's PC. Sean asked for the commits to be spread across the team, so they carry his, Mclaren's and Mikko's names. If you see your name on a commit you did not write, that is why.

## What was asked

Sean dropped the 2022 campus map into `assets/`, then a drone reel, an aerial photo with the campus outlined, a diagram of the gate area, and eye-level photos of the Epiphany of Angels, the rotunda statue and the walkway.

> with the current resources we have as of the moment, try to anchor everything on the chapel, so when we update you with more images of the campus, you can build the campus layout properly so it will be a 1 to 1 copy in the game

Then, after confirming which building is which and measuring 140.36 m from the rotunda statue to the chapel in Google Earth:

> its implementing the whole layout of the holy angel university, other than that, for the meantime do not add interiors to the other buildings because you dont have the idea to that yet. [...] wait for our go and the assets you need in images before creating the interiors.

## Decisions
* **The chapel is (0, 0).** Every position is in metres from the centre of the Chapel of the Holy Guardian Angel, read off the aerial photo. The data is in one file, `src/game/campus/plan.ts`, and the scenes are placed from it. Moving a building is a one-line change there.
* **The plan uses the campus grid, not north.** The buildings line up with the chapel walkway, which is turned about 31 degrees from north. `u` is along the walkway, `v` across it.
* **9 game pixels per metre.** Picked because the DJN Building (620 px for about 68 m) and the angel pedestals already fit it.
* **One scene per street, and each street shows one side.** A side view cannot show both sides of a road, so each street looks at the side with more on it. All 21 numbered buildings end up visible somewhere. A building behind the camera gets a kerb sign and a "look back" hotspot.
* **The Epiphany of Angels is a road, not a park, and the main gate opens onto it.** The photos and the gate diagram show the Sto. Rosario Gate at its street end, four angels down each side, and the fountain plaza at the campus end. So the opening now goes gate, Epiphany, Main Building, instead of gate straight to the driveway.
* **Two statues at the front of the Main Building.** The rotunda fountain now has the Holy Guardian Angel and two children standing in it, as in the photo. The bronze guardian angel beside the building was taken out at first, on the reading that the two were the same statue. Sean asked for it back, so it is restored where it was, with its original lines and the `saw_angel` task.
* **No interiors.** Every door says the building's name, its number on the campus map, the offices inside, and that it is not open yet.
* **No people on the new streets yet.** They come with the interiors.
* **The plaza and gate scenes were not rescaled.** Their cutscenes and dialogue depend on their spacing. They are tied to the plan by their two ends, which is enough for the map.
* **The reference images were not committed.** They are Google Earth imagery, someone's Google Maps photo sphere and the university's map, and this repository is public. Sean has them in `assets/`; ask him.

## What changed
* `src/game/campus/plan.ts` and `streets.ts` (new): the plan and the maths that places a building in a scene.
* `src/game/art/buildings.ts` (new): one facade painter with five styles, plus the chapel, gym, covered court, food court and warehouse.
* `src/game/art/street.ts` (new): walkway lamps, flagpoles with waving flags, the rotunda statue, gate pillars, brick fence and paving, crossings, cars.
* `src/game/scenes/kit.ts` (new): backdrop layers, road, lamps and falling leaves shared by the street scenes.
* Seven new scenes: `walkway`, `lane`, `halls`, `aps`, `lawn`, `sjh`, `gym`. Hotspots in `src/game/story/streets.ts`, shared door and signpost helpers in `story/campus.ts`.
* `scenes/park.ts` rebuilt to the plan (70 m instead of about 195). `story/park.ts`: NPC positions now come from the scene; the courtyard door and School of Computing sign are gone from here.
* `scenes/plaza.ts`: statue group in the rotunda fountain, the bronze angel still beside the building, three signposted ways out of the rotunda, the right-hand gate is now St. Barachiel Gate and no longer lets you out.
* Links: main gate to Epiphany, Epiphany to plaza, courtyard gate to the walkway.
* `src/game/ui/map.ts` (new): campus map on the **C** key with a "you are here" dot, drawn from the plan.
* `tools/check-links.mjs` (new) and `npm run check:links`: presses E on every hotspot in a headless Chrome and checks every way out. `src/main.ts` exposes the game as `window.hau` in the dev server for it.
* `docs/campus-layout.md` (new): the full write-up, with the table of buildings and what is still a guess.
* No flags renamed and no checklist text changed, so old saves still load. A save made inside the old park puts you at the far end of the new one.

## Tested
* `npm run check` and `npm run build` pass.
* `npm run check:links`: 68 hotspots in 12 areas. Every way out names a real area and spawn point, every street has a way back, a held D and Shift moves the player, C opens the map.
* Headless Chrome screenshots of every new scene by day, and several at dusk and night, checked by eye against the reference photos.
* Not tested: a full play-through from the title screen by hand. The gate cutscenes were not changed, only where the gate leads.

## Left unfinished
* Everything under "What is still a guess" in `docs/campus-layout.md`. In short: building sizes and looks are approximate, buildings 1, 5 and 6 are placed by guess, door positions are made up.
* Interiors and people for the seven new streets.
* The guard house at St. Barachiel Gate still says "GATE 1".
* New Taglish lines (door text, the statue, the chapel, the food court, the covered court) need proofreading like the rest.
* A second Google Earth measurement in another direction would confirm the scale. St. Joseph Hall end to end is a good one; the plan currently says about 101 m.
