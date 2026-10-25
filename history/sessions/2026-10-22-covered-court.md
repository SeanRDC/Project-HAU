# Covered Court

**Who:** Mikko, with Claude Code.

## What was asked

"Add the covered court beside the gym", from screenshots 1186-1188 of the photos.

## What was built

- `areas/court.gd`, on the plan's plot between the canteen wing and the gym:
  - The open shed: a low gable roof of pale corrugated sheet (ridge along x) on white
    steel columns every 5 m with trusses, on a concrete floor raised 0.3 m.
  - The west gable, over the east road, holds a big clerestory of window grids.
  - Low white railings along the sides, and a concrete ramp with steel rails up from the
    gym's lane.
  - Inside: a court with lines and two hoops, and steel bleachers along the north side.
  - In front of the west gable: a green picnic shed, a potted tree, the lamp post with
    the bell and the RESERVED CMO GUEST-PRIEST board.
  - The plot's east part past the shed is a concrete pad.
- Camera: facing south at the gym from the lane, it stood over the court. The court's
  roof and columns north of the lane are now cut away.
- The plot is marked built. The `plots_reserved` check now tests the Library's plot.

## Checks

`--test`: all true, with `court_built` and `court_cut_from_lane`. `npm run check` and `npm run build` pass.
Captures from the apron, in the lane, and inside the court.

## Left unfinished

- The inside is simple: no stage, scoreboard or lights.
- The court floor is plain concrete, not a painted court surface.
