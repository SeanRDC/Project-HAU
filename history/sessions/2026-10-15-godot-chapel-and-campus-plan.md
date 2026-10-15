# Godot: the chapel, the real campus grid, and reserved plots

**Who:** Mikko, with Claude Code.

## What was asked

Build the Chapel of the Holy Guardian Angel in Godot from the CHAPEL references
(front, left, far left, right side, and a layout sketch on the aerial map), with
the trees and grass round it, and leave room for the buildings teammates are making
so everyone's work can be merged.

## Decisions (Mikko chose each one)

- **The Godot world is the team's campus plan.** `plan.ts` (metres from the chapel,
  OSM outlines) is moved, not turned: x = u + 4.7, z = v + 58.8, so the APS
  entrance stays at the origin. `tools/export-godot-plan.mjs` generates
  `campus_plan.gd` from it, so Godot and the plan cannot drift apart.
- **APS goes to its real size and place.** The classroom wing now runs to x −63
  (its real west end, beside PGN), so APS is about 109 m long. The canteen wing
  moved back 4.7 m so its tip lands on the plan's z 24.9 (its first metres sit in
  the tower's footprint). The patio props moved with it.
- **One road loop round the chapel lawn** (`roads.gd`): along APS, round the patio
  bend, past the canteen's tip, down by the Covered Court and Formation Center,
  along SJH, and up by PGN. It is built from straights and turns, and everything
  asks it `across()`.
- **The left garden** moved to the real corner where the road turns south past PGN.
  The picnic sheds and pergola moved to the strip between the canteen wing and the
  Covered Court, where the road now runs past the canteen's tip.
- **Chapel scope:** the chapel, its stamped-concrete plaza with the HAU seal and
  banners, the oval parking with a planted island, the asphalt lawn path from the
  APS road, a jogging path, and trees and palms. The Formation Center (behind the
  chapel, same roof) is a reserved plot.
- **Reserved plots:** every building not drawn yet is a pale lot with a gold border
  and its name over it, on its real outline. The student cannot walk into one.
- **The camera turns to face the chapel** across its plaza, like the canteen (key 6,
  or walk down the lawn path).

## What changed

- New: `tools/export-godot-plan.mjs` (`npm run export:godot-plan`),
  `campus_plan.gd` (generated), `roads.gd`, `areas/chapel.gd`, `areas/plots.gd`.
- `world.gd`: the plan grid, the full-length wing, a grass base under the whole
  campus, the road loop drawn as ribbons with kerbs, sidewalks and paint, the
  pavers material, `walkable_ground()`, new collision and floors, the corner
  garden, the strip yard, and grass placed with the loop's shrunk outline. The
  old city boxes behind APS are gone (the real buildings are plots now).
- `aps.gd`: camera zones (APS, canteen, chapel), the Chapel framing (key 6), the
  whole APS in the first framing (112 m), and checks for the plan, the road loop,
  the plots, the chapel, the plaza, the lawn path and walking to the chapel (38 checks).
- Photos: `assets/CHAPEL/04_front-view.jpg` to `07_layout-sketch.png`.
- `docs/godot-art-style.md`: the plan grid, roads, a "Campus plan and merging
  buildings" section, camera zones, the pavers material; `CLAUDE.md`, the Godot
  README and `tools/README.md`.

## Validation

- Headless `--test`: 38/38 pass.
- Captures checked: the chapel close (afternoon), the chapel wide (noon, night),
  the whole campus wide, and the corner garden. Fixed from them: a daylight-beige
  glow panel behind the glass, island trees blocking the steps, roof bands that
  read as steps, pale plots that looked like walls, and the old skyline boxes.

## Left unfinished / for the team

- The east and south roads are drawn but not walkable: their camera views need
  the Covered Court, the gym and SJH, which are still plots. When those are
  merged, each needs a camera zone (see the guide).
- The chapel's roof is flat-topped stepped plates, not the photos' gentle dome. The
  side walls' arched windows are simple recesses. There are no cars yet.
- The camera for the chapel's west road stands over the PGN and MGN plots. Once
  those buildings arrive, that view needs checking.
