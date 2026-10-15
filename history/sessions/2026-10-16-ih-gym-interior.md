# Inside the IH Gym

**Who:** Sean, with Claude Code.

## What was asked

- Build the gym's interior, so that when the student walks into the gym it
  becomes the inside view, and the whole interior can be explored. Ask about
  any layout that is unclear; it will be refined afterwards.

## Decisions (Sean's answers)

- **The stage is at the south end** (the annex end). The north end has the side
  entrance, the three tall windows and the balcony (mezzanine) over it, as in
  the photo from the stage.
- **Going inside is a seamless cutaway** with a **camera glide**: same world,
  no loading. The roof and whatever stands in front fade away as the camera
  turns.
- **The bleacher rows are walkable**, on both long sides.
- **Every area is walkable:** the lobby and corridors, the equipment room, the
  stage and backstage, and the right entrance. **The right entrance is an open
  doorway like the left one, not a glass door**, so the exterior was changed.

## What was built

Read from the 16 interior photos in `assets/images/buildings/ih_gym immaculate heart/`:

- **Hall:** one court down the middle (grey-blue with terracotta three-point
  areas, yellow keys, the HAU seal in a yellow centre circle, white basketball
  and black volleyball lines, HOLY ANGEL UNIVERSITY along the west sideline),
  portable hoops, the white practice floor with yellow badminton lines in front
  of the stage, the angel trophy, chair stacks and speakers.
- **Stands:** steel bleacher rows upstairs on both sides over striped parapet
  walls (a new `stripes` material: the red, yellow, grey and beige mural), with
  rails, yellow aisle marks, practice hoops on the parapets, the booth and
  scoreboard on the east stand, and stairs down towards the stage from each stand.
- **Balcony** across the north end at the stands' height, with chairs, over the
  side entrance (now open, with five steps up to the hall floor).
- **West, downstairs:** the left doorway opens into a corridor with the
  equipment room on its left (blue racks of balls and boxes behind grilles) and
  lockers and the stair up to the west stand on its right, then the lobby with
  columns, grille gates onto the court, the red lift, folded table-tennis tables
  and bins. A corridor runs south past closed rooms (a PE office, a locker room,
  a store) to the right doorway's passage and the west backstage room.
- **East, downstairs:** a corridor behind the parapet with a stair up under the
  east stand's aisle, closed rooms along the back wall, and the east backstage
  (storage) room.
- **Stage:** the raised stage with WELCOME ANGELITES on its front, steps up at
  both front corners, the drum kit, speakers, the LED screen on its truss, and
  steps up from both backstage rooms through doors in the stage's side walls.
- **Roof structure:** a steel truss on every bay line, purlins, hundreds of
  hanging acoustic panels in red, yellow, beige and grey, high-bay lights, two
  big fans and line-array speakers by the stage. Windows over the stage and the
  balcony, louvres along the back wall, the big striped panels at both ends.
- **Lights:** 35 interior lights on at every hour, only while the student is in.

## How it works

- `areas/gym_interior.gd` (new) holds the layout, the build, the collision and
  the cutaway rules, all in the gym's local frame. `gym.gd` opens the doorways,
  puts the roof and the north wall in their own groups, and hands the inside to
  it.
- **Storeys:** `World.blocked()` / `floor_height()` (and the student's moves)
  now take the walker's current height, so the lobby (0.75) and the stand's
  deck (4.95) can overlap. A walker takes the highest floor it can step onto
  (0.5 m), never steps down more than 0.6 m (so no rails are needed in the
  collision) and is stopped by the sides of stairs and the stage.
- **Camera:** a new zone, `arena_for` (named `hall_for` until it met the APS hallway's own `hall`), looks south down the hall at the stage
  from 35° up. It rises across each doorway and takes over from the gable view
  in the side entrance, so walking in glides the camera round and down; from a
  wide framing the zoom glides to 40 and back on the way out. Key 0 (first 9; 9 went to SJH in the merge) jumps onto
  the court; `--view=gym-in` and `--level=` help captures.
- **Cutaway:** the roof, the north wall, the balcony, each stand (with the rooms
  under it) and each bay of the roof structure are groups that fade out when
  they would hide the student and keep casting their shadows, so the hall stays
  under its roof's shade. Cut walls keep a 1.2 m stub.

## Other changes

- `areas/plots.gd`: the plan's label point for the Gym Annex is inside the gym
  (the annex wraps round its south and east sides), so its marker floated over
  the stage. A label off its own plot now moves to the middle of the plot's
  largest triangle. Nothing else of the plots changed.
- The south gable's side louvres moved in beside the middle one, over the stage,
  where the stage photos show them.
- `World.clamp_position` reaches z 137, so the south end of the gym is reachable.

## Validation

- Headless `--test`: all 59 checks true, 10 of them new: the interior built,
  walking in through the left doorway (camera turned, roof cut away, lights
  on), the two storeys at one spot, the stair up to the stand and not falling
  off its edge, climbing the rows to the top, the cutaway rules, the stage steps,
  the way down into the backstage room, the side entrance, and the hall view.
- Native captures of the court, the whole hall, the lobby, the equipment room,
  the west stand, the stage, the east corridor, night, and walking in through
  the doorway (the glide), checked against the photos.
- `npm run check` and `npm run build` pass.

## Refinements from Sean's marked-up screenshot (same day)

Sean drew over a capture of the whole hall (`Downloads/fixes.png`, not in the repo):

- **The main court's red surface** now runs south to where the other court
  starts (x 121), past the end of the court lines.
- **The other court** (the white practice floor) lies landscape across the hall
  between the main court and the stage (x 121..128.5), its badminton lines turned
  to match, with net posts.
- **The stage front curves** out towards the court (2.4 m further back at the
  flanking walls than in the middle), built in thin slices; the banner follows
  the curve letter by letter. Its steps sit flush in the two corners, which are
  cut square (`STAGE_CORNER`), instead of standing out in front.
- **Removed:** the stairs down from each stand towards the stage and their
  landings, the stair under the east stand's aisle, the speakers and the trophy
  that were on the other court (the trophy and chairs moved to the main court's
  south-east corner).
- **The west stand's rows are one run** (no opening through them), and each
  stand's stair is now at its north end beside the balcony: the west one from
  the lobby up towards the outer wall behind a grille on the entry corridor (the
  equipment room shrank to make room and now opens on the lobby), the east one
  down to the east corridor beside the north-east room.
- **Camera:** on the stage, the stands or the balcony it closes in to a low
  side view (10°, 16 m) and glides back on stepping down (see "Gym side view" in
  `docs/godot-art-style.md`). The booth and scoreboard became their own group,
  cut away when they would stand in front of a student on the east stand.
- Checks: 62 now (the new ones: the east stair, the side view on the stands and
  on the stage); the stand and stage checks follow the new stairs.

## Second round: Sean's "new fixes" sketch and the photos (same day)

Sean marked up another capture (`Downloads/new fixes.png`, not in the repo) and
pointed at the photos "middle view", "on second floor viewing the stage",
"entering from the left entrance" and its lobby. His answers to my questions:
the west stair goes back to the photo's layout; the marks at the stands' south
ends are stairs down to exits, like the left entrance, with new open doorways in
the back wall for the east stand; the stage's stairs run along its side walls;
and the camera faces the student's own side.

- **Stairs and exits:** each stand has two stairs, each beside an exit as at the
  left entrance: from the doorway a corridor runs in, the stair climbs beside it
  behind a full-height grille (the accordion gate folded at its foot), away from
  the door up to the aisle by the court rail. West: the left entrance (equipment
  room on the left, the stair on the right, lockers in front, as in the photo)
  and the right entrance. East: two open doorways in the back wall (bays 1 and
  8, opposite the front's), with canopies and steps down to the alley (the alley
  itself is still the annex's reserved plot). The rows run unbroken between each
  stand's two stairs (x 84 to 121.6), flat deck beyond. The balcony's stairs and
  the stair under the east aisle are gone.
- **Stage:** long straight stairs up each side wall onto it (8 risers, 0.4 m
  goings), as in the photo; line-array speakers hung high over its front.
- **Curved walls:** the big striped end walls beside the stage now curve from
  the outer wall (x 129) round to the stage's corner (x 131), in slices, the
  panels following (`end_wall()`); the stands' decks end at the curve.
- **Court lines:** fill the red surface as drawn, baselines at x 80.5 and 120.5
  (centre court 100.5), real-size keys and three-point arcs, the seal and the
  sideline lettering moved with them, the hoops at the new baselines.
- **Lobby** from its photo: deep beams between the column lines under the deck,
  a wooden platform, the red lift, folded tables against the fence, the bins and
  a wooden cabinet by the wide gate.
- **Camera:** the 35° hall view is gone. Inside it is a low 2.5D view (12°) in
  three zones from Sean's L / F / R marks: west half faces the west stand, east
  half the east stand, the stage area the stage (unchanged, as Sean liked it);
  it glides round through the stage's view when crossing the middle. On a stand
  it closes in facing that stand, like the "middle view" photo. Cut away by side:
  the front wall and the props on its walk (facing east), the back wall (facing
  west), the near stand, its walls and stairs, the near half of the roof
  structure. Under a stand only its walls go, so the lobby keeps its ceiling.
  Plot labels hide while inside (the annex's hung in the side views). Key 0 is
  now centre court (30 m).
- `arena_for` is 1 anywhere inside and only blends in front of a doorway, so the
  camera no longer half-turns near the front wall.
- Checks: 77 (new: the stands facing their sides, the back doorways, the east
  stair from the aisle to the back passage).

## Left to refine (with Sean)

- Room layouts not shown in the photos are guesses: which rooms are along the
  front and back, the backstage rooms, and where the stairs from the stands come
  down. The closed rooms can be opened later.
- The stage front is straight (the photos show it curved), the windows are
  square-topped (the middle one is arched), and the scoreboard faces the court
  from the east wall only.
- From inside, any roof structure that shows also covers part of the hall
  beyond it; it shows only past the student and is left out at wide framings.
- The exterior's back wall has no windows, but louvres were added inside it
  under the eave, where the photos show daylight behind the east stand.
