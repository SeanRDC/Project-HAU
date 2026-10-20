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
  of 0.15 (counted off the elevator steps). A shrub bed ran along its face at first
  (replaced by the planter terrace, below); the railing gaps moved to ±16.8 and ±33.6,
  midway between the piers, each with six steps down to the walk.
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
  bins, the ramp's rails and the planter terrace (the old APS-front rule in
  `World.walkable_ground` covers that strip, so the terrace has to block itself).
- Guesses, not in the photos: the passage's depth and height (2.1 × 2.6 m), the
  ramp's slope (1:10), the lane's far wall, the bridge's span and roof, where along the
  walkway the tables stand.

- **After Mikko tried it:** the steps showed as one flat block (each tread was built
  from the top step out to the bottom one, so the tallest hid the rest); each tread's
  block now runs only from the floor's edge to its own front, nosing on that front.
  Mikko marked "a layer" along the front: it is a **raised planter terrace** (as in
  RIGHT SIDE.JPG), grass and shrubs at 0.45 m (`TERRACE_Y`) behind a low grey stone
  wall 2.6 m out (`TERRACE_Z`), the planting on it; the gap steps run down through it
  (0.38 m treads). The **lobby steps** now run the tower's full width, in front of both
  pillars, the handrails standing on them (x ±7), with a raised planter box and a palm
  past the west pillar (from MIDDLE ELEVATOR.JPG).

- **The long stair (Mikko's drawing and screenshot, second round):** the lobby stair is
  not one flight but two: 5 steps up from the sidewalk, a long flat landing (2 m), 4
  steps up to the floor, all risers 0.1 (9 × 0.1 = the 0.9 m floor), treads 0.33. The
  bottom flight and the landing run along the whole front on both sides (to the east
  end and the ramp's landing), the planter standing on the landing against the plinth
  (`PLANTER_Z` 1.6, the landing to `FLIGHT_Z` 2.6, the flight's foot 4.25). At the lobby
  the landing stands out 2 m in front of the upper steps, with its own flight to 5.97:
  the bottom flight could not all run that far out, as the front row of cars is only
  4.9 m from the building at its west end. The steps at the railing gaps are gone ("no
  stairs there"); the railing is unbroken. The side entrance's steps are 9 risers of
  0.1 now too. The handrails run on the lobby stair over the landing.

- **The brown sidewalk (third round, Mikko's marks on RIGHT SIDE.JPG and the walkway
  photo):** along the sides there are no steps. From the plinth out: the raised planter
  (to 1.6), the brown paver sidewalk at 0.5 m (to `WALK_EDGE` 3.6; it slopes to the
  ground over 6 m at the east end and at the ramp's landing, where you walk on and off
  it), a low stone wall (the red line), a grass strip with bamboo sloping to a white
  kerb (the blue line, `KERB_Z` 5.97) by the parked cars. The lobby stair now runs out
  to that kerb ("it extends near the car"), its landing joining the sidewalk. To make
  room SJH moved 2 m further from the road (`SETBACK` 12, Mikko's choice); the lane to
  MGN is 2 m shorter to stay clear of MGN's south wing (`LANE`, `LANE_BACK`). The
  sidewalk uses the `brick` texture tinted brown, standing in for the zigzag pavers.

- **Fourth round:** the grass strip is level with the brown sidewalk (0.5 m), not
  sloping; the low stone wall stands at the kerb and holds both up. At the lobby the
  bottom flight runs only between the handrails (`LOWER_HALF` 7, the rails moved to its
  edges at ±6.9); either side of it the brown pavers run on at the landing's height out
  to the kerb, and the landing itself is brown pavers too.

- **Merged `main`** (PRs #31-#34): #33 had already added a covered SJH–MGN bridge
  (`_bridge()` in `areas/mgn.gd`, which finds SJH's west face itself, so it still meets
  it after the 2 m move). Mikko kept that one; this branch's `_bridge()` in sjh.gd and
  its `BRIDGE` constants are gone. The lane under it is unchanged.

- **Fifth round (2026-10-21, Mikko's screenshot and two photos of the strip beside the
  centre tower, "left middle" and "right middle"):** the front is all green: grass at
  0.5 m from the plinth to the low wall at the kerb (the cream planter box is gone), with
  shrubs and bamboo, and the brown sidewalk (2 m) winds through it (`_walk_middle`:
  ±0.9 m, a curve every 14 m, straight out of the lobby's landing). Either side of the
  lobby's bottom flight is grass and shrubs, not pavers. The front row of cars parks
  with its tail against the kerb (`_front_row_z`, following SJH's slant).
- **The flicker** (Mikko saw shading flicker as the camera moved, in both cameras): the
  front's layers were flush (pavers on their base, the landing's pavers on its mass) and
  the flights were nested boxes whose sides and nosings coincided, so they z-fought. Now
  each layer stands a little above the one under it, each step is its own block, and
  the nosings stand just proud of the step (also the passage's steps). Written into the
  style guide ("No flush faces"). Not checked by eye in motion here (captures are still
  frames); Mikko to confirm.

## What changed

- `areas/sjh.gd`: the constants, `_deck`, `_stair`, `_yard`, `walkway_for`, `view_for`,
  `in_front`, `walkable`, `blocked`, `floor_height`; `_walkway`, `_pier`, `_railing`,
  `_gap_stairs`, `_terrace`, `_inner_wall`, `_furniture`, `_lobby`, `_west_end`,
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
