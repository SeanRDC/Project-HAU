# The SJH–MGN bridge

**Who:** Jorel, with Claude Code.

## What was asked

From a photo (looking up the lane between SJH's west end and MGN): add the covered
bridge that joins the two buildings at their third level.

## Decisions

- **Built in MGN's frame, from its south wing's service block** (`_bridge()` in
  `areas/mgn.gd`), across to SJH's west face. The far end is found from SJH's own
  `world()`/`local()`, so it follows if either plot moves.
- **Third level = MGN's third floor,** deck at `GROUND + STOREY` (7.0 m). SJH's third
  floor is at 7.5 m; the half-metre was left out, since nobody walks on it.
- **From the photo:** concrete deck, solid white parapets with a steel rail, four steel
  posts and a ribbed tin roof. The photo's lamp brackets on the parapet and SJH's
  covered landing above the bridge were left out.
- **Not walkable.** The game has no upper floors outside, so it is scenery only.

## Known problems

- On the plan the two buildings are only ~3 m apart and the bridge lands behind SJH's
  cream stair tower, so no game camera sees it; it is visible with the F2 free cam from
  the south end of the lane. In the photo the bridge leaves SJH beside that tower: the
  plots may be a little off there.

## Checks

`--test`: all true, `checks_pass` true. `npm run check` and `npm run build` pass.
