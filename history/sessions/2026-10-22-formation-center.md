# Formation Center

**Who:** Mikko, with Claude Code.

## What was asked

"Next is the Formation Center, there is also a sidewalk on the right side so give space"
(right side of APS), from FORMATION CENTER MIDDLE.JPG, its close-up, LEFT SIDE FORMATION
CENTER.JPG and screenshot 1179. Asked, Mikko said: the front faces the east road (by
the Covered Court); the sidewalk is on its north side, by the road's bend towards APS;
build the kiosks too; set the building back inside its plot.

## What was built

- `areas/formation.gd`, in world coordinates, the front at x 25 facing east:
  - The middle block: a 4.4 m ground floor whose open colonnade (raised 0.45 m, three
    steps, handrails) has white grilles over dark doors, a statue in the middle bay and
    the name in grey steel letters on the sign band; two floors of windows between slim
    fins and white bands; a roof terrace under a white fabric barrel-vault canopy on
    steel arches.
  - The stair tower north of it, to 16.2 m, with two green-glass strips behind white
    louvres; the north wing curving back from it, full height; the south wing curving
    back a storey lower, with small square panes high on its ground floor.
  - The drop-off: concrete way in off the road at the north end, grey stamped pavers along
    the steps and out round the island's south end. The island holds the big
    two-trunked tree, lime hedges and grey bollard lamps. There is a lamp post with a
    bell and a folding board.
  - The sidewalk on the lawn side of the road, round the bend north of the building and
    down to the way in, and from the way out south past the kiosks. The north wing
    stands 2.3 m clear of it. A kiosk and two trees stand on the north lawn, and an
    electric pole on the south sidewalk.
- The chapel corner's three flat sheds are now four gabled kiosks in a row along that
  sidewalk (`World._kiosk`), as in the left-side photo.
- The road's lawn-side kerb opens for the way in and the way out (`Roads.OPENINGS`).
- In front of the building the camera turns to face it from over the east road (turn 3,
  like MGN's) and cuts away everything east of x 44.8 (the Covered Court's plot, the
  gym). On the road it still faces the gym. `--view=formation`.
- The plot is marked built (`tools/export-godot-plan.mjs`), so its pad is gone.

## Checks

`--test`: all true, with `formation_built`, `formation_walkable`, `formation_sidewalk`
and `formation_view`. `npm run check`, `npm run build` pass. Captures from the front at
three angles, from the north sidewalk and of the kiosks.

A first run failed seven checks (the chapel, the boulevard): the camera's zone had no
west edge, so it turned the camera everywhere between z 40 and 73. It now starts at x 18.
The sign's node name drops the "." in "G.", so the check looks it up with a wildcard.

## Left unfinished

- The front is straight; in the photos it bows out a little.
- No ramps at the ends of the steps (the photos have them, with rails).
- The building is not walkable inside, and the back (by the chapel) is plain windows.
- The yellow thing and the loudspeaker on the roof are left out.
