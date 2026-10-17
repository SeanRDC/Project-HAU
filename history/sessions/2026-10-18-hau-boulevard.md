# HAU Boulevard (the middle road) rebuilt from the photos

**Who:** Sean, with Claude Code.

## What was asked

Rebuild the plain middle road as a 1:1 HAU Boulevard from the photos in
`assets/images/buildings/hau boulevard/` and a labelled aerial (`HAU BOULEVARD.png`,
kept on Sean's machine): dark orange = the whole walk on each side, light orange = the
covered part, black = the crossings. Lay out the floors, beams, roofs, bushes and
lampposts, one car per lane, and move the map as needed. Then, in the same session:

- Move PGN's and the Main Building's plots and the built MGN so the boulevard sits
  centred between them at its real width (SJH too if needed; it was not), checked
  against `other references/Aerial shot of HAU enclosed in red line.png`.
- Swap the flagpole at the west end for the angel fountain, from
  `other references/SFJ AND FOUNTAIN SIDE VIEW.jpg`.
- Camera: zoom and glide in when the student walks under a covered walkway; on the
  open brick walks, face the side of the boulevard the student is on.
- Write into `CLAUDE.md` that commits go under the developer's own name with no
  Claude co-author line, one commit per feature or fix.

## Decisions

- **Width 30.6 m between the buildings' faces.** The photos (60 cm tiles, 30 cm
  octagon pavers, a car per lane) and both aerials agree on about 30–31 m; OSM left
  26.5 m. `plan.ts` now moves the OSM outlines across the grid (`SHIFT_V`): PGN 2.0 m
  north, the Main Building 2.1 m south, MGN 4.8 m south so its north face lines up
  with the Main Building's (the south walkway runs straight along both). Only the
  outlines move; the browser scenes' `blocks` stay. SJH did not need to move.
- **Bands** (same both sides of the median, centre z 64.6): planter 0.8, covered
  walkway 3.5, edging 0.3, shrub strip 1.8, open walk 3.0, hedge strip 1.5, lane 3.6,
  median 1.6. All read off the photos, none surveyed.
- **Covered walkways have two pillar rows**, as in every walkway photo (the old build
  had terracotta at the road side only). Pillars are five stacked blocks with a white
  steel post above; the roof is white beams, rafters and close slats under a pale
  sheet. Granite benches stand against the back row.
- **Crossings** at x −67.5, −106 (the courtyard gate, which the aerial confirmed),
  −130 and −145, read off the black marks with the PGN and Main Building widths as the
  scale. Each cuts through every strip and the median, joining the covered walkways.
- **The fountain is the plan's rotunda** (x −165.6, the statue the campus measurement
  was taken from), put on the boulevard's centre line. The plan's z for it (48.9) is
  off by the grid turn; its x matches both aerials. The flagpole and its island are
  gone.
- **Lampposts and banners face across the road**, not along it as in the photos, so
  they read in the camera's side views (the old build did the same).
- **Camera:** the side the student is on decides the facing (north half: PGN's side,
  turn 0; south half: the Main Building's side, −180°), gliding round through east
  across the road. The near side fades out (two groups now). The camera looks down at
  least 16° on the boulevard: at the usual 8° the 0.8 m hedge hid the whole paver walk
  and the student's legs. The hedge is 0.6 m for the same reason. Facing north, the
  near plane cuts everything south of the Main Building's face through its ground
  line (cut at mid-height, a sliver of MGN's base stayed).
- **Controls keep their side while a key is held.** Without it, holding S to cross the
  road reversed halfway when the camera turned round.
- **Under the roofs** the hallway cutaway is reused (`covered`): it closes in to 8.5 m,
  cuts at 0.85 m in front of the walkway's middle (inside the front pillars by the
  plane's lean, so no pillar stubs stay) and bands above the beams.

## What changed

- `CLAUDE.md`, `history/README.md`: the commit rules.
- `src/game/campus/plan.ts` (`SHIFT_V`, `moved()`), `campus_plan.gd` re-exported.
- `areas/mgn.gd`: plot edge and camera range 4.8 m south; `aps.gd` `MGN_SPOT` too.
- `world.gd`: `octagon` and `slab` textures.
- `areas/middle_road.gd`: rewritten (layout, fountain, `south_for`, `covered_for`,
  `covered_middle`, both fade groups). `roads.gd`: the opening matches the new lanes.
- `aps.gd`: `middle_north`, `covered`, `_control_turns`, `MIDDLE_PITCH`, the second
  fade group, the north-facing cut, `--view=middle-north|fountain`, F1 places (both
  sides, the covered walkway, the fountain). Checks: new layout spots,
  `walk_down_pgn_side`, `cross_the_boulevard`, `walk_into_covered_walkway`,
  `walk_out_of_covered_walkway` (103 checks).
- `docs/godot-art-style.md` and the aps-godot `README.md`.

## Validation

- Headless `--test`: all 103 checks true (and 99 at the layout-only commit).
- `npm run check` and `npm run build` pass, after `npm install` (`three` was missing
  from `node_modules`).
- Captures checked: both sides at 40 m and 22 m, both covered walkways, the mouth,
  a crossing (the view down the road), the fountain, wide 84 m, night.

## Left unfinished

- PGN and the Main Building are still reserved plots, so the views of both sides show
  their pads behind the walkways.
- The statue is a blocky stand-in for the angel group, made from the two photos.
- Wide framings facing north show an empty band at the bottom, where the cut removes
  MGN (as in the MGN view).
- The faded side's banners still cast solid shadows across the lanes in low sun.
- The photos are in Sean's reorganised `assets/images/buildings/` folders, not
  committed in this branch.
