# 2026-11-21: The Epiphany of Angels, its gates, and the angel fountain from Blender

**Who:** Sean, with Claude Code. Sean answered three questions at the start and was away for
the rest; the work ran on its own (an hourly check-in resumed it after usage limits).

## What was asked

- Build the Epiphany of Angels with its gates 1:1 and in detail in the Godot campus, from the
  photos (`assets/epiphany of angels/`, 20261019_153043 to 153100) and every reference image of
  it. Decide alone; mistakes are corrected once Sean has seen it in the game.
- Later the same day: build the angel fountain's statue at the boulevard's head in Blender from
  its close-ups and replace the boxy statue in the game with it, as a trial for that one statue
  (the other statues may follow). Shut the PC down when everything is done.
- Commit every feature on its own, under Sean's name, no AI co-author line.

## Decisions

- **Gates: all three** (Sean): the Sto. Rosario Gate at the street end, the black swing gate at
  the east end beside the covered walk, the Guardian Angel car gate on Holy Angel Avenue, with
  the fence. **Scope: the Epiphany only** (Sean): Rotonda 2, SFJ and St. Martha stay reserved
  plots. **No cars** (Sean). Nothing past the fence.
- **Square to the grid**, not slanted like the layout picture's boxes: the picture is turned
  2.2 degrees from Godot's axes and SFJ's surveyed outline is square. The road's axis is z 86,
  from the street fence (x -261) to a north-south road by Rotonda 2 (x -213.5..-207). The plan's
  `epiphany`, `mainGate` and `coveredWalk` plots now have these outlines and are built.
- **What the photos say about the layout:** the "Main Gate" strip on the layout is a covered walk
  along the avenue fence, the twin of the side gate's colonnade (cream pillars with dark panels,
  a slatted ceiling, stone benches against the fence; 153052); the student comes in from the side
  gate down four yellow-nosed steps off the colonnade's west pavilion (153043), across a hatched
  crossing on the road to the swing gate (153045). The north "covered walk" (the aerial diagram's
  covered shed) has a terracotta-roofed pavilion at its east end (153055, 153057).
- **Eight angels, four a side.** Their plaques are unreadable, so they are not named; each holds
  an archangel's usual attribute (the guardian angel with a child, a sword and shield, a lily, a
  staff and fish, a flame and book, praying hands, a crown, roses).
- **The camera faces north** along the Epiphany, with everything nearer than a fixed cut line
  removed (past the south curb walk on the road, at the fence on the path and the Main Gate walk),
  and **turns west to face the Sto. Rosario Gate** near the street end, like the gate's photo.
- **The statue in Blender:** metaballs, not low-poly boxes, so it comes out smooth and carved;
  the game gives it its own sandstone stucco material. Only that one statue for now.

## What changed

- `areas/epiphany.gd` (new): everything above, its walkable ground, floors, solids, camera
  weights (`view_for`, `west_for`, `cut_z`) and the two roof fade groups.
- `world.gd`: wired in; the west bound is now the street fence; the grey octagon paver texture
  (`octagon_grey`).
- `aps.gd`: the Epiphany's north view and cut, the gate view (`epi_west`), the roofs' fades, the
  chapel's and MGN's views kept off it; fast travel to "Epiphany of Angels", "Sto. Rosario Gate",
  "Main Gate covered walk", "Epiphany north walk", "Guardian Angel gate"; checks
  `epiphany_built`, `epiphany_view`, `epiphany_gate_view`, `epiphany_from_side_gate`,
  `epiphany_north_walk`.
- `plan.ts`, `tools/export-godot-plan.mjs`, `campus_plan.gd`: the three plots built.
- `tools/blender/angel_fountain.py` (new), `models/angel_fountain.glb`,
  `assets/drafts/3d/angel_fountain.blend`; `areas/middle_road.gd` loads it on the plinth in place
  of the primitive group (the plinth, rams' heads, basin and jets are unchanged).
- `assets/epiphany of angels/2026-10-19 walk/`: the nine photos at 1600 px (the originals stay
  local, `.gitignore`).
- `docs/godot-art-style.md`, `src/drafts/aps-godot/README.md`, `assets/drafts/3d/README.md`.

## Left unfinished / to check with Sean

- Distances are read off photos and the layout picture, not surveyed: the Epiphany's length
  (47.5 m), the spacing of the angels, the widths of the walks and lawns.
- The angels are a sketch of the real carvings (robes, wings, attributes); the plaques are blank.
- Where the Main Gate covered walk lets students in from the avenue is not in the photos; the
  fence runs unbroken along it. The Guardian Angel gate is drawn closed, without a sign.
- The glass pyramid in the old "epiphany end going to gate" panorama is not built (the newer
  photos show a terracotta pavilion there).
- The road by Rotonda 2 stops at z 74.5, short of SFJ's plot; Rotonda 2's circle stays reserved
  and its big plot label shows from the road.
- The Blender statue is a trial: Sean to judge it in the game before the other statues follow.

## Later: Rotonda 2 and a finer statue

- Sean: "build the rotonda 2, the fountain there and the ground decoration". From the drone shot
  ("FOUNTAIN IN FRONT OF SFJ.png"), the pool photo ("SFJ BUILDING AND FOUNTAIN.jpg") and 153048:
  `areas/rotonda.gd` on the plan's plot, built now (`rotonda2` in BUILT; the `plots_moved` check
  expects it built). The flag circle got its fourth flight, west down to the drive (the "right"
  stair of the old entryway scene). Check `rotonda_built`, `rotonda_view`; fast travel
  "Rotonda 2 fountain".
- Sean asked whether the Blender statue could be more detailed: a second pass on
  `angel_fountain.py` (finer metaball resolution, carved faces, locks of hair, feathers as
  overlapping scales, robe grooves and girdle, fingers, collars, the girl's fringe and puffed
  sleeves, the boy's parting and belt, the book's leaves, ledges on the rock; about 116,000
  triangles). Metaballs only go so far: faces and hands are still soft. Sculpting by hand in
  Blender, or a photogrammetry scan of the real statue, would be the next step up.
- Not checked: the star's exact proportions and the rings' radius are read off one drone frame.
