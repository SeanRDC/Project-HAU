# Spacing between SJH and MGN

**Who:** Mikko, with Claude Code.

## What was asked

"Fix the spacing between SJH and MGN, make sure it is not too compact", from four photos:
MGN FRONT.JPG, sjh front right to back connector.JPG (and its closeup), sjh back right
side.JPG.

## Decisions

- **Measured first.** On the plan, MGN's south wing stood 5.7 m forward of the long block,
  ~1.1 m from SJH's west wall (the cream stair tower), right under the bridge, and MGN's
  garden kerb was 3 m from that wall. The bridge session had already noted "the plots may
  be a little off there". In the photos a one-lane concrete drive about 5 m wide runs south
  between SJH's west steps and MGN's kerbed planting, and the bridge spans about 8-9 m.
- **MGN's south wing comes back flush with the long block** (`SOUTH_FRONT` 5.7 -> 0): ~9 m
  wall to wall under the bridge, which lengthens to match (it measures SJH's face). It
  could not keep its depth by growing back: MGN's back already touches the covered walkway's
  plot. The garden now runs on in front of the wing (`GARDEN_FROM`), with three more shrubs.
- **SJH moves 2 m east** (`EAST_SHIFT`; it was already off its outline by `SETBACK`), so the
  drive beside the garden is ~4.7 m, not 3. Moving MGN west instead would have pushed into
  the covered walkway's plot and opened a gap at the west road. SJH's east end is now 6 m
  from the annex's reserved plot. `ENTRANCE_GAP` and MGN's `CUT_X` (world x) moved with it;
  the parking rows and the Mary island stay where they were.
- **The lane is the drive** from the stair tower to the garden kerb (`LANE` 4.75 m,
  `LANE_BACK` to the same kerb line), with the wall at its far end as wide as the lane.

- **Then MGN's front walk (Mikko: "continue").** MGN FRONT.JPG: a brown zigzag-paver walk
  runs from the drive's kerb in at a slant through the garden to the corridor, between
  low white kerbs. Built in `_walk()` (`WALK_FROM`, `WALK_TO`, 1.6 m wide), laid just
  over the grass at 0.32 m (the garden is one grass box, so it cannot sit below it as in
  the photo), walkable from the drive (`in_walk`; the garden stays solid either side). A
  palm, a shrub and any rocks on its line moved off it. New check `mgn_front_walk`. The
  captures did not catch it (that stretch is between camera views); it is checked, not
  seen.

## What changed

- `areas/sjh.gd`: `EAST_SHIFT`, `LANE`, `LANE_BACK`, `ENTRANCE_GAP`, the end wall.
- `areas/mgn.gd`: `SOUTH_FRONT`, `GARDEN_FROM`, `CUT_X`, the garden and its shrubs.
- `docs/godot-art-style.md` (the SJH and MGN rows).

## Checks

`--test`: all true. `npm run check`, `npm run build` pass. Captures from the lane's north
end (before and after): before, SJH's stair tower and MGN's south wing nearly touched and
the bridge was hidden; after, the gap is open and the bridge shows across it.

## Left unfinished

- The walk's pavers are the `brick` texture tinted brown, not the photo's zigzag pattern, and it ends at the corridor's face (the ground floor is not walkable).
- Near the lane the camera is between views (SJH's cutaway and the overview), so the spot is hard to see in play.
- The road behind SJH (sjh back right side.JPG) is not built; the lane still ends at a wall.
