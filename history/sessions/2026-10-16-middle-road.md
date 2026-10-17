# The middle road between PGN and MGN

**Who:** Mikko, with Claude Code.

## What was asked

Build the middle road between PGN and MGN, from a marked-up aerial screenshot (orange
lines between PGN and MGN) and one photo taken on the west road looking west down the
road (kept local in `assets/PGN MGN MIDDLE ROAD/`, not committed: it shows people).

## Decisions

- **All the way to the flag circle.** The road runs from the loop's west road
  (x −62, z ≈ 63) straight west to the flagpole at the plan's `flagCircle`
  (−179.7, 65.2), which is the pole at the end of the photo. Only the pole on its island
  and a round apron are built, not the flag plaza.
- **The camera looks south across the road** (−180°) at the MGN side, sliding with the
  student. The chapel and MGN views yield to it. PGN's side above the ground (its
  walkway roof and pillars, the north strip's trees, palm and lampposts) **fades out
  and keeps its shadows**, like the gym's cutaway groups. A tight near-plane cut was
  tried first. It left a big empty band under the student, because it also cut the
  ground. Only a far cut at z 30 stays, which removes the APS wing and the corner garden.
- **PGN is the tall building in the photo** (on the right, so north). MGN's
  five-storey north block is on the left.
- Widths are fitted to the 24 m between PGN's plot (z 51.3) and MGN / the Main
  Building plot (z 75 / 77.8). Nothing was surveyed. The banners face the camera
  rather than along the road, so they read in the side view.

## What changed

- New `areas/middle_road.gd` covers both sides of the road:
  - **The road:** two concrete carriageways with slab joints, a hedged median with
    round topiary, and kerbs.
  - **Crossings:** yellow zebras and kerb noses at the mouth, and a second crossing
    at the Main Building's side (x −104..−107) through paved gaps.
  - **Walkways:** both covered walkways have brick-red pavers, a flat white roof on
    cream steel and terracotta pillars every 5 m, and lit panels underneath for
    the night.
  - **Planting strips:** hedges, shade trees, palms at the mouth, and lampposts with
    two banners each and a downlight at night.
  - **Signs and props:** the round 10 KPH sign on the median's nose, the SLOW DOWN /
    10 KPH board, concrete benches, the green, blue and yellow bins, and pots.
  - **The west end:** the concrete apron and the flag island with the pole and the
    Philippine flag.
  - **Code:** its `walkable`, `blocked`, `floor_height` and `view_for` functions,
    and the `MiddleRoadNorth` fade group.
- `roads.gd`: `OPENINGS` / `opened()`. The west road's building-side sidewalk and
  kerb stop across the mouth.
- `world.gd`: the middle road is hooked into walking, collision and floors, and the
  outer bounds now reach x −192.
- `aps.gd`: the `middle` camera weight (`2 × middle` in `_turns()`), `mgn_for()`,
  the far cut, and the PGN side's fade. Plot labels hide on the road.
  `--view=middle` was added, and F1 has "Middle road (PGN-MGN)" and "Flagpole end".
  New checks: `middle_road_walkable`, `middle_road_solid`, `middle_road_kerbs`,
  `west_road_opening`, `walk_down_middle_road`.
- `docs/godot-art-style.md` has the layout, the camera zone and the bounds.
  `README.md` has the files table and `--view` list.

## Validation

- Headless `--test`: all checks true.
- `npm run check` and `npm run build` pass.
- Captures checked: noon at 40 m, afternoon at 84 m, night, the flagpole end, and
  the mouth from the west road.

## Left unfinished

- PGN and the Main Building are still reserved plots, so the north side and the west
  end are empty ground.
- The second crossing's position at the Main Building is a guess.
- At night the light under the walkway roofs is faint at the default angle.
