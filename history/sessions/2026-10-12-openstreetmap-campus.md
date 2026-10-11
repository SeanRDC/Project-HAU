# 2026-10-12 - Real building outlines from OpenStreetMap

**Who:** Mclaren, working with Claude Code on their own PC.

## What was asked
> find some reference in google or in hau even in facebook groups the map is inaccurate i'll let do whatever u want in this pc

## What was found
* **OpenStreetMap has HAU mapped in detail**: the campus boundary (relation 16198709), 19 of the 21 numbered buildings with their real traced outlines, and every street and path around and through the campus.
* **Facebook groups and Reddit could not be read**: both need a login or block automated access. Google turned up nothing better than OSM: no official floor plans or measured site plans are public.
* **An OSM user note** says GGN is missing from OSM. OSM still shows the old Sta. Clara buildings on the block where GGN now stands.
* **Lined up against OSM, the aerial-photo plan** had the scale right (0.6% off, which confirms the Google Earth measurement) and most buildings within 5 m. But St. Raphael, St. Michael, MGN and the Gym Annex were 18 to 29 m off, the halls were drawn about 1.8 times too big, the annex a third of its size, and three junction points sat inside APS, the covered court and the gym.

## Decisions
* **OSM is now the source for buildings.** `tools/import-osm.mjs` (`npm run import:osm`) downloads the campus and writes `src/game/campus/osm.ts`, already in plan metres. Run it again whenever OSM improves. It retries and falls back to mirror servers, because the public servers are often busy.
* **Lining up:** a rigid fit (no scaling) over the 12 buildings that agreed within 10 m, plus a 2.64 degree turn of the whole plan (`GRID_TURN` in `plan.ts`) so building edges sit square on the grid. Turning everything together keeps the gates and junctions from the aerial photo consistent with the buildings, and every distance along a street is unchanged by it.
* **Scenes keep using blocks; the map uses outlines.** The street scenes refer to particular blocks of STL, PGN and APS by index, so single-block buildings take the box round their outline, and the L-shaped ones got parts read off their outlines by hand, in the same order as before.
* **Four junctions moved onto OSM paths**, plus a new `hallsCorner`. The back road now runs along the real street outside the halls instead of cutting diagonally across STL and PGN. The street connections are the same, so every scene still joins up.
* **GGN and the Formation Center stay on the aerial photo.** The Formation Center overlaps the chapel's real outline, so it is now marked as a guess.
* **St. Gabriel and St. Raphael:** OSM has their names the other way round from the 2022 campus map. The game keeps the campus map's order (which Sean confirmed). Check the signs on site.
* **The map draws the real outlines** pixel by pixel (roof, front wall with windows, shadow), plus the town streets, campus paths, the boundary with a maroon fence line and the neighbouring houses. It credits "© OpenStreetMap contributors", which OSM's licence (ODbL) asks for.

## What changed
* `tools/import-osm.mjs` (new), `npm run import:osm` in `package.json`.
* `src/game/campus/osm.ts` (new, generated): 19 outlines, 288 neighbouring buildings, 77 roads and paths, the boundary.
* `src/game/campus/plan.ts`: `GRID_TURN`, `outline` on each building, blocks from OSM, moved junctions, `hallsCorner`. Warehouse and food court are no longer guesses; the Formation Center now is.
* `src/game/campus/streets.ts` and `src/game/scenes/halls.ts`: the back road ends at `hallsCorner`.
* `src/game/art/campusmap.ts`: rewritten to paint outlines, roads, boundary and town.
* `src/game/ui/map.ts`: the OSM credit.
* `docs/campus-layout.md`: sources, the new building table, street lengths, what is still a guess.

## Tested
* `npm run check`, `npm run build` and `npm run check:links` pass (12 areas, every way out works).
* Full-width panoramas of all nine outdoor scenes before and after, compared by eye. The Epiphany and the plaza are unchanged. The others changed where the real buildings are: narrower halls with a gap before GGN, a 109 m APS, shorter lawn, St. Joseph Hall and gym lane streets. Nothing overlaps or goes missing.
* Map and minimap screenshots, and a teleport, in headless Chrome.

## Left unfinished
* GGN and the Formation Center need tracing on openstreetmap.org (anyone with a free account can), then `npm run import:osm`.
* The halls' names (see above), on site.
* The street scenes still draw generic facades; only their positions and widths changed.
