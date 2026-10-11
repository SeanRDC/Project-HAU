# 2026-10-12 - Minimap and map teleport

**Who:** Mclaren, working with Claude Code on their own PC.

## What was asked
Using the 2022 official campus map as a reference:

> can u add a map on the top right where u can see where u are [...] also the map can let u teleport on wherever u want until the whole campus is implemented. make also the art of the map relate or fit to the art style of the game pixel art

## Decisions
* **One painter for both maps.** `src/game/art/campusmap.ts` paints the campus from above as pixel art, straight from `campus/plan.ts`, at any zoom. The C map and the minimap are the same picture at two zoom levels, so moving a building in the plan moves it on both.
* **Looks like the official map, in our pixel style.** Roofs with a strip of front wall and windows, roof colours taken from the official map (red Bldg. 1, yellow food court, dark PGN, glass skylight on the Main Building), the round white chapel on its lawn, and the maroon number tags. A building whose position is still a guess gets a dotted maroon outline.
* **Teleport is a list, not a cursor.** W/S picks one of the 12 places you can walk to, E goes there through the normal scene fade, so intros and visit flags still fire. It lands on an existing spawn point, so nothing new can be broken by landing somewhere odd.
* **Teleport is temporary.** `TELEPORT` in `src/game/ui/map.ts` turns it off. Turn it off once every part of the campus is joined up on foot.
* **Teleport does not care about story flags.** You can jump inside before the bag check. That is fine for a stand-in; it goes away with `TELEPORT`.
* **The minimap hides** during cutscenes, dialogue and with the phone open, the same as the clock, and dims after dark.

## What changed
* `src/game/art/campusmap.ts` (new): the pixel-art campus painter.
* `src/game/ui/map.ts`: rewritten on the new painter. Destination list with "Malapit dito" (the three nearest numbered buildings), blinking pick ring, a you-are-here pin with an arrow the way you face, and the corner minimap.
* `src/game/game.ts`: builds the list of stops from each scene's title and spawn, handles W/S/E while the map is open, draws the minimap.

## Tested
* `npm run check`, `npm run build` and `npm run check:links` pass.
* Headless Chrome screenshots: the map open on the walkway, after a teleport to the gym, and the minimap on the walkway, at the gym and at night on the Epiphany. Teleport from the walkway six places down lands in the gym with the map closed and no errors.
* Not tested: a full play-through by hand.

## Left unfinished
* No mouse or touch: the map is keyboard only, like the rest of the game.
* The lobby and courtyard have no position of their own on the plan yet, so their pin sits in the middle of the Main Building.
