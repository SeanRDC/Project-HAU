# Godot Art Style and Workflow

From now on, campus work moves to **Godot 4**, in the style set by the APS scene in
[`src/drafts/aps-godot/`](../src/drafts/aps-godot/README.md). This document is the
single source of truth for that style: shadows, lighting, shaders, materials,
the pixel pipeline, the camera and the way we build. If you (or your AI assistant)
add anything to the Godot project, follow this file so every machine stays in sync.

The browser game (`npm run dev`) still runs and is not deleted. New 2.5D/3D work
does not go into the browser or the Three.js trial (`aps-3d.html`); those are
frozen references.

**Contents:** [Quick start](#quick-start) · [Style pillars](#style-pillars) · [World conventions](#world-conventions) · [Campus plan and merging buildings](#campus-plan-and-merging-buildings) · [Pixel pipeline](#pixel-pipeline) · [Materials and textures](#materials-and-textures) · [Geometry](#geometry) · [Trees and grass (2.5D foliage)](#trees-and-grass-25d-foliage) · [Lighting](#lighting) · [Shadows](#shadows) · [Environment](#environment) · [Shaders](#shaders) · [Characters](#characters) · [Camera](#camera) · [Collision and floors](#collision-and-floors) · [Adding a new building or area](#adding-a-new-building-or-area) · [Before you open a pull request](#before-you-open-a-pull-request) · [Do not](#do-not) · [Prompt for your AI assistant](#prompt-for-your-ai-assistant)

---

## Quick start

| What | How |
| --- | --- |
| Engine | **Godot 4.7.2 stable**, Forward+ renderer. Put the portable editor at `builds/godot-tools/4.7.2/Godot_v4.7.2-stable_win64.exe` (ignored by git), set `GODOT` to your executable, or have `godot` in PATH. On macOS set `GODOT` to the app's binary (`Godot.app/Contents/MacOS/Godot`) and run the same commands with it, e.g. `"$GODOT" --path src/drafts/aps-godot --headless -- --test`; macOS has no `timeout`, so run captures one at a time. Download: <https://godotengine.org/download/> |
| Play | `tools\run-aps-godot.cmd` (Windows), or open `src/drafts/aps-godot/project.godot` in Godot and press F5 |
| Editor | `tools\run-aps-godot.cmd -e` |
| Checks | `tools\run-aps-godot.cmd --headless -- --test` prints JSON; every check must be `true` and `checks_pass` must be `true` |
| Review shots | `sh tools/capture-aps-godot.sh` writes shots to the ignored `builds/aps-godot-review/port/`. One shot: `-- --hour=16.5 --hide-help --zoom=28 --capture=<absolute .png path>` |
| Preview flags | `--hour=8\|12\|16.5\|21`, `--girl`, `--x=`, `--z=`, `--level=` (start on an upper storey inside the gym, e.g. `4.95` the stands' aisle, `1.95` the stage), `--zoom=`, `--angle=`, `--view=canteen\|gym\|gym-side\|gym-in\|sjh\|mgn`, `--pixel=auto\|crisp\|pixel`, `--walk=<seconds>`, `--hide-help`, `--capture=<path>` (all after `--`). The chapel plaza: `--x=-34 --z=55 --zoom=32` |
| Campus plan | `npm run export:godot-plan` regenerates `campus_plan.gd` from `src/game/campus/plan.ts` (run it whenever the plan or `osm.ts` changes) |

Files:

| File | Owns |
| --- | --- |
| `aps.gd` | The pixel buffer, camera, time of day, environment, UI, input, the headless checks and captures |
| `dev_travel.gd` | **Dev tool:** the F1 fast-travel panel. Places live in `travel_places()` in `aps.gd`; when you merge a building, add its spots there (the `fast_travel` check makes sure each is walkable). `--travel` opens it for captures |
| `dev_free_cam.gd` | **Dev tool:** the F2 free cam. The camera leaves the student and flies anywhere (mouse look, WASD, Space/Ctrl up and down, Shift fast, wheel speed); it turns perspective while flying, the camera zones and cutaways stop, and F2 or Esc hands it back. Not a game view: don't tune the style from it (the `free_cam` check) |
| `world.gd` | APS, the canteen and patio, the street, the helpers, materials, procedural textures, and the collision rules and floor heights that tie every area together |
| `campus_plan.gd` | **Generated, do not edit.** Every building's real outline and the named places from the team's plan, in Godot metres |
| `roads.gd` | The campus loop road (centre line as straights and turns) and `across()`, the distance across the road at any point |
| `areas/chapel.gd` | The chapel, its plaza, oval parking, banners, lawn paths, trees and palms |
| `areas/plots.gd` | Reserved plots for everything on the layout not built yet: dashed white outlines, painted names |
| `areas/gym.gd` | The Immaculate Heart Gymnasium from outside, under its own pivot, with its walk, steps, props, apron and lane; its doorways are open |
| `areas/gym_interior.gd` | Inside the gym: the court, stands, balcony, lobby, rooms, stage and roof structure, its storeys and collision, and which groups the camera cuts away |
| `areas/hallway.gd` | The APS ground-floor hallway, the bust and the campus map, and its cutaway zone |
| `areas/sjh.gd` | St. Joseph Hall under its own pivot (facing north), set back 10 m (`SETBACK`) from its OSM outline to match the team's map, its covered walkway, the Mary statue garden at its west end, and two rows of parked cars (by the chapel, and in front of SJH) |
| `areas/mgn.gd` | The Mamerto G. Nepomuceno Building from outside, under its own pivot (facing east onto the west road): the open-corridor long block, the box-window wing over the entrance and open stair, the north block, the south wing with its service block and roof tank, the raised garden in front; walkable up to the turnstile |
| `student.gd` | The player sprite, its animation, foot contact shadow and movement |
| `shaders/edges.gdshader` | Pixel outlines and crease highlights over the 3D world |
| `shaders/leaves.gdshader` | Foliage cards |
| `shaders/sky.gdshader` | Screen-graded sky with night stars |
| `shaders/display.gdshader` | Final colour grade and vignette |

Everything is built from code. There are no imported 3D models and no photo
textures. `main.tscn` is one node with `aps.gd`; keep it that way so diffs stay
readable and merges stay easy.

---

## Style pillars

The look is **Until Then-inspired**: crisp pixel art in a real 3D space.

1. **Real campus, 1:1.** Every building is drawn from the reference photos in
   `assets/images/buildings/` (APS: `PANERGO AND GIL APS BUILDING/`, the corner,
   patio and canteen in its `corner, patio and canteen/` subfolder) and placed
   from the aerial map. Proportions come from photos; write "approximate, from
   the photos" in the code when they are not measured.
2. **Pixels are whole blocks at every zoom.** The world renders into a small
   buffer and is enlarged with nearest-neighbour sampling. No smoothing, no
   sub-pixel crawl. Wide shots stay sharp; close shots match the sprites' own
   pixel density.
3. **Warm sun, cool shade.** Light is cream to amber; shade is a readable
   blue-grey, never black. Night is deep blue with warm windows and lamps.
4. **Directional shadows from one sun.** Buildings, trees, umbrellas and the
   student all cast real, crisp shadows in the same direction. Morning and
   afternoon cast opposite ways; noon is short.
5. **Dimension through form, not texture.** Slabs, sills, piers, rails and
   window frames are real geometry with thickness. Textures stay quiet (low
   grain) so the form and the outlines carry the detail.
6. **Restrained atmosphere.** Light SSAO, soft glow only on emissive things,
   gentle fog in the distance, a mild vignette. Nothing glossy, nothing bloomy
   in daylight.
7. **Matte materials.** Lambert diffuse, specular off (glass is the only
   exception). Nothing should look wet or plastic, **except while it rains**
   (see Weather and atmosphere): then the hard ground goes dark and glossy and
   dries again when the rain stops.

---

## World conventions

- **Units:** metres. **Y up.** **+Z points to the road (towards the camera).**
- **The grid is the team's campus plan** (`src/game/campus/plan.ts`, metres from
  the chapel), moved but not turned: **x = u + 4.7, z = v + 58.8**. x runs along
  APS (west to east), z from APS towards the chapel and SJH. The origin stays at
  the APS main entrance, at ground level.
- **APS on the grid:** the classroom wing x −63..18 (its real west end, beside
  PGN), the tall balcony block x 18..31, the stair tower x 31.3..36.5, the
  canteen wing x 32.7..43.3 and z −4.2..24.95 (its tip on the plan's z 24.9).
- **The chapel** is at (4.7, 58.8); its round front faces west at x −25.7.
- **Ground levels:** lawn −0.2 (the base under everything), road −0.19, kerb
  top 0.0, sidewalk and plaza −0.04, lawn path −0.17, canopy tile 0.03, patio
  −0.05, canteen hall floor 0.45, chapel floor 0.9, gym hall floor 0.75 (the
  stands' deck and the balcony 4.95, bleacher rows +0.4 each, the stage 1.95).
- **Storeys:** APS wing 3.05 m, tall block 3.0 m, canteen 3.05 m over a
  ~5.3 m open hall.
- **Plan:** APS is an L. The canteen wing stands forward from the stair tower,
  its stalls facing **west** (−X) onto the herringbone-brick patio in the corner.
- **Roads** (`roads.gd`): one loop round the chapel lawn, drawn as straights and
  quarter turns. It runs along the APS front at z 4..11, round the patio bend
  (centre (8.5, 20.5), radius 13), past the canteen's tip, down the east road
  (x 37..44, by the Covered Court and the Formation Center), along the south road
  (z 106.5..113.5, by SJH), and back up the west road (x −62..−55, by PGN). The
  lawn is always on the road's right and the buildings on its left. Everything
  asks `across()`: under 4 is the building side, 4..11 the carriageway, over 11
  the lawn. Change the road only by editing `PIECES`; the surface, kerbs,
  sidewalks and paint follow. A side road opens the loop's building-side sidewalk
  and kerb with a rect in `OPENINGS` (`Roads.opened()`).
- **HAU Boulevard, the middle road** (`areas/middle_road.gd`), from the boulevard
  photos and Sean's labelled aerial: a divided road from the west road's mouth
  (x −62) straight west to the angel fountain (−165.6, 64.6), between PGN's face
  (z 49.3) and the Main Building's and MGN's faces (z 79.9), 30.6 m apart (plan.ts
  moves those three outlines to make room, `SHIFT_V`). It is the same on both sides
  of the median (centre line z 64.6). North to south: planter 49.3..50.1, PGN's
  covered walkway 50.1..53.6, concrete edging, the shrub strip 53.9..55.7, the open
  walk 55.7..58.7, the hedge strip 58.7..60.2, the north lane 60.2..63.8 (one car;
  traffic runs west), the grass median 63.8..65.4, the south lane 65.4..69 (east),
  the hedge strip 69..70.5, the open walk 70.5..73.5, the shrub strip 73.5..75.3,
  edging, the south covered walkway 75.6..79.1, planter 79.1..79.9.
  - **Covered walkways:** cream 60 cm tiles (`slab`, floor 0) under a white roof:
    two rows of terracotta block pillars 3.0 m apart (front at z 53.35 / 75.85,
    back at 50.35 / 78.85), a bay of 3.2 m from x −64.9 (28 pairs), each pillar
    five stacked blocks to 2.47 m with a white post to the beams at 2.95, white
    rafters, close slats across, a pale ribbed sheet with a rib per bay, granite
    benches against the back row in every other bay, a mosaic every seven bays,
    a downlight per bay. The roof runs x −64.4..−151.8.
  - **Open walks:** red octagon pavers (`octagon`, −0.04) with the bronze
    lampposts every 12.8 m, 0.75 m in from the hedge: fluted base, two scrolled
    arms with lanterns, a banner under them. In the photos the arms and banners
    face along the road; here they face across it, so they read in the side views.
  - **Strips:** red-tipped shrubs and shade trees (every three bays) in the shrub
    strips, the bins at their edges; a clipped hedge 0.6 m high in the hedge
    strips (kept low so the camera sees the walk behind it) with tall white
    poles between the lampposts; the median has concrete urns with bougainvillea,
    round topiary and more poles, yellow noses at x −69.6 and −155.8 with the
    round SLOW DOWN 10 KPH signs.
  - **Crossings** (yellow zebras, from the black marks on the aerial) at x −69..−66
    (the mouth), −107.5..−104.5 (the courtyard gate), −131.5..−128.5 and
    −146.5..−143.5, through paved gaps in every strip and the median, so each joins
    the two covered walkways. East of x −69 the open walks widen into paved plazas.
  - **The west end:** the walks end at x −157.5 with a kerb; the lanes run onto a
    round apron (radius 11.5) round the angel fountain: a red-brick basin (radius
    2.9) with water, a rock mound with jets, the tapered plinth with its plaque and
    rams' heads, and the sandstone angel (wings raised, swept back) behind a girl
    and a boy, facing east down the boulevard.
- **Local frames:** a wing that is not aligned with the frontage is built in its
  own straight coordinates under a turned `Node3D` (see `CanteenWing` in
  `world.gd` and `canteen_local()` / `canteen_world()`). Collision for it is
  tested in the same local frame. Reuse this pattern; do not hand-rotate every box.

---

## Campus plan and merging buildings

Everyone builds on the same grid, so buildings line up when they are merged.

- `campus_plan.gd` is **generated** by `npm run export:godot-plan` from
  `plan.ts` (`GODOT_PLOTS`). Never edit it by hand: fix `plan.ts` and regenerate.
- **The layout is Sean's labelled reference,** `assets/MAIN CAMPUS LAYOUT
  REFERENCE.jpg` (2026-10-18): black = buildings, orange = covered walks and
  student gates, pink = car gates, yellow = ground-level areas. `GODOT_PLOTS`
  traces it in that picture's pixels (`onLayout`), fitted to what is built (the
  angel fountain, the boulevard's mouth, the road loop's kerbs; 3-4 m at worst).
  Built buildings stay on their surveyed outlines. SFJ and STL keep their OSM shapes
  but sit where the picture puts them (SFJ 20.7 m south, STL 12.2 m, its pavilion on
  the boulevard's face line); the Student Center is the strip between the boulevard
  (z 79.9) and the Main Building (from z 88.4); St. Gabriel and St. Raphael are one
  plot, "St. Gabriel"; the Gym Annex is "Aero Hall". Plaza de Corazon, outside the
  campus line, has no plot. The browser game keeps `BUILDINGS`, unchanged.
- Each plot has a **kind**: `building`, `walk` (a covered walk), `gate` (a student
  gate) or `ground` (Epiphany of Angels, Rotonda 2, the Flag Circle).
- Everything not drawn yet is a **reserved plot** (`areas/plots.gd`): a flat pad on
  its footprint (pale ground for a building, pale paving for the rest), a **dashed
  white outline** (1.2 m dashes, 0.8 m gaps, 0.24 m wide) and its short name
  **painted on the pad** in white, as big as fits (along z on a long, thin plot),
  with a small tag of its full name standing over it. No two plots overlap each
  other or a built building, and none covers walkable ground (the `plots_clear`
  check). The student cannot walk into a plot.
- **To merge your building:**
  1. Build it in `areas/<id>.gd` (`<id>` as in `plan.ts`: `sh`, `court`, `gym`,
     `sjh`, `pgn`, `mgn`, `formation`...), on the plot's outline from
     `CampusPlan.PLOTS["<id>"]`, using `world.gd`'s helpers the way
     `areas/chapel.gd` does (`build(world)` gets the builder; call
     `world.box()`, `world.material()`...).
  2. Call it from `world.gd`'s `build()` next to `Chapel.new().build(self)`.
  3. Add `<id>` to `BUILT` in `tools/export-godot-plan.mjs` and run
     `npm run export:godot-plan`. The plot disappears.
  4. Give it static `blocked(x, z)` / `walkable(x, z)` / `floor_height(x, z)`
     functions and call them from `world.gd`, like the chapel's (with a `level`
     if it has storeys you can walk under, like the gym's; see Collision).
  5. If the student walks round it, give it a **camera zone** (see Camera), and
     check that the camera never stands inside or behind another building there.
  6. Add headless checks and captures, as below.
- Photos go in `assets/images/buildings/<BUILDING>/` (or the building folders
  already in `assets/`); the chapel's are in `assets/CHAPEL/`.

---

## Pixel pipeline

All in `aps.gd`, `_build_display()` and `_resize()`:

- The 3D world renders in a `SubViewport` ("PixelWorld") shown by a
  full-screen `TextureRect` with **`TEXTURE_FILTER_NEAREST`**.
- **Sprite density:** 46.4 texels per metre (85 px over 1.83 m). This is the
  anchor for the whole style.
- **Auto pixel scale:** `ideal = window_height / view_height_m / 46.4`,
  rounded and clamped to **1..8**, with **0.65 hysteresis** so it does not
  flicker while zooming. Close framings therefore render at the sprite's own
  density (chunky, even pixels); wide framings render at full window resolution
  (thin rails survive). **P** cycles Auto / Crisp (always 1) / Chunky (~360 lines).
- **4x MSAA** on the 3D viewport, **debanding** on.
- **Camera snapping:** the camera centre moves in whole render pixels
  (`roundf(center / pixel) * pixel`) so edges and shadows do not crawl.
- Every texture uses **`TEXTURE_FILTER_NEAREST_WITH_MIPMAPS_ANISOTROPIC`**
  (mipmaps stop distant shimmer; nearest keeps texels square).

---

## Materials and textures

Always get materials through `material(kind, tint)` in `world.gd`; it caches
them so equal materials batch together.

- `diffuse_mode = LAMBERT`, `specular_mode = DISABLED`, `roughness = 0.9`.
- **Triplanar world mapping** (`uv1_triplanar`, `uv1_world_triplanar`,
  sharpness 40) at a fixed size per material, so a 36 m wall and a 0.5 m pier
  have the same texel density. Never stretch UVs per box.
- `kind = "plain"`: flat colour, no texture (small props, frames, metal).
- `kind = "glass"`: the only shiny material (GGX specular, roughness 0.3,
  metallic 0.12), a vertical gradient with diagonal sheen, mapped once per face.
- `tint` multiplies the texture; use it for variants (cream vs white stucco,
  red patio brick) instead of new textures.

Textures are **procedural, 128 × 128 px**, generated in `_texture()` with a
fixed seed (`61015 + kind.hash()`), so every machine gets identical pixels.

| Kind | Metres per tile | Base colour | Pattern |
| --- | --- | --- | --- |
| stucco | 4.0 | `#d7d6cb` | 2/255 grain, faint vertical weathering streaks |
| stone | 1.1 | `#b6a385` | running-bond blocks, lit top edge |
| road | 5.0 | `#899093` | 2/255 grain, light and dark aggregate flecks |
| tile | 3.2 | `#d6d1c3` | diagonal maroon inlay lines, grey joints |
| brick | 2.0 | `#a7957b` | herringbone; the patio uses tint `#f0b49a` for red brick |
| wood | 1.5 | `#8b6b4e` | planks every 13 px |
| metal | 2.0 | `#8c9b9e` | grain only |
| grass | 3.0 | `#7c8a5f` | 9/255 grain, 900 vertical blade flecks; mown bands tint `#f3f5ec` |
| dirt | 2.5 | `#9a8566` | pebbles in four browns and darker trodden patches (the picnic strip, the corner garden; building plots tinted `#e8e1cb`) |
| floor | 2.4 | `#d9bfa9` | peach 30 cm ceramic tiles, light grout, the odd paler tile (the APS hallway, stair treads tinted `#eee9e2`) |
| ledge | 1.2 | `#8a7d6a` | ledgestone: thin stacked slates in browns and greys with dark gaps (the hallway's front piers) |
| pavers | 2.4 | `#a69b8d` | stamped concrete: 16 px slabs of slightly different tone with dark joints (the chapel plaza and parking) |
| concrete | 4.0 | `#a3a49c` | faint stains, a saw-cut joint at each tile edge (the gym's apron, lane and walk) |
| slate | 2.4 | `#605e5c` | grey stone tiles in staggered 16 px courses (the gym's lower walls) |
| solar | 1.0 | `#26364f` | 16 px cells with lighter lines and a faint sheen (the gym's roof panels) |
| ribbed | 1.6 | `#a9aeae` | roof sheeting, a lit and a dark line every 8 px |
| octagon | 1.2 | `#9f5a45` | red octagon pavers 30 cm across in six worn tones, small dark squares where four meet, mossy joints (the boulevard's open walks, plazas and crossings) |
| slab | 2.4 | `#ddd2bf` | cream ceramic tiles 60 cm square, light grout, faint stains (the boulevard's covered walkways) |

To add a kind: add it to `TILE_METRES`, `PALETTE` and a `match` branch in
`_texture()`. Keep grain low (2–9/255). Keep colours slightly desaturated and
warm; the grade adds the final warmth.

**Emissive** materials come from `glow(color, day, night)`, which registers the
day and night energy so `set_night()` switches them. Lit windows use one shared
warm glass (`#ffc281`, night energy 1.35) on about one window in four, chosen
by position so it never changes between runs.

Common colours: white stucco `#fffef5`, cream canteen `#fff8e8`, slab
`#f3f0e5`, kerb `#bfc4bc`, sidewalk `#cfcdc1`, window frame `#333e49`, frame
trim `#bbbcb3`, steel `#414b50`, awning blue `#526e8a`, awning trim `#8c4843`,
umbrellas `#b96058` / `#9c6250`, lamp metal `#66503b`, lamp glass `#f2cc92`,
patio chair steel `#2f3133` and slats `#e39a5a`, table top `#c98a5c`, street light
pole `#8a9093` and head `#4c5254`, picnic-shed green `#2f7a55` / `#245f43`,
pergola timber `#c9b39a`.

---

## Geometry

Helpers in `world.gd`:

| Helper | Use |
| --- | --- |
| `box(size, at, material, turn := 0.0, tilt := 0.0)` | Every wall, slab, pier, rail and prop. Boxes with equal size and material become **one MultiMesh** at `_flush()`; keep using it, it is why thousands of boxes run fast. `turn` rotates about Y; `tilt` then leans the box about its own X (roof slopes, solar panels, open awning panes) |
| `room_glass(lit)` | Window glass; `true` is the shared warm glass that glows at night |
| `window(x, y, z, w, h)` | A full window: dark frame, glass (sometimes lit at night), mullions, sill |
| `framed_window(at, w, h, normal, lit, mullions)` | The same window on any face (`normal` ±X or ±Z), plus a head over it. Use it for every new building's windows, never a bare glass box: the frame, sill and head are what make a wall read in depth like the APS front |
| `panel(text, at, width, height, ink, board)` | A sign: a board and a shaded `Label3D`, readable at every zoom |
| `rod(from, to, radius, color)` | Poles, branches, trusses, rails at angles |
| `_ground(triangles, y, material)` | Flat curved ground (lawn inside a bend, patio, sidewalk rings). It does not cast shadows |
| `_ring(inner, outer)`, `_along_bend(radius, size, y, material, steps, piece)`, `bend_point()` | Surfaces, kerbs and road paint that follow the bend |
| `_tree(at, height, seed)` | A 2.5D tree: trunk, fork, limbs and a round crown of 15 leaf clusters (see below) |
| `_cards(width, height, lift, cross, cap)` | Crossed alpha-cut quads with UVs: leaf clusters, grass tufts, vine roofs. Cached by shape |
| `_umbrella(x, z, color)`, `_chair(at, facing)`, `pot(x, z)`, `_lantern(x, z)`, `_street_light(x, z)` | Patio and street props: umbrella sets with four armchairs, the ornate double lantern, the tall LED street light |
| `_yard()`, `_shed(x, z)` | Past the canteen: vine pergola, green picnic sheds, dirt yard. More sheds stand on the lawn opposite the entrance (`LAWN_SHEDS`), west of x 0, out of the canteen camera's sightline |
| `_grasses()` | Every grass tuft, as one MultiMesh |
| `_left_garden()`, `_bamboo(at, radius, culms, seed)`, `_shrub(at, size, seed)` | The planted garden left of the wing ("APS LEFT SIDE"): dirt to the kerb, bamboo, shade trees, red-tipped shrubs, a green-netted enclosure (`#2d8a5c`) behind a yellow mesh fence (`#d8b23c`). Not walkable; the road in front is |
| `_omni(at, color, energy, reach, shadows)`, `_lamp(light, at)` | Night lights (hidden by day) |

Rules:

- Give things **thickness**: slabs 0.26–0.32, parapets 0.19–0.25, sills, lips
  and drip edges. Thin flat planes look like paper under the edge shader.
- Put the street side's details (frames, sills, rails) a few centimetres in
  front of the wall so the outline shader finds them.
- Ground layers must differ by at least 5 mm in height (and kerbs hide the
  seams) or they z-fight.
- Keep the camera's sightlines clear: anything between the camera and the
  subject (lawn trees, for example) renders in front of it. At the Canteen
  framing the camera sits ~30 m back over the lawn; keep tall props out of that strip.

---

## Trees and grass (2.5D foliage)

Foliage must look like a volume from **every** camera angle, because the camera
turns 90° at the canteen. Never use single flat cards or camera-facing billboards
for plants.

- **Trees** (`_tree`): a trunk to a fork at 42 % of the height, then a crown centred
  at 68 %. The crown is **15 leaf clusters** placed at random (seeded) in the outer
  shell of an ellipsoid with radii 0.26 / 0.2 / 0.26 × height. Each cluster is
  `_cards(size, size, -size / 2, 3, true)`: three vertical quads 60° apart plus a
  level one, `size = 0.3 × height`, turned at random. Five limbs run from the fork
  into the crown. Leaves cast **double-sided** shadows, so the shade is dappled.
- **Leaf lighting** (`leaves.gdshader`): each tree's material has `center` set to the
  crown's middle and `roundness 1.0`. The normal is worked out **per pixel** from
  the world position, so the crown lights like one ball: bright on the sun side,
  darker underneath, with no seams where cards cross. Cards that turn edge-on to
  the view fade out (`smoothstep(0.1, 0.3, |card · view|)`), so no straight lines
  of leaves cut through the crown.
- **Grass** (`_grasses`): one `MultiMesh` named "Grass" of `_cards(0.62, 0.42, 0, 2)`
  tufts (two crossed blade cards) with the shared `_grass_material()`: a 48 × 32 px
  blade texture in four greens (`#4f6a3f` to `#9cae66`), sway 0.03, `center` far below
  so it lights like the lawn. Tufts never cast shadows. Seeded placement: a thick
  band along the lawn's kerbs, scattered tufts across the lawn, rings round tree roots,
  half-size moss where the patio meets walls, the rail and the sidewalk, and grass
  round the dirt yard. Keep the instance count under a few thousand.
- **Bamboo** (`_bamboo`): culms are thin rods leaning out from a tight base,
  with six small blade clusters each along their upper two thirds, arching out and
  drooping a little, in one `MultiMesh` per clump. Its leaf texture is
  `_leaf_material(seed, center, BAMBOO_COLORS, true)`: thin drooping blades in
  yellow-greens. Avoid big round puffs at the tips; they read as balls on sticks.
- **Shrubs** (`_shrub`): six clusters in a low dome, `SHRUB_COLORS` (greens with
  red-orange new growth, the "Philippine red tip" hedges).
- **Vines** (the pergola): leaf cards laid level over the rafters, with a fringe
  hanging off the edge, lit round a centre far below the roof.
- Planting rules: keep trees out of the camera's sightline to the subject (see
  Geometry), keep grass off roads and patio walking lines, and seed every random
  placement so all machines get the same plants.

---

## Lighting

`_set_hour()` in `aps.gd` has four presets (**T** cycles them). The sun aims at
(22, 7, 0) from the offset below, as seen from the APS front view.

**The sun turns with the view** (`_aim_sun()`): the offset is turned about the
vertical by the camera zone's turn, so whatever face a view looks at (SJH's
north front, MGN's east front, the gym's front, the chapel's glass, the middle
road's MGN side) is lit the way the APS front is: from the camera's side,
slanting in from the left or right with the time of day. Two exceptions: the
canteen view keeps the APS sun (it was tuned under it, and turned, the tall
block shades the wing), and inside the gym the sun stays where the gym's front
view puts it. Facing MGN the slant comes from the other side (its x is
mirrored), because from the usual side SJH's slab shades most of MGN's front.
Shadows therefore fall differently in each view; that is intended (2.5D, lit
for the camera), not a bug. A new building's view gets this for free through
its zone's turn.

| Preset | Hour | Sun offset (x, y, z) | Sun colour | Energy | Ambient | Sky top / horizon | Grade light / shade |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Morning | 8:00 | (55, 44, 60) | `#ffce96` | 1.08 | `#b8bec6` × 0.42 | `#5d8aaf` / `#edd3ae` | `#fff6e4` / `#eceef4` |
| Noon | 12:00 | (−55, 95, 18) | `#fff4de` | 1.0 | `#bcc3c8` × 0.42 | `#5d8aaf` / `#c7d9dc` | `#fff6e4` / `#eceef4` |
| Afternoon (default) | 16:30 | (−55, 44, 60) | `#ffce96` | 1.08 | `#b8bec6` × 0.42 | `#5d8aaf` / `#edd3ae` | `#fff6e4` / `#eceef4` |
| Night | 21:00 | (55, 58, 60) | `#a7bee5` | 0.2 | `#6f86c2` × 0.3 | `#101c39` / `#364566` + stars | `#e6eeff` / `#c9d6ff` |

Glow: intensity 0.25 by day (HDR threshold 1.6), 0.9 at night (threshold
0.85). Fog colour follows the horizon colour.

Night lights (in `world.lamps`, visible only at night):

- Street and patio lanterns: `SpotLight3D` pointing down, `#ffd194`, energy
  4.0, range 9, angle 62°, attenuation 0.8, **shadows on**.
- LED street lights: `SpotLight3D` from the lamp head, `#fff0d9`, energy 5.0,
  range 12, angle 68°, shadows on; the head glows `#fff3dc` (day 0.2, night 3.5).
- Stall lights: omni `#ffd79d`, 1.6, reach 7.5.
- Gym entrance lights: omni `#ffd79d`, 1.2, reach 6.0 (front doors, and MGN's porch); 1.0,
  reach 6.5 (two under the side canopy). Gym wall lamps are emissive only
  (`glow(#f6f1e1, 0, 1.6)`), no light.
- Canopy strips: omni `#ffcf92`, 0.55, reach 4.6, plus emissive strips.
- Omni attenuation is 1.4 everywhere.

New areas use these presets as they are. Add new light types to this table
before using them.

---

## Weather and atmosphere

`atmosphere.gd` (made in `aps.gd` after the NPCs). **Rule exception, added
2026-10-16 at Mclaren's request; Sean, please confirm.** Rain is the only time
anything is wet or has specular other than glass.

- **Rain** comes and goes on its own (dry spells of 80-160 s, showers of
  50-90 s); **G** starts or stops it, `--rain` starts it at once. It
  fades in and out over about 6 s. Streaks are `QuadMesh` 0.03 x 0.55 at alpha
  0.24 (4000 at full rain), splashes 0.1 x 0.035 at alpha 0.28 (320). Both
  follow the student.
- **Wet ground** only while it rains, on `road`, `stone`, `brick`, `pavers`,
  `concrete` and `slate`: albedo down to 70%, roughness 0.18, Schlick-GGX
  specular, `metallic_specular` 0.6. The sun dims, ambient and sky go grey,
  fog comes closer. Everything returns to the preset when it dries.
- **Puddles:** 120 soft oval decals on open ground, shown once the rain is past
  a quarter, tinted from the horizon colour (`#4d5779`-ish at night).
- **Lamp reflections at night:** an orthographic camera gets no screen-space
  reflections, and a ground decal is squashed flat by the low camera, so each
  lamp gets an upright additive card (`#ffd08a`, `shaft.gdshader`) standing
  9 m towards the camera from the lamp's foot, as tall as that ground looks.
- **Light shafts** (`shaft.gdshader`, additive, unshaded, no depth write):
  one card under each tree crown along the sun, turned to face the camera.
  Morning and afternoon only; hidden at night, in rain and indoors.
- **No floating specks.** Dust motes by day and fireflies at night were tried
  and dropped: they read as white and green dots over everything.
- **Falling leaves** from every tree in `world.trees`, stopping in heavy rain.
- **No foreground layer.** Dark posts and branches sliding past in front
  were tried and dropped.
- Sound: rain is a looped filtered noise (low-pass 5200 Hz outside, 700 Hz
  indoors); it halves the murmur and stops the birds.

---

## Shadows

- One `DirectionalLight3D` "Sun", **orthogonal** shadow mode, **8192**
  directional shadow size, soft shadow filter quality 4 (project setting).
- `shadow_bias 0.03`, `shadow_normal_bias 0.6`, **`shadow_blur 0.55`** (tight,
  crisp edges that do not grain or crawl while panning), `fade_start 1.0`.
- `directional_shadow_max_distance = camera distance + 45`, so wide shots keep
  shadow resolution.
- Positional shadow atlas 4096 (lantern spotlights).
- The student sprite and the foliage cast **double-sided** shadows of their real
  alpha-cut silhouette. A soft **decal** under the feet gives contact on steps.
- Ground meshes (`_ground`) do not cast shadows.
- **Do not enable contact-hardening shadows** (`light_angular_distance`). At
  close canteen framings they lost the Vulkan device on an RX 5600 XT, because
  their kernel grows with zoom.

---

## Environment

`_build_lighting()` in `aps.gd`:

- Tonemap **Filmic**, white 6.0. Adjustments: contrast 1.04, saturation 1.05.
- **SSAO:** radius 0.9, intensity 1.6, power 1.3, detail 0.6, light affect 0.15.
- **Glow:** normalized, **soft light** blend, strength 1.0, bloom 0.0.
- **Fog:** depth fog, density 0.6, curve 1.4, sky affect 0. Begin/end follow
  the camera (`distance + 14` / `distance + 170`) so wide views are not hazy.
- Ambient from colour (the presets), reflections from the sky, sky radiance 64.

---

## Shaders

| Shader | What it does | Parameters (defaults) | Rules |
| --- | --- | --- | --- |
| `edges.gdshader` | A full-screen quad on the camera (render priority 127) reads depth and normals. It draws a dark line where something sits in front of a farther surface and lightens convex creases by one pixel. It is **multiplied** over the image, so lighting, fog and glow stay intact | `line_dark 0.32`, `crease_light 0.16`, `depth_gap 0.45`, `strength` 1.0 when the pixel scale > 1, 0.7 at native resolution | The sky gets no lines. Don't add per-object outlines; this handles everything |
| `leaves.gdshader` | Alpha-cut foliage cards (leaves, grass, vines) that sway (shadows follow), are lit as a round volume and glow when backlit; edge-on cards fade out | `sway 0.045` (grass 0.03), `phase` per tree, `center` (crown middle; far below for grass), `roundness` (1.0 trees, 0.9 grass), scissor 0.4, backlight 0.45 × leaf colour | Leaf images are procedural (`_leaf_material(seed, center)`), five greens from `#3a5650` to `#a8ab70`. Round normals are per pixel |
| `sky.gdshader` | An orthographic camera sees one direction, so the sky grades over the screen instead; fixed 2-px stars at night. Lighting probes use a direction-based gradient | `top_color`, `horizon_color`, `ground_color`, `stars` (set by `_set_hour`) | |
| `shaft.gdshader` | Light shafts under trees and the lamp reflections on wet ground: an additive card, brightest in the middle, fading at its edges and ends | `color`, `strength` (0.08) | Unshaded, no fog, never writes depth |
| `display.gdshader` | Final grade on the enlarged image: shade towards `shade_tint`, light towards `light_tint`, soft vignette | `warmth 0.06`, `vignette 0.22`, tints from `_set_hour` | Keep this the only colour grade |

---

## Characters

- Sprites are sheets in `sprites/<boy|girl>/<idle|walk>.png` (one row, frames
  side by side). The boy is 85 px tall, the girl 82 px. Frames: boy idle 24,
  walk 12; girl idle 12, walk 6.
- **The boy is a rig, not PixelLab frames.** `assets/drafts/characters/boy/three-quarter/rig/`
  cuts his reference into head, crown of hair, torso, backpack and arms, turns the
  arms with RotSprite (Scale2x three times, then rotate) so they keep their width,
  and draws the legs and shoes at fixed widths. Rebuild with its `build.ps1`; it
  also fills any missing pixels. His feet land at 0.25 and 0.75 of the cycle
  (`CONTACT` in `student.gd`), which is when footsteps play.
- **NPCs** (`npc.gd`, cast in `npcs.gd`) are in the **style reference's look**, the same
  as the boy: characters from `assets/drafts/characters/style-reference.png`, or edits of
  them made at 512 px with PixelLab `edit-images-v2` and shrunk the boy's way (sample the
  centre of each 655/85 block). Never generate small: PixelLab's native pixel art is crisp
  and black-outlined and does not match. Edges are a darker tone of their own colour, no
  black outline and no orange sunset rim (lighting comes from Godot). Girls wear the grey
  HAU plaid (`assets/drafts/characters/npcs/Plaid.cs`). Sheets per NPC, all in one box
  with the feet on the bottom row: `walk` 12 and `wave` 4 are **PixelLab redraws**
  (`animate-with-skeleton-v3`) of the reference drawing, posed by skeletons taken from the
  rig's walk angles (`assets/drafts/characters/npcs/pixellab/animate-all.mjs`, frames kept
  in `pixellab/frames/<id>/`); `idle` 24 and `talk` 4 are the reference drawing itself
  from the rig (`npcs/rig/`, setups in `NpcCast.cs`): breathing, blinking, a breeze in
  the hair, the mouth moving. **Do not turn or stretch drawn limbs** for new poses: the
  rig's rotated arms and code-drawn legs blurred hands and left cut edges; redraw the pose
  instead. `rig/NpcSheets.cs` cleans PixelLab frames the same way every time (solid
  alpha, colours snapped to the drawing's own palette, specks and notches fixed, feet on
  the ground). Rebuild with `rig/build.ps1 <id>` and check with `rig/check.ps1`.
  **Migo is kept in pxl** (`assets/drafts/characters/npcs/pxl/migo/`, the pxl pixel-art
  tool from github.com/crsolver/claude-pxl): his four sheets on one 20-colour palette,
  the smudge under his chin cleaned and his chin the same in every frame, and his hair
  moving in the walk (the crown lands a frame after the body, the tips trail on each
  push-off). `rig/build.ps1` skips him; build him with that folder's `build.ps1`.
  **The player boy is made the same way** (`assets/drafts/characters/boy/pxl/`): his idle
  is his reference drawing from his rig, his walk a PixelLab skeleton redraw, both on one
  20-colour palette in pxl, his chin the same in every frame, his hair moving in the walk,
  stray specks on the legs removed. His rig (`boy/three-quarter/rig/`) now only makes the
  idle frames. Students stroll within `roam` metres of home
  along clear straight lines (no kerbs or steps); posts (`roam` 0) stay put.
- **NPCs react.** Within 3 m of the student they stop, turn to them and wave once
  (again only after the student has gone 6 m away). In rain past 0.35 they open an
  umbrella (an eight-sided matte canopy in their own colour, a steel rim and shaft,
  springing open over a quarter second) unless they stand under a roof (floor 0.45 m
  or higher, as in the canteen hall).
- **Talks are scripts** in `npcs.gd` `CAST`: lines, and questions with two or three
  replies the student picks (W/S or arrows and E, 1-3, or the mouse) on a dark card at
  the bottom of the screen, the picked one in maroon. A reply can be remembered, and
  the next talk is the first that fits what is remembered, so NPCs answer what you
  said before and pass things on (Rica's message reaches Paolo, Bea tells Ate Lorna
  about the turon). Memory lasts the session. Lines stay Taglish with a little Kapampangan.
- `Sprite3D`: `pixel_size = 1.83 / texture height` (1.83 m tall), **shaded**,
  `ALPHA_CUT_DISCARD` with scissor 0.35, `TEXTURE_FILTER_NEAREST_WITH_MIPMAPS`,
  double-sided, casts a double-sided shadow. Mipmaps are generated at load.
- **Face the camera's direction, not its position** (`face()`), or the sprite
  and its shadow twist while walking.
- Walk speed 2.4 m/s, run 4.2. **Stride 1.15 m** per walk cycle; the frame comes
  from distance travelled, so feet do not slide.
- Facing flips with the **screen-space** A/D input, not the world X direction,
  so it stays right around the corner.
- New characters or NPCs: same density (~46 px per metre of height), same
  import settings, same `face()` rule.

---

## Camera

- Orthographic. A framing is a **width in metres** of a 16:9 frame. (The F2 dev
  free cam is the one exception: perspective, FOV 65, far 900, crisp pixels in
  Auto, fog from 80 to 520 m and shadows to 160 m while flying. It is for looking
  round, not a game view.)
  `MIN_WIDTH 5` (the student nearly fills the screen) to `MAX_WIDTH 140`.

| Key | Framing | Width (m) |
| --- | --- | --- |
| 1 | APS + canteen (the whole 109 m APS and the L) | 112 |
| 2 | Whole building | 56 |
| 3 | Corridor | 36 |
| 4 | Canteen (moves the student to the patio) | 28 |
| 5 | Close-up | 10 |
| 6 | Chapel (moves the student to the plaza) | 32 |
| 7 | IH Gym (moves the student to the apron in front) | 84 |
| 8 | Gym side (moves the student to the lane by the side entrance) | 44 |
| 9 | SJH (moves the student to the south road by the parking) | 64 |
| 0 | Gym inside (moves the student to centre court, facing the stage) | 30 |

- Three blends drive the camera from the width: `close` (22 → 8 m drops the
  target to the student's chest height), `wide` (22 → 56 m) and `campus`
  (56 → 98 m) raise and pull it back.
- **Zones:** the camera has one view per place, blended by the student's
  position (each eases at rate 3):
  - **APS** (default): looks north at the APS front, sliding in X. Its focus
    stays on the front (z 0) until the student walks away from it (the lawn
    path, the strip by the Covered Court), then follows 5.3 m ahead.
  - **Canteen** (`leg_for`): turned −90°, looking east at the canteen front
    (x = 33), sliding in Z. It hands back to APS past the canteen's tip (z > 30)
    and on the strip east of the wing (x > 43).
  - **Chapel** (`chapel_for`): turned −90°, looking east at the glass front
    (x = −26), sliding in Z, on the lawn path past z 24, the plaza, the parking
    and the west road.
  - **Gym** (`gym_for`): turned −90°, looking east at the gym's front (x = 58),
    sliding in Z, on the east road past z 38 and the apron. Close up it frames
    the student's own depth so they stay in shot on the road.
  - **Gym gable** (`gable_for`): a further −90° (−180° in all), looking south
    at the north gable (z 66.8) from the lane, sliding in X.
  - **Gym inside** (`arena_for`, `face_for`): a low **2.5D** view, pitched
    **12°** from 60 m (`ARENA_PITCH`, `ARENA_DISTANCE`), centred on the student,
    in three zones (Sean's L / F / R sketch). In the **west half** of the hall
    (R) it faces west, at the west stand across the court; in the **east half**
    (L) east, at the east stand; on the **stage** and behind it (F, from x 128.5
    in the gym's frame) south, at the stage. `face` is the quarter turns past
    the gym's front view (0 east, 1 south, 2 west), eased at rate 3, so crossing
    the middle line glides round through the stage's view. `arena` is 1 inside
    the walls and rises across the last 0.8 m in front of a front doorway or the
    side entrance (where it takes over from the gable), so walking in **glides**
    the camera round. Walking in from a framing wider than 38 m glides the zoom
    to 30 (`ARENA_WIDTH`, key 0) and back on the way out; inside the zoom goes
    out to 40 m at most (`ARENA_CAP`), so the low frame's lower edge never starts
    under the floor.
  - **Gym side view** (`perch_for`, `GymInterior.perched`): up on the stage
    (from 1.65 m), the stands or the balcony (from 4.5 m) it closes in: pitched
    **10°** (`PERCH_PITCH`), the zoom gliding to 16 m (`PERCH_WIDTH`) and back
    down after, facing the way its zone does (on a stand, that stand, as in the
    "middle view" photo).
  A new building gets its own zone the same way: a `*_for(x, z)` weight, a
  facing, and the plane it frames. Make sure the camera's standing spot (focus
  minus 23 m close up, up to 90 m wide) is not inside another building.
- The east road is walkable down past the gym, with the gym's apron and the
  lane to its side entrance. The south road is drawn but not walkable yet: its
  view needs SJH, which is still a plot.
- **SJH zone** (`Sjh.view_for`): on the south road, the parking and the walkway the
  camera turns right round (−180°) to face SJH's front, which faces north; it takes
  over from the chapel and gym zones (their weights are multiplied by
  `1 − view_for`). Because the camera then stands north of the chapel, the near plane
  also cuts everything north of the parking (z < 97), so the chapel and its trees
  never stand in front of SJH.
- **MGN zone** (`Mgn.view_for`): on the west road from z 66..74 down to the corner, the
  camera turns right round (−270°, three quarter turns, through south) to look west at
  MGN's corridor front, which faces east; the chapel zone yields to it
  (`1 − Mgn.reach`), and at the corner it hands a quarter turn on to the SJH zone. The
  camera then stands over the chapel lawn, so the near plane cuts everything east of
  `Mgn.CUT_X` (x −51.8, just past the road and east of SJH's terracotta end block).
  `--view=mgn` starts on the road at the entrance. Like the SJH view, wide framings show
  an empty band at the bottom where the cut removes the near lawn.
- **Boulevard zone** (`MiddleRoad.view_for`, `MiddleRoad.south_for`): once off the
  west road's sidewalk onto the boulevard (x < −62.5, between the two buildings' faces)
  the camera faces **the side of the boulevard the student is on**: south of the centre
  line it turns −180° to look south at the Main Building's side (`middle`, two quarter
  turns); north of it, it looks north at PGN's side (`middle_north`, no turn, like the
  APS view). Crossing the road (z 62.6..66.6) it glides round through east, looking
  down the boulevard at the chapel. It slides in X with the student; wide, it frames
  that side's walks. The chapel and MGN zones yield to it (`chapel_for` and `mgn_for`
  multiply by `1 − view_for`). On the boulevard it looks down at least `MIDDLE_PITCH`
  (16°), so the hedge along the lane does not hide the walk behind it. The side nearer
  the camera, above the ground (its walkway's roof and pillars, trees, lampposts,
  poles and planter palms: `MiddleRoad.NORTH_GROUP` / `SOUTH_GROUP`), fades out and
  keeps its shadows. Facing south the near plane also cuts everything north of
  z 30 (`MIDDLE_CUT_Z`: the APS wing, the corner garden); facing north, everything
  south of the Main Building's face, through its ground line (MGN, the plots), so
  wide framings show an empty band at the bottom, as the MGN view does.
  **The controls keep the side** they started on while a direction is held
  (`_control_turns`), so holding S walks straight across the road although the camera
  turns round halfway; let go and press again, and they follow the new view.
  **Under a covered walkway** (`MiddleRoad.covered_for`, `covered`) it is the hallway
  cutaway: the zoom closes in to `HALL_WIDTH`, the camera glides to the walkway's
  middle, the near plane cuts at `MiddleRoad.CUT_OFFSET` (0.85 m) in front of it (the
  whole road-side pillar row falls away) and the dark bands close above the beams
  (`MiddleRoad.CEILING` 3.05). `--view=middle` starts on the south walk,
  `--view=middle-north` on the north walk, `--view=fountain` by the fountain; F1 has
  them and the covered walkway.
- **Interiors (cutaway):** walking into a covered space like the APS hallway
  blends in a weight (`hall`, from `Hallway.hall_for`, eased at rate 3.5) that:
  1. closes the view in to `HALL_WIDTH` (8.5 m) and glides the camera to the
     corridor (focus y 1.35, z −1.9, distance 20, lift 5, about 14° down);
  2. sweeps the camera's **near plane** from the camera up to `CUT_Z` (−0.95,
     just behind the front piers), so the road, lawn and piers fall away in
     front of the student;
  3. closes dark bands (`display.gdshader` `cut`, colour `#13110f`) over
     everything above the ceiling (y 3.22) and below the floor's cut edge, so
     only the corridor is seen.
  Walking out reverses all three. The sound treats it as indoors. SJH's covered
  walkway uses the same cutaway (`walkway`, `Sjh.walkway_for`); the cut plane is now
  set relative to the camera (the corridor's middle plus an offset towards it), so
  it works whichever way the corridor faces. Reuse it for any building: a
  `*_for(x, z)` weight, a corridor middle, a cut offset and a ceiling.
- **Controls are camera-relative.** A/D move screen-left/right and W/S move
  away/towards, rotated by the zone's turn, so holding D walks you round the corner.
- **Q/E** orbit ±0.25 rad. Default orbit 0.12. Smooth zoom (rate 10). **R** resets.

---

## Collision and floors

Three static functions in `world.gd` are the whole physics:

- `clamp_position(x, z)`: the outer bounds.
- `blocked(x, z)`: true for columns, piers, the tower, rails (with a gap at the
  steps), stalls, tables, posts, the corner garden, reserved plots, the chapel,
  and anything outside `walkable_ground()` (the north road and APS front, the
  patio, the strip, the west road, the lawn path, the chapel plaza and parking,
  the boulevard's walks, covered walkways, lanes, crossings and the fountain's apron).
  The outer bounds reach x −192 for the boulevard's west end.
  Canteen rules are tested in its local frame.
- `floor_height(x, z)`: the walking height (hall 0.45, steps 0.3/0.15, kerb 0,
  road −0.19, sidewalk and plaza −0.04, lawn path −0.17, canopy tile 0.03,
  lawn −0.2). `across_road()` (in `roads.gd`) gives the distance across the
  road anywhere on the loop.

The student moves on X then Z separately and refuses blocked spots, so it slides
along walls. Any new walkable area must extend these three functions **and**
add a headless check.

**Storeys.** `blocked()` and `floor_height()` take an optional `level`: the
height the walker stands at now (the student passes its own; without one, as
for a framing's jump, it lands on the ground storey). Where floors overlap (the
gym's lobby under its stands), each point has a list of floors and the walker
takes the highest it can step onto, at most **0.5 m** up. Stepping down more
than **0.6 m** is refused, so deck edges, bleacher rows and the stage stop the
student without rails in the collision. A solid floor (a stair, the stage)
blocks anyone below its top. See `floors()`, `floor_at()` and `blocked()` in
`areas/gym_interior.gd`; walls there carry the range of floor heights they
block (`LOW` under the deck, or up to the roof).

---

## Adding a new building or area

For a building in the plan, follow [Campus plan and merging buildings](#campus-plan-and-merging-buildings).
For anything else (props, gardens, a wing of APS):

1. Put the photos in `assets/images/buildings/<BUILDING>/` (see `assets/README.md`).
2. Take its position from `campus_plan.gd` (outlines and named places) and the
   existing coordinates. Write the reasoning in a comment.
3. Build it in `areas/<name>.gd` (or a `_<name>()` function in `world.gd` for APS) with the helpers above. If
   it is turned relative to the frontage, build it straight under its own
   pivot `Node3D`, like `CanteenWing`, and add `<name>_local()` /
   `<name>_world()` helpers.
4. Use existing material kinds and colours. Add a new kind only through
   `TILE_METRES`, `PALETTE` and `_texture()`.
5. Add night lights to `world.lamps` and emissive materials through `glow()`.
6. Extend `blocked()`, `floor_height()` and, if needed, `leg_for()` and the framings.
7. Add headless checks in `_verify_and_capture()` for its collisions, floors
   and framing, and make them pass.
8. Capture morning, noon, afternoon and night, wide and close, and compare them
   side by side with the photos.

New areas go in `areas/`, sharing `world.gd`'s helpers and materials; keep every
rule in this document.

### Interiors and the cutaway

The IH Gym is the first building you can walk into (`areas/gym_interior.gd`).
Build an interior the same way:

- **Open the doorways** in the outer walls (a sill up to the inside floor, a
  lintel over) and let `inside(x, z)` make the inside walkable ground.
- **A camera zone inside** (`arena_for`, and `face_for` for which way it
  looks), blended across the doorways so walking in is a glide, not a cut.
- **Cutaway groups.** Everything that can stand between the camera and the
  student goes in a named group under the building's pivot: the roof, the
  north wall, the front and back walls (with the props on the front walk), each
  stand's deck and rows, the walls under each stand, each side's stairs, each
  half of each bay of the roof structure. A static
  `hidden(group, local x, local z, level, side)` says when each is in the way,
  side being the zone the camera is looking at ("L", "F", "R"); `aps.gd` fades it
  out over 0.4 s and leaves it casting shadows only (`SHADOWS_ONLY`), so the
  inside stays shaded by its roof. A wall that is cut away keeps a **1.2 m
  stub** (`STUB`), so rooms still read as a plan. Floating plot labels hide
  while the student is inside.
- **Lights inside** are plain `OmniLight3D`s in their own group, on at every
  hour but only while the student is in (not in `world.lamps`, which are night
  lamps). Windows inside glow by day through `glow()`.
- **Painted floors** (the court, the practice floor) are one textured quad
  each, painted pixel by pixel at 16 px per metre with nearest filtering.
- New material kind: `stripes` (6 m tile), the gym's red, yellow, grey and
  beige diagonal mural.

---

## Before you open a pull request

- [ ] `tools\run-aps-godot.cmd --headless -- --test`: `checks_pass` is `true`.
- [ ] You looked at captures of what you changed at **morning, noon, afternoon,
      night**, at a **wide** framing and at **close-up**, against the photos.
- [ ] No shimmer or crawl while walking and zooming (play it, don't only capture).
- [ ] `npm run check` and `npm run build` pass (the browser game still builds).
- [ ] Session file in `history/sessions/` and `history/CONTEXT.md` updated.
- [ ] This document updated if you changed or added a style rule, value or helper.
- [ ] Commits under your own name, small and plain (`aps-godot: patio umbrellas`),
      **no AI co-author lines**.

---

## Do not

- Do not smooth the upscale, use linear texture filtering or turn off mipmaps.
- Do not import photo textures, PBR material packs or 3D models. Draw from the photos in code.
- Do not use specular or metallic materials except glass (and wet ground while it rains, in `atmosphere.gd`).
- Do not enable contact-hardening shadows, a wide shadow blur, or bloom by day.
- Do not add a second colour grade, LUT or post effect outside `display.gdshader`.
- Do not change the time presets, palette, sprite density or shader parameters
  without updating this document in the same pull request and telling the team.
- Do not commit `.godot/`, `*.import`, `builds/` or engine binaries (already in `.gitignore`).
  Do commit the `*.uid` files Godot creates next to scripts and shaders.
- Do not put new 2.5D work in the browser game or `aps-3d.html`.
- Do not edit `campus_plan.gd` by hand or place a building off its plan outline.
- Do not build on another team member's reserved plot.

---

## Prompt for your AI assistant

Paste this at the start of a session (Claude Code or any other assistant):

> We are building Project HAU's campus in **Godot 4.7.2** in `src/drafts/aps-godot/`.
> Before doing anything, read `history/CONTEXT.md`, the newest file in
> `history/sessions/`, `docs/godot-art-style.md` and `src/drafts/aps-godot/README.md`.
> Follow `docs/godot-art-style.md` exactly: metres, Y up, +Z to the road, on the
> team's campus plan grid (`campus_plan.gd`, generated by `npm run export:godot-plan`;
> x = u + 4.7, z = v + 58.8). Build each building on its plot's real outline in
> `areas/<id>.gd`, mark it built in `tools/export-godot-plan.mjs`, and give it a
> camera zone if the student walks round it; build
> everything in code with `world.gd`'s helpers (`box`, `window`, `panel`, `rod`,
> `_ground`, `_cards`, `_tree`) and `material(kind, tint)`. Trees and grass are
> 2.5D crossed-card volumes lit by `leaves.gdshader`, never flat cards. Use only procedural 128 px
> triplanar textures, Lambert and no specular (glass excepted), the four time
> presets, one orthogonal sun with 8192 shadows and blur 0.55 (never
> contact-hardening), the edges/leaves/sky/display shaders as they are, and the
> nearest-upscaled pixel buffer at 46.4 texels per metre. Build turned wings
> under their own pivot with local/world helpers, like `CanteenWing`. Extend
> `blocked()`, `floor_height()` and `leg_for()` for any new walkable area, and
> add headless checks. When you finish, run
> `tools\run-aps-godot.cmd --headless -- --test` (all checks true), capture
> morning/noon/afternoon/night at a wide framing and a close-up and compare
> them with the reference photos in `assets/images/buildings/`, write a session
> file and update `history/CONTEXT.md`. If you change a style value, update
> `docs/godot-art-style.md` in the same change. Commits go under my name, small
> and plain, with no AI co-author lines.
