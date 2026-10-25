# Canteen layout

**Who:** Mikko, with Claude Code.

## What was asked

"APS canteen layout", from a sketch (screenshot 1190): every box is a stall. Asked, Mikko
chose this plan: two islands of four stalls back to back, and a row of four along the end
wall by the tip, facing into the hall. The three named stalls keep their names and the
rest get plain signs. Then a photo of the chairs: blue fibreglass tables with benches on
black steel frames.

## What changed (world.gd, in the canteen's frame)

- `stalls()`: 12 stalls (`STALL_ISLANDS` at x 42.7 and 51.7; `STALL_ROW_X` 64.25, its
  stalls 1.8 m wide so four fit the hall's depth). Built by `_stall`, square and then
  turned to face its aisle: cream body, counter with a red top, glass guard, trays, the
  sign above, steel posts.
- YUM-YUMS and GRANNY JINGS are on the islands' patio-facing fronts, and BYFROST is the row's
  front stall. Ate Lorna (npcs.gd) moved with GRANNY JINGS to x 50.55.
- `CANTEEN_TABLES`: eight blue tables with two benches each on black frames
  (`_canteen_table`), between the islands and at both ends.
- `in_stall` blocks the stalls and tables; the front aisle and the steps stay open.
- The floor is grey tile, as in the photo. The old menu boards on the back wall are gone,
  and the doors moved between the islands.

## The open back

Mikko sent photos from inside the canteen. Its back (the wing's east side) is open, not
walled: through it the strip and the parking behind can be seen, towards SH. Asked, Mikko
said this is behind the canteen wing, and to build only the open back canteen (not the
parking or SH).
- The rear wall is gone. In its place: ledgestone-clad pillars on the back edge, a low grey wall
  with a steel rail, and two gaps (`BACK_GAPS`) with a step down to the strip outside.
  Outside is the scalloped awning on a steel frame, and round downlights under the slab.
- The islands moved clear of the stair tower's part (x 44.4 and 52.6), and the tables
  between them. Ate Lorna moved with GRANNY JINGS.
- The islands' back-facing stalls nearest the tower are HAU COOP (yellow sign, red ink,
  snacks piled on the counter) and RINA'S FOOD (maroon sign).
- Some tables are pink, as in the photos.

## Checks

`--test`: all true (`walk_into_canteen`, `stall_signs`, `canteen_view_faces_stalls`, `canteen_open_back`).
`npm run check` and `npm run build` pass. Captures of the canteen view.
