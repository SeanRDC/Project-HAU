# The Student Center in Godot

**Who:** Sean, with Claude Code.

## What was asked

Build the Student Center from the photos in `assets/images/buildings/student center/`
(16 photos: the arcade both ways, Cafe Juan's front and doorway, the entry ways from the
covered walk, the west end by the Main Building, and MGN for the far end).

Sean's answers to the questions asked:
- **Cafe Juan:** a facade only (windows, doorway, sign); no interior yet.
- **Ways in from the boulevard's covered walk:** gaps in the planter lined up with the
  boulevard's crossings (x −106, the courtyard gate's, and −130 and −145).
- **East end:** the arcade stops with the Main Building; a lawn with a tree fills the
  last 5 m of the plot to MGN.
- **West end:** the arcade's end (ATM, iron cafe tables, red benches) and a brick apron
  joining the fountain's round apron; the truss canopy and the Main Building's front
  garden wait for the Main Building.

## Decisions

- **What the Student Center is:** the open arcade along the Main Building's north face,
  on its plot (z 79.9..88.4, x −156.2..−89.6). The back wall is the Main Building's
  ground floor as seen from the arcade; the Main Building itself stays a reserved plot.
- **Order along the back wall,** west to east, from the photos and the browser game's
  lane (`walklanes.ts`): the ATM and a water dispenser, Cafe Juan's windows (−149.6..
  −119.9) and its doorway (−119.5..−115.1), the courtyard gate (−107.1..−104.1, where the
  courtyard crossing comes in), then offices behind grilled windows, lockers and
  stacked chairs. The tables run along the wall, leaving a 4 m walk by the planter.
- **Openings:** both planters open at the three crossings: the arcade's own (with its
  rail) and the boulevard's south planter in front of it, tiled through; the boulevard's
  benches in those bays are left out.
- **Floor one low step up** (0.12) from the boulevard's walkway tiles, with a granite
  edge at each opening, as in the "entry way from sidewalk 1" photo.
- **Camera:** the boulevard's south-facing view carries on into the arcade and over the
  brick apron (without it the chapel view, which takes anything that far south, turned
  the camera round). Under the roof it is the boulevard walkway's cutaway: the cut sits
  just inside the posts at chest height. The arcade is 7 m deep, so the first try showed
  a strip of roof top and only the bottom of the back wall; the roof is now a fade group
  (it keeps its shadow) and the top band closes at the back wall, so the whole wall
  shows up to the ceiling. Walking through an opening, the corridor's middle, cut,
  ceiling and band blend between the walkway and the arcade by their weights.
- **Daylight fill lights** under the roof while the student is in (the gym's inside
  lights' values): the arcade read dark brown under ambient light alone.
- **Floor texture `circles`:** rows of overlapping circles, three bands each. Five
  thin rings were tried first; under the low camera they turned into streaks.
- **Cafe Juan's glass** is a warm dark tint (the room behind it) that glows at night;
  light beige glass read as flat panels.

## What changed

- `areas/student_center.gd` (new): the arcade, its collision, floors and camera weights.
- `world.gd`: the `circles` texture; the Student Center in `walkable_ground()`,
  `blocked()`, `floor_height()` and `build()`.
- `areas/middle_road.gd`: the south planter opens at the Student Center's openings;
  `view_for` takes the Student Center's too.
- `tools/export-godot-plan.mjs`: `student` is built; `campus_plan.gd` re-exported.
- `aps.gd`: the `arcade` weight and its cutaway (`BAND_BACK`, the roof fade, the fill
  lights), `--view=student-center`, two F1 places, and the checks
  `student_center_walkable`, `student_center_solid`, `walk_into_student_center`,
  `walk_out_of_student_center`, `student_center_west_end`; `plots_layout` now expects the
  Student Center built.
- `docs/godot-art-style.md`, the aps-godot `README.md`.

## Validation

- Headless `--test`: all checks true.
- `npm run check` and `npm run build` pass.
- Captures: inside at morning, noon, afternoon and night; close on the ATM; the east
  end; outside from the boulevard's south walk at 22 m, 30 m and 70 m; the west end.

## Left unfinished

- Cafe Juan has no interior (as agreed); the glass is opaque, so the room behind is only
  a warm tint.
- No NPCs sit at the tables yet.
- The dark steel-truss canopy past the west end and the Main Building's front garden
  wait for the Main Building.
- The order and sizes along the back wall are read from the photos, not measured.
