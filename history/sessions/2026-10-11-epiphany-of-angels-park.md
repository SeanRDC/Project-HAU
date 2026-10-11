# 2026-10-11 - Epiphany of Angels park, campus loop, save game

**Who:** Sean, working with Claude Code (model: Claude Opus 5.5) on his own PC. Same day as the first session, later sitting.

## What was asked

> now continue development based on the resources you got online

(Interrupted for a LinkedIn caption about the project, then:)

> continue the development

## Decisions
* **Next area is the Epiphany of Angels park, not the School of Computing.** The reference photos already downloaded cover the park, the covered walk and the Pinatubo memorial well. There were no usable photos of the School of Computing building, and guessing at it seemed worse than building what could be seen.
* **The campus is now a loop.** Courtyard gate leads to the park; the far end of the park leads round to the driveway in front of the DJN Building. Four areas you can walk through in a circle.
* **The pavement seal moved to the park.** In the photos it sits in the road beside the angel statues, not at the DJN front door where the first session put it.
* **One checklist, grown from five to eight items**, instead of a second list. The ending with Bea now needs all eight.
* **Autosave instead of save slots.** Progress saves to the browser on its own. The title screen offers Enter to continue or N for a new game.

## What changed
* New area `park` (`src/game/scenes/park.ts`, art in `src/game/art/park.ts`): covered walk with orange pillars and bamboo, the Memorare stone and old stump, the Holy Guardian Angel and seven archangels on pedestals with scroll benches and crook lamps, the seal in the road, a coned-off path to the School of Computing.
* New people (`src/game/story/park.ts`): Kath (asks you to quiz her on HAU history, three questions), Mang Bong (groundskeeper who remembers the ashfall), Enzo (photographer whose lines change with the time of day).
* Lobby: the bust's pedestal inscription now matches the real one ("Ad Majorem Dei Gloriam").
* Areas can set a story flag the first time you enter (`visitFlag` on the area definition).
* Save game in `src/game/game.ts`: flags, clock, area and position go to `localStorage` under `project-hau-save-v1`, on every flag change, every scene change, and every 10 seconds. URL dev shortcuts never read or write the save.

## Tested
Headless browser with real key presses: courtyard gate to park, the quiz with Kath, park to driveway and back, phone with eight tasks, save then reload then continue. No console errors. Type check and production build pass.

## Left unfinished
* Memorare text is a Tagalog paraphrase of the marker plus its last two lines in English. Check it against the real stone.
* The seven archangels are not individually named in the game because the plaques could not be read from the photos. If someone can photograph them, each statue could get its own name and line.
* Park buildings in the background are generic. Only the glass pyramid skylight comes from a photo.
* Still no touch controls, and the School of Computing is still closed.
