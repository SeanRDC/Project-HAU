# APS in Godot: 2.5D trees, grass, patio chairs, street lights and the yard

**Who:** Mikko, with Claude Code.

## What was asked

Polish the Godot APS: add the patio chairs, the lamp post, the green benches on the
right (a screenshot crop of green steel picnic sheds under trees) and grass. Mid-way:
"the tree must also be 2.5D".

## Decisions

- **Trees are volumes, not cards.** Each crown is 15 crossed leaf clusters in an
  ellipsoid, lit by `leaves.gdshader` as one round volume (per-pixel normals
  round the crown's centre). Cards that turn edge-on to the view fade out. The old
  four flat cards turned into thin slivers once the camera turned 90° at the canteen.
- **Grass is one MultiMesh** of crossed blade cards with a shared material. It is
  seeded, so every machine gets the same tufts, and it casts no shadows.
- **Bench chairs** are the patio armchairs from the photos (black steel, orange
  slats), four round each round table. **Lamp post** is the tall grey LED street light
  from "APS RIGHT 3", two of them at the patio's kerb, kept out of the steps.
- **Green benches on the right**: past the canteen's end, as in the "FAREST RIGHT
  SIDE" photos. A vine-covered timber pergola, then two green picnic sheds under
  shade trees on a dirt yard. The yard is walkable.
- **More sheds on the lawn** across the road from the entrance (Mikko's screenshot):
  three of them (`LAWN_SHEDS`) on worn dirt, kept west of x 0 so none stands in front
  of the canteen camera. They are scenery; the lawn stays unwalkable.
- **The left side** ("APS LEFT SIDE" photo): the sidewalk now stops at x -19, and a
  dirt garden runs from there to x -40 with two bamboo clumps, two shade trees,
  red-tipped shrubs, and a green-netted enclosure behind a yellow mesh fence. It is
  planted, not walkable; the student can now walk the road in front of it to x -30.
  Bamboo leaves are spread along each culm, because tip puffs read as balls on sticks.

## What changed

- `shaders/leaves.gdshader`: `center`, `roundness`, per-pixel round normals,
  fading of edge-on cards.
- `world.gd`: `_cards()`, new `_tree()`, `_grass_material()`, `_grasses()`,
  `_umbrella()` and `_chair()`, `_street_light()`, `_yard()` and `_shed()`, a
  `dirt` material, `STREET_LIGHTS` / `PERGOLA_POSTS` / `SHEDS`, and
  `blocked()` / `clamp_position()` extended to the yard.
- `aps.gd`: checks for the yard, its props and the grass (29 in total).
- `docs/godot-art-style.md`: a new "Trees and grass (2.5D foliage)" section, the
  dirt material, new helpers, colours and the street light.

## Validation

- Headless `--test`: 30/30 pass (the left garden blocks, the road in front does not).
- Captures checked: the canteen in the afternoon and at night, a patio close-up,
  the yard at noon, a tree close-up and the wide view.

## Left unfinished

- The large gabled building behind the yard (in the "FAREST RIGHT SIDE" photos)
  is not modelled; the area beyond the yard is still plain asphalt and lawn.
- The vine pergola reads as greenery on posts rather than as a clear trellis at wide framings.
- The photos show moss on the patio bricks; it is only suggested by the small tufts.
