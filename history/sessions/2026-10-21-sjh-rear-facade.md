# SJH's back and the lane behind it

**Who:** Jorel, with Claude Code.

## What was asked

Build St. Joseph Hall's rear facade from nine photos taken along it from the gym's end,
where the scene had only the slab's blank back face, and expand the map if the lane
behind it needs it.

## Decisions

- **The gym's end is the east end** (local x −47.9): the gym's plot is x 57..101, SJH's
  −59..36.5. In the photos the building is always on the right, so they look west, and the
  white building closing the lane (photos 4, 8, 10) is MGN's south wing.
- **Order from the photos' content.** Photo 1 (the back entrance) and photo 9 were taken at
  the same spot (the green-posted shed, NO PARKING sign, red tactile strip), and photos 2–8
  step west from the east corner. So the back entrance stands after the HAU VEHICLE ONLY
  carport, not at the gym's end. East to west: the palm strip by the rusticated corner, the
  basement ramp under its rusty pergola, motorcycles, the yellow shed with the Isuzu and a
  CR-V, a lean-to of sedans, HAU VEHICLE ONLY (two vans, two pickups, a closed east end), the
  louvred utility block, the back entrance's steps, the patched shed with the red vehicle,
  the low carport. Spacing along the wall is estimated from the photos.
- **The facade:** per floor a white slab standing out 0.9 m as a sunshade over a cream wall
  (`#f6ecd0`) between white piers, brown-framed `framed_window()`s (`#5b4334`), silver
  window-AC hoods on about three in four, four bays of brown louvres; the plinth with
  basement louvres; rusticated end blocks with a vent; downpipes; a dark eave. All over
  the body's back face (not removed).
- **The lane is walkable.** It runs from the east end to the west end between the back and
  the perimeter wall (z ≈ 157..161), reached round SJH's east end from the south road's
  corner (x 37..44.4): Aero Hall's reserved plot fills the strip south of the gym's apron,
  and photo 2 shows the road bending in there. The outer bound goes from z 140 to 162.
  Past the lane is blocked: before, only the z 140 bound kept the student out of the
  ground south of SJH.
- **The camera** keeps its plain north view there (`Sjh.rear_for`; the SJH front, gym,
  chapel and MGN zones yield). The near plane cuts past the far kerb, capped in front of
  the slab's nearest top corner; without the cap, wide or turned frames sliced the top of
  the facade's near end.
- **Left out:** the trees along the perimeter wall (the camera always looks across them and
  a flat cut cannot hold them back at the frame's edges); the ramp only dips 0.15 m (a
  `shortcut:` comment), with no basement behind its dark mouth; no interiors.

## What changed

- `areas/sjh.gd`: `_rear()`, `_rear_ground()`, `_van()`, `_rear_planting()`; `rear_for()`,
  `on_lane()`, `carport_posts()`; `on_parking()` takes in the lane (floor −0.04, no grass);
  `blocked()` has the props, vehicles, posts and everything past the lane.
- `world.gd`: `clamp_position` z 140 → 162.
- `aps.gd`: the gym, chapel and MGN zones yield to `rear_for`; the back lane's cut;
  `--view=sjh-rear`; fast travel "SJH back lane"; checks `sjh_rear_lane` and
  `sjh_rear_view_faces_back`.
- Photos in `assets/SJH BUILDING/rear/01–09.jpg`, in walking order.
- `docs/godot-art-style.md` (SJH file row, the back lane zone, the bounds), the Godot README.

## Checks

Headless `--test`: all true, `checks_pass` true. `npm run check` and `npm run build` pass.
Captures looked at: the lane at 22, 40, 64 and 112 m, at angles 0.12 and −0.25, at morning,
noon, afternoon and night, and the lane round the east end.

## Also: the crash on quit

Every run on macOS ended in `libc++abi: ... recursive_mutex lock failed` (exit 134),
headless too; an empty project quit cleanly. `audio.gd` rendered the murmur on a
`WorkerThreadPool` task it never waited on, and Godot needs every pool task waited on:
at quit it freed the task after the script engine was gone. The task's id is kept now and
waited on in `_exit_tree()`. Both `--test` and a windowed capture exit 0. Left: two leak
lines at exit (a particle shader never freed), harmless.
