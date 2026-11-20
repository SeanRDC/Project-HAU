# The Main Building (DJDN) and the side gate, in Godot

**Asked by:** Sean, 2026-11-20. **Approved:** 2026-11-20 (in conversation).

## Intent

Build the Don Juan D. Nepomuceno Building (the Main Building) and the side gate 1:1 from the
photos in `assets/MAIN BUILDINGS DJDN/` and the older references, appended to the Godot
campus, perfect and precise. The courtyard is under construction (blue tarp) in the new
photos; it is built as it was before, from `INSIDE DJN BUILDING.jpg` and
`CLOSER VIEW INSIDE DJN.jpg`. Every feature is committed under Sean's name only, no AI
co-author, and pushed.

## Goals

- The front, 1:1 from the photos: a symmetric two-storey cream front, the portico in the
  middle (four white Ionic columns, HOLY ANGEL UNIVERSITY on the entablature, the seal in the
  pediment, three pedimented doors, five terrazzo steps), each wing with one single window and
  four pairs on both floors in white frames, a string course, a dentil cornice, the dark cross
  on the pavilion beside the portico, the balustraded roof terrace over the pavilion, low hip
  roofs behind the parapet.
- The grounds in front: the drive from the angel fountain's apron to the car gate, empty
  parking bays (grass-and-cobble pavers) along the wings, the garden strip with urn posts,
  palms and the low white fence, the forecourt and lamps at the portico, the zebra to the
  flag circle.
- Inside, walkable on the ground floor **and the upper galleries**: the double-height lobby
  (the bust of Juan D. Nepomuceno on its marble pedestal, the wood door leaves with iron
  lanterns, display boards, the stair and the iron-railed mezzanine round the void), the back
  arcade (yellow marbled columns) down into the courtyard; the courtyard (red tiles with grey
  bands and the circle before the stage, galleries on two levels along the north and south
  under white corrugated roofs, teal doors, breeze blocks, the stairs up, two trees, the
  vine-wrapped lattice masts, the LAUS DEO SEMPER 1933 / 1953 theatre front with its swags and
  three arches, the curved terrazzo stage steps), under the steel-and-glass roof with hanging
  vines. The ring upstairs: both galleries and the front block's upper corridor and lobby
  mezzanine.
- The side gate: the flag circle (raised, yellow kerbs, steps, eight-point star, granite
  pedestal and flagpole, chained yellow-and-black posts, palms tied with rope, swan-neck
  lamps), the diamond-tile walkway with stone benches, bollard lights and low black fences,
  the white gatehouse with its glass pyramid (LAUS DEO SEMPER 1933 inside, HOLY ANGEL
  UNIVERSITY and the seal outside), the colonnade along the fence (square cream pillars with
  dark inset panels, dark slatted ceiling, X-pattern floor, benches), the terracotta-roofed
  pavilions, the iron fence with rings on cream piers, the car gate with the small guardhouse
  and the bronze angel on its red pedestal.
- Camera views for each place, fast-travel spots, headless checks; style guide, README,
  CONTEXT and a session file updated.

## Non-goals

- **No cars anywhere** (Sean, 2026-11-20). The parking bays stay empty.
- Nothing past the fence: no street, sidewalk or barricades (gate only).
- The theatre behind the LAUS DEO SEMPER front and every room behind a door stay closed
  (dark glass, shut doors). Nothing is guessed behind them.
- Rotonda 2 and SFJ stay reserved plots. The Covered Walkway along the street stays a plot.
- No NPCs (not asked).

## Anti-goals

- A front that is not symmetric, or a portico that is not centred (the drone shot is
  symmetric).
- Showing the courtyard under construction (tarps, scaffolding).
- Imported models or photo textures (the style guide forbids them).

## Placement (cross-referenced: the layout picture and the photos)

The layout picture traces roofs on an oblique satellite view, so its ground-level things (the
fountains, the circles) are reliable to 3-4 m; the building's footprint is the surveyed OSM
outline. In the photos the flag circle is across the drive from the portico steps (the zebra),
about 10 m away; on the layout it is about 5 m too close. So:

- **The Main Building** stays on its plot, x -159.1..-89.6, z 88.4..127.4. Its west face is
  redrawn straight at x -156.2 from z 88.4 to 127.0, the portico (porch) projecting to -159.1
  in the middle (centre z 107.7), so the front is symmetric. The Student Center's back wall is
  its north face, already built.
- **The flag circle, the walkway, Side Gate 1 and Rotonda 2** move 5.4 m west on the plan
  (`plan.ts`), keeping their spacing to each other. The walk runs square to the fence.
- **The drive** runs north-south, x -171.5..-165, from the fountain's apron (z ~76) to the car
  gate on the fence line (z ~122). East of it: parking bays (-165..-160.2) along the wings and
  the garden strip (-160.2..-156.2); at the portico a paved forecourt to the steps' foot
  (-161.1).
- **The fence line** is the plan's Side Gate 1 strip's street edge, at 25.6° to x; the
  gatehouse sits on it where the walk from the circle meets it (about (-187.4, 111.9)).
- The outer bound moves west from x -192 to about -212.

All sizes are from the photos (column, door, step and window proportions, 0.33 m treads,
people for scale), not surveyed; the code says so where it matters.

## The building's plan (builder's calls, from the photos and the aerial)

- **Levels:** drive -0.19, walks and forecourt -0.04, the porch, lobby, galleries and front
  corridors 0.9 (five steps up), the courtyard tiles 0.45 (three steps down from the lobby's
  back arcade and from the ground galleries), the stage 1.35, the upper floor 5.3. Wings'
  cornice top about 10.2, parapet 10.9; the pavilion's balustrade about 11.6; the glass roof
  about 12.0 over the courtyard.
- **Front block** x -156.2..-146: the lobby in the pavilion (z 102.2..113.2, double height),
  closed rooms north and south of it, a corridor along its courtyard side (x -149..-146) on
  both floors; the lobby's mezzanine round its void (west, south), its stair along the north
  wall rising west.
- **Wings round the courtyard:** north z 88.4..97.4 (rooms, then the galleries 94.4..97.4),
  south z 118.0..127.0 (galleries 118.0..121.0, then rooms). The courtyard's open floor
  x -146..-103, z 97.4..118.0.
- **Stairs to the galleries:** in front of the north gallery near the lobby (rising east,
  its corrugated underside as in the photo), and in front of the south gallery near the
  theatre (rising east to the upper gallery, as in the pre-construction photo).
- **Theatre** x -103..-90.1: its front at x -103, the stage x -110..-103; the block behind
  closed, with the east face on the lawn by MGN plain (no photos).
- **The Student Center's courtyard gate** (x -107.1..-104.1) opens into a passage south
  through the north wing to the courtyard's north-east corner beside the stage.
- **The north face above the Student Center's roof**, the south face and the east face are
  not in the photos: the front's vocabulary (cream walls, white-framed pairs, the cornice)
  without the portico.

## How it is built (the project's way; the only sensible one)

- `areas/djdn.gd`: the building, its grounds, the inside, its storeys (`floors()` /
  `floor_at()` / `blocked(.., level)` like `gym_interior.gd`), its cutaway and fade groups.
- `areas/side_gate.gd`: the flag circle, the walkway, the gatehouse, the colonnade, the
  pavilions, the fence and the car gate. The fence-side part is built under its own pivot
  turned 25.6° (the `CanteenWing` pattern) with local/world helpers.
- Both use `world.gd`'s helpers and `material(kind, tint)` only; new texture kinds (if any)
  go through `TILE_METRES`, `PALETTE` and `_texture()` and into the style guide's table.
- `plan.ts` (moved plots, the redrawn front), `tools/export-godot-plan.mjs` (`djdn`,
  `flagCircle`, `gateWalk`, `sideGate1` built), `npm run export:godot-plan`.
- `world.gd`: walkable / blocked / floor height, the wider bound, the two `build()` calls.
- `aps.gd`: three views and their cuts, fades and lights, fast travel, checks.

**Approaches considered:** a separate scene for the inside (rejected: the campus is one
continuous world, and every other interior is walked into); folding it into
`student_center.gd` (rejected: one area file per plot is the project's rule).

## Camera

- **Front** (the drive, the forecourt, the garden walks, the parking): turned to face east at
  the front (one quarter turn, like the chapel's), sliding along it; the near plane cuts away
  everything west of the drive's west kerb, so the flag circle's palms never stand in front.
  It takes over from the boulevard's south view south of the brick apron.
- **Inside** (the lobby, the courtyard, the galleries, both storeys): faces east toward the
  stage; a cutaway whose near plane stands a few metres in front of the student (west of
  them), so the front wall, the masts and the upper floors between the camera and the student
  fall away; the glass roof is a fade group (faded while inside, its shadow kept, like the
  Student Center's roof); daylight fill lights on while inside; a wider inside zoom than the
  hallway's 8.5 m, so the courtyard reads.
- **Gate** (the flag circle, the walkway, the lawns and parking beside it, the gatehouse):
  turned to look square at the gatehouse (south-south-west, perpendicular to the fence), with
  a near cut a few metres in front of the student. Under the colonnade it is the covered-walk
  cutaway (near plane at its inner pillar row, its slatted ceiling as the ceiling).
- Every view's standing spot is checked not to be inside another building.

## Checks (headless)

`djdn_built`, `djdn_front_symmetric`, `djdn_grounds` (drive, parking, garden, steps), `djdn_view_faces_front`,
`walk_into_lobby`, `courtyard_walkable` (tiles, trees and masts block, the stage reachable),
`gallery_upstairs` (the stairs climb, the ring is walkable upstairs, no stepping off),
`courtyard_cutaway` (roof faded, near cut west of the student), `flag_circle`, `walk_to_gate`
(the walk reaches the gatehouse, the fence blocks), `colonnade_cutaway`, `gate_view_faces_gate`,
`no_cars_at_djdn`; `fast_travel` covers the new spots.

## Left to the builder

Exact moulding sizes, the tile and star patterns, lamp and bench counts, the trees' and
palms' exact spots, the corrugated roof slopes, the vine density, whether a new texture kind
is needed (a red courtyard tile, a granite) or a tint of an existing one does.

## Photos

The 25 phone photos show number plates and people: kept on Sean's computer, not committed (as
with the SJH and MGN photos). The four found-online references in that folder (`MAIN BUILDING
FRONT.jpg`, `INSIDE DJN BUILDING.jpg`, `CLOSER VIEW INSIDE DJN.jpg`, `FOUNTAIN IN FRONT OF
SFJ.png`) are committed there.
