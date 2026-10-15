# The IH Gym in Godot, merged on its plot

**Who:** Sean, with Claude Code.

## What was asked

- Carry on the Godot campus after APS: build the Immaculate Heart Gymnasium
  (the orange block on Sean's annotated satellite sketch), outside first, in
  2.5D with real depth like APS, at its real size, asking questions along the
  way so it matches the real building. Other buildings stay empty spaces.
- Then pull the team's latest work and avoid conflicts.

## What happened

The gym was first built on a branch (`ih-gym-godot`) with its own road and
plots, placed from the OSM outlines by x = u + 4.7, z = v + 63. Meanwhile
Mikko's PR #21 moved the whole Godot world onto the team's campus plan
(`campus_plan.gd`, x = u + 4.7, z = v + 58.8) with its own road loop and
reserved plots, and the rule that a building is merged on its plot as
`areas/<id>.gd`. Merging the branch as it was would have clashed in
`world.gd`, `aps.gd` and the docs and drawn a second road and second plots.
So the gym was moved onto `main` instead, on branch `ih-gym-on-plan`:

- `areas/gym.gd` is the gym, unchanged in shape, moved 4.2 m north onto the
  plan's gym plot (`SHIFT`). `gym` is now in `BUILT` in
  `tools/export-godot-plan.mjs` and `campus_plan.gd` was regenerated, so its
  reserved plot is gone.
- My `grounds.gd` road and plots were dropped: Mikko's road loop already runs
  past the canteen's tip and down the east side at x 40.5, the same line as
  the sketch, and his plots cover the rest. The old branch stays for reference.

## Decisions

- **Real size:** 41 x 69.5 m (OSM). Sean confirmed the heights (about 12 m to
  the top of the fascia, 16.6 m to the ridge, after he said a first guess of
  10/14 m was too short), the lettering on the left half of the front, both
  door positions, and 12 bays with one window grid each.
- **The back** follows Sean's new photo `back of the gym.jpg` (added to
  `assets/images/buildings/ih_gym immaculate heart/`). **Solar panels** across
  the roof, as on the satellite view; **props**: green tents, tyres, planters,
  mesh barriers, no cars yet (Sean's choices). The annex stays a reserved plot.
- **The east road opens** down to the gym (Mikko had left it closed until the
  gym came), with the concrete apron in front and the lane to the side
  entrance. The alley behind lies inside the annex plot, so it is not
  walkable yet; the back is built for when the annex comes.
- **Camera:** `gym_for` faces the front from the east road and apron,
  `gable_for` adds a quarter turn to face the north gable from the lane.
  Keys 7 (IH Gym) and 8 (Gym side); `--view=gym|gym-side`.
- **Fix in `areas/chapel.gd`:** the rule blocking the chapel's front steps had
  no east limit, so it blocked a 12 m band across the whole map east of the
  chapel (z 53 to 66), which cut the east road and the gym lane. It now stops
  2 m past the steps. Nothing else of Mikko's changed.

## What changed

- `areas/gym.gd` (new): front (piers, slatted band, window grids with open
  panes, the left entrance with fins, stone tiles, maroon band and box canopy,
  two porches, the right entrance with the seal and HOLY ANGEL UNIVERSITY
  GYM), deep eaves with HOLY ANGEL UNIVERSITY in standing letters, gables
  with the grey band, louvres and maroon band, the side entrance, the back,
  the ribbed roof with 1,536 solar panels, the raised walk and its props, the
  apron and lane, and `blocked()` / `floor_height()` / `on_apron()`.
- `world.gd`: `box()` takes a `tilt`, `room_glass()`, texture kinds
  `concrete`, `slate`, `solar`, `ribbed`; walkable ground, blocking, floors
  and bounds include the gym, the east road and the apron.
- `aps.gd`: gym and gable camera weights, framings 7 and 8, `--view`, 10 new
  checks (51 in total).
- `docs/godot-art-style.md`, `src/drafts/aps-godot/README.md`,
  `tools/capture-aps-godot.sh` (4 gym shots), `campus_plan.gd`,
  `tools/export-godot-plan.mjs`.

## Validation

- Headless `--test`: all 51 checks true, including the gym built with its
  plot gone, facing the road, its size, solidity, walk, steps and apron, the
  east road and lane open, and the gym front, close-up and side framings.
- Native captures of the gym front, close-up and side entrance, and the
  wide APS framing, checked against the photos.
- `npm run check` and `npm run build` pass.

## Left unfinished

- No interior; the doors do not open. Not joined to the browser game's story.
- The south gable is plain below its louvres (the annex will cover it). The
  alley behind opens when the annex is built.
- The gable's metal band follows a straight pitch; the photo shows it
  chamfered at the corners. The window grids are all the same size.
- Running the project from the command line on a fresh clone does not import
  its PNGs, so the student sprite is missing until the project has been
  opened in the editor once or run with `--import`.
