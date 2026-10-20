# SJH ground floor

**Who:** Mikko, with Claude Code.

## What was asked

Build St. Joseph Hall's ground floor from the photos in `assets/images/buildings/SJH
BUILDING/ground floor/` (copied from Mikko's downloads): "it is car then elevated
floor", so the cars park at road level and the ground floor stands raised above them.

Mikko's answers: walkway, lobby and corridor walkable, rooms only as doors on the wall;
the corridor in RIGHT HALLWAY.JPG **is** the front walkway (one corridor); the bridge to
MGN as scenery only; the work branches from `camera-right-drag` (PR #32 not merged yet).

## Decisions

- **The walkway is raised to 0.9 m** (`WALK_Y`, was 0.15) on a cream plinth, six risers
  of 0.15 (counted off the elevator steps). A shrub bed runs along its face to
  `BED_Z` 1.9; the railing gaps moved to ±16.8 and ±33.6, midway between the piers,
  each with six steps down through the bed.
- **Square clad piers** every 8.4 m (two bays) behind the railing, bar tables with
  wooden chairs between them, the yellow, blue and green bins by a pier on the east
  side (on the west side they stood in the way from the side entrance), a wet-floor
  sign. The inner wall gets high wooden windows and a brown skirting.
- **Floor: a new `diamond` texture** (world.gd): cream 30 cm tiles on the diagonal in a
  grey diamond band 2.4 m across, maroon tiles at its points.
- **The elevator lobby** opens the centre tower's ground floor (the glass doors are
  gone): two grey tiled pillars, a cream ceiling with downlights, the ochre lift wall
  over a black marble dado, two steel lifts in marble frames, the plaque, the
  "FLOORS 1, 4, 6, 8" / "1, 5, 7, 8" signs, wide steps (0.33 treads) with handrails.
  It joins the walkway on both sides; the tower's mass starts above it.
- **The west end** (local +x): a passage through the terracotta block at floor height
  (the block is built in three parts round it, its west face rusticated two storeys
  up), six steps down its west face, a granite ramp up along the block's front to a
  railed landing at the walkway's end, a concrete yard at their foot, the louvres on
  the stair tower, and the lane south between the stair tower and MGN's garden and
  south wing, closed by a wall. Walkable.
- **The bridge** crosses the lane at MGN's first floor (7.0 m), local z −16.4..−14.0
  so it lands on MGN's south wing rather than in front of its garden. Not walkable.
- **Camera:** the SJH view now also covers the west end south of the road (z > 119.5,
  x −66..−50), else the MGN view took over in the yard. The walkway's cutaway covers
  the lobby and the passage.
- **Walking:** `Sjh.walkable` is the list of floors, steps, the ramp, the yard and the
  lane; `Sjh.blocked` takes out the railing, the pillars, the piers, the tables, the
  bins, the ramp's rails and the shrub bed (the old APS-front rule in
  `World.walkable_ground` covers that strip, so the bed has to block itself).
- Guesses, not in the photos: the passage's depth and height (2.1 × 2.6 m), the
  ramp's slope (1:10), the lane's far wall, the bridge's span and roof, where along the
  walkway the tables stand.

## What changed

- `areas/sjh.gd`: the constants, `_deck`, `_stair`, `_yard`, `walkway_for`, `view_for`,
  `in_front`, `walkable`, `blocked`, `floor_height`; `_walkway`, `_pier`, `_railing`,
  `_gap_stairs`, `_bed`, `_inner_wall`, `_furniture`, `_lobby`, `_west_end`,
  `_bridge`; the west terracotta block and the centre tower's ground floor; the
  planting moved off the steps.
- `world.gd`: the `diamond` texture.
- `aps.gd`: `walk_into_sjh_walkway` walks up the steps at 16.8; new check
  `sjh_ground_floor`; F1 "SJH lobby" and "SJH west entrance"; `--view=sjh-walkway`,
  `sjh-lobby`, `sjh-west`, `sjh-steps`.
- `docs/godot-art-style.md` (ground levels, the area table, the SJH zone),
  `README.md`.

## Checks

`tools\run-aps-godot.cmd --headless -- --test`: all true, `checks_pass` true.
`npm run check` and `npm run build` pass. Captures of the four new views checked.
