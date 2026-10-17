# The whole campus laid out from Sean's layout reference

**Who:** Sean, with Claude Code.

## What was asked

Fix the whole Godot campus's spacing, plots and labels for the buildings and areas not
built yet, from `assets/MAIN CAMPUS LAYOUT REFERENCE.jpg`: black = buildings, orange =
covered walks and student gates, pink = car gates, yellow = ground-level guides. Replace
the plots' orange (gold) borders with dashed white lines and the building's name on the
plot. Move other buildings if needed.

Sean's answers to the questions asked:
- Keep the built buildings (APS, chapel, gym, SJH, MGN, the boulevard) on their surveyed
  outlines; fit the plots to the picture.
- Plots for the black buildings, the orange walks and gates and the yellow ground areas
  (not the pink car gates).
- Remove plots outside the red campus line (Plaza de Corazon).
- Use the picture's names; blocks it leaves unlabelled keep their plan names.

## Decisions

- **The picture is fitted to what is built,** not to OSM: a similarity fit (0.335 m/px,
  turned −2.2°) on the angel fountain, the boulevard's mouth and the lawn's kerbs round
  the road loop, 3-4 m off at worst. A fit on building roofs was tried first: the photo is
  oblique (roofs lean south, more for tall buildings) and the hand-drawn roofs disagree
  with each other by up to 20 m (APS's east end), so roofs are not used as anchors.
- **OSM is off in the west, as plan.ts already said.** Against the boulevard, the picture
  puts SFJ's south end and STL's pavilion 14-21 m south of OSM. SFJ (the library) keeps
  its OSM shape, moved 7.1 m east and 20.7 m south onto the picture's outline. STL keeps
  its shape, moved 12.2 m south so its pavilion meets PGN's face line along the boulevard,
  as drawn.
- **St. Martha** is redrawn from the picture (an L, about 39 m wide); the old trace was a
  thin slanted block.
- **The Student Center** is new: the strip between the boulevard's south face (z 79.9) and
  the Main Building, 8.5 m deep (the picture), from the Main Building's west end to MGN.
  The Main Building's plot now starts at z 88.4.
- **The north block and the east side** stay on the outlines already traced off the
  aerial photo or from OSM; they agree with the picture within its error. St. Gabriel and
  St. Raphael become one plot, "St. Gabriel" (the picture's name for the courtyard
  building); St. Michael Hall moved 0.5 m west off GGN, which its old trace overlapped.
  GGN keeps the street spine the picture leaves unoutlined.
- **Renamed:** the food court is the Yellow Canteen, the Gym Annex is Aero Hall, SFJ is
  "Library - SFJ".
- **Ground areas and walks** from the picture: Covered Walk, Epiphany of Angels, Main
  Gate, Side Gate 1 and 2, the Side Gate Walkway, Rotonda 2 (the round plaza by SFJ), the
  Flag Circle (the small circle under the courtyard pin), and the Covered Walkway along the
  Main Building's south side, stopped at MGN.
- **Not plots:** the pink car gates (as asked); the yellow lines round the chapel lawn,
  along the boulevard and in front of SJH (that ground is built: the road loop, the
  boulevard, SJH's front row and walkway).
- **The browser game is untouched:** its `BUILDINGS` are unchanged; the Godot layout is a
  new `GODOT_PLOTS` in plan.ts that the exporter reads.
- **Plot look:** a flat pad, a dashed white outline, the short name painted white on the
  pad as big as fits, and a small floating tag with the full name. The big floating name
  was dropped once the painted one was there (both said the same).

## What changed

- `src/game/campus/plan.ts`: the layout section (`LAYOUT_FIT`, `onLayout`,
  `roundOnLayout`, `shift`, `clip`, `GodotPlot`, `GODOT_PLOTS`).
- `tools/export-godot-plan.mjs`: writes `GODOT_PLOTS` (29 plots, with a `kind`).
- `areas/plots.gd`: pads by kind, dashed outlines, painted names (`Ground <id>`).
- `aps.gd` checks: `plan_loaded` (29 plots, no Corazon or St. Raphael), `plots_layout`,
  `plots_named`, `plots_clear` (no overlaps, nothing on walkable ground). 106 checks.
- `docs/godot-art-style.md`, the aps-godot `README.md`.

## Validation

- Headless `--test`: all 106 checks true.
- `npm run check` and `npm run build` pass.
- Captures: the whole campus at 140 m, the west side from the fountain at 84 m, the
  boulevard facing south.

## Left unfinished

- The picture is a guide, not a survey: plots are within a few metres, more in the far
  north and west where nothing built is near to check against.
- `assets/MAIN CAMPUS LAYOUT REFERENCE.jpg` is on Sean's machine; plan.ts refers to it.
- PGN keeps its OSM outline, which ends about 15 m short of STL's pavilion where the
  picture draws them side by side.
