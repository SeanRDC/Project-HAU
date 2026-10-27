# Sacred Heart, the lane behind APS, and the Covered Court's inside

**Who:** Sean, with Claude Code.

## What was asked

Move the Covered Court back to make room for the walkway behind it. From the new photos in
`assets/Sacred  Heart and APS/`: build the back of the APS building, fix the spaces, then
build the Sacred Heart Building up to its square with the statue in the middle, correcting
anything the photos show is wrong. From `assets/images/buildings/covered court beside IH/`:
build the Covered Court's proper inside.

## Decisions

- **The Covered Court moves 3 m further south** (z 22..59), for the covered walkway along
  Sacred Heart's south side (4.3 m between the building and the fence). Its plot in
  `plan.ts` is now drawn to the shed (x 52.6..99.4, the pad to 109.4): the photos show the
  shed running on east to the AERO LABORATORY gate, past OSM's outline.
- **Corrected from the photos:** the court is a tall gabled nave on grey steel portal frames
  with a low aisle each side (it was a single low white gable); its floor has the maroon
  basketball court across the west end and two red volleyball courts (it had one plain
  court); the canteen's back awning is maroon (it was pale).
- **The lane behind the canteen faces the side the student is on**, like the boulevard: APS's
  back from the west half, Sacred Heart's front from the east half, north up the lane in the
  middle (as in the photos). The controls keep their side while a key is held, so crossing
  doesn't reverse them.
- **The north bound moves to the gate across the lane** (z -13.6). APS's east block (on the
  plan's APS outline, north of the canteen wing) is built so the lane has its west side.
- **The gym's gable view only applies on the gym's side** (z > 38). It used to turn the
  camera east anywhere east of x 62, which caught Sacred Heart's square.
- Sacred Heart's east wing and its north block's back and the west block's inside are not
  in the photos: the east wing's face on the square is from the photos, the rest is a plain
  body.

## What changed

- `areas/court.gd`: rebuilt (frames, aisles, gables, courts, bleachers, parapet, railing,
  gate, chairs); the roof in `ROOF_GROUP`, faded under it; `view_for` faces east inside.
- `areas/sh.gd` (new): west block, north block, east wing, bridge, gate, walkway (roof in
  `WALK_ROOF`), square, fountain and statue, planting, lampposts.
- `areas/beside_aps.gd`: the lane on north (`LANE_NORTH`, `LANE_END`), APS's east block,
  `lane_for`, `lane_east_for`.
- `world.gd`: the canteen's back face (`_canteen_back_face`), the maroon awning, the
  `herringbone` texture, the north bound.
- `aps.gd`: the `court`, `lane_east` and `lane_west` views and their cuts, the square's cut,
  the roof fades; checks `court_inside`, `sh_built`, `sh_square`, `lane_beside_sh`; fast
  travel to the court, the lane, the square and the walkway.

## Left unfinished / known problems

- The photos in `assets/Sacred  Heart and APS/` are not committed (number plates, students).
- A thin red line shows in the lane's east-facing view near APS's east block; not traced.
- Sacred Heart's rooms, the lab behind the AERO gate, and what lies past the lane's gate are
  not built.
- The statue is simple shapes; a drawn sprite or a model would read better close up.
