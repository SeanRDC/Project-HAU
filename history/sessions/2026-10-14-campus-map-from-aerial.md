# 2026-10-14: The campus map redrawn from the aerial photo

**Who:** Sean, with Claude Code.

## What was asked
Fix the in-game campus map (the C key) so it looks like `assets/other references/Aerial shot of HAU enclosed in red line.png`, checking it side by side with that photo and `haucampusmap_2022.jpg`. Some buildings did not match.

## How it was checked
The plan's outlines were drawn over the aerial photo, and the painted map was turned and laid over the photo at half strength. On the chapel side of the campus the OpenStreetMap outlines sat on the roofs. On the west side they did not.

## What was wrong
* **Buildings 5 to 9** (warehouse, food court, St. Gabriel, St. Raphael, St. Michael): right shapes, about 14 m from where the photo shows them. St. Michael Hall was drawn over one side of the St. Gabriel courtyard building.
* **Buildings 1 and 2** (Red Building, St. Martha Hall): about 7 m off.
* **GGN (10)** was a plain box.
* **The Formation Center (16)** was a guessed box on top of the chapel. OSM's "chapel" outline is really the chapel and the Formation Center together.
* **The dark hipped roof beside the Covered Court** was drawn as a town building.
* Driveways out in the town were drawn like campus paths.

## Decisions (Sean's answers)
* **Keep the map's angle** (the chapel walkway runs left to right). It is not turned to sit like the photo.
* **Building 1 is the dark roof with solar panels** on the street corner, not the pink and white roof beside St. Martha Hall.
* **The dark hipped roof is part of Sacred Heart (18).**
* **Roofs take the aerial photo's colours**, not the 2022 campus map's.

One more, made while working: **only the map moved.** The street scenes are laid out from each building's `blocks`, and those were left alone so no scene shifts. The map and the Back Road scene now disagree by about 12 m on where the halls are.

## What changed
* `src/game/campus/plan.ts`: `TRACED`, outlines read off the aerial photo corner by corner for buildings 1, 2, 5 to 10, 15, 16 and the Sacred Heart wing. `Building` gained `wings` (extra roofs of the same building) and `label` (where its number goes on the map). Buildings 1 and 16 are no longer marked as guesses.
* `src/game/art/campusmap.ts`: roof colours picked off the photo; `PATCHES` paints what the photo shows on the roofs (solar panels on GGN, PGN and the gym, GGN's tiles and maroon fins, the dark roof over the Main Building's courtyard, PGN's concrete podium). OSM "neighbour" buildings that sit under a campus building are left out, and so are paths that never come on to the campus.
* `src/game/ui/map.ts`: the "dotted outline means a guess" note only shows when a building is still a guess.
* `docs/campus-layout.md` and `history/CONTEXT.md` updated.

`npm run build` and `npm run check:links` pass.

## Left unfinished / known problems
* **The street scenes still use the old positions.** To move them too, make each traced building's `blocks` follow its outline in `plan.ts`, then look at the Back Road, the Epiphany and the chapel lawn scenes: their layouts depend on those blocks.
* **The pink and white roof between buildings 1 and 2** is inside the red line but not identified. It is drawn as a town building.
* **Traced roofs lean.** The photo was not taken from straight overhead, so GGN's outline is its roof, a few metres from its foot.
* **Roof colours and patches are by eye** off the photo.
* **Which hall is St. Gabriel** is still open: the photo labels the whole courtyard building St. Gabriel; the game calls its two long sides St. Gabriel (7) and St. Raphael (8), as the 2022 campus map does.
