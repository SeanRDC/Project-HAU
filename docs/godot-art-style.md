# Godot Art Style and Workflow

From now on, campus work moves to **Godot 4**, in the style set by the APS scene in
[`src/drafts/aps-godot/`](../src/drafts/aps-godot/README.md). This document is the
single source of truth for that style: shadows, lighting, shaders, materials,
the pixel pipeline, the camera and the way we build. If you (or your AI assistant)
add anything to the Godot project, follow this file so every machine stays in sync.

The browser game (`npm run dev`) still runs and is not deleted. New 2.5D/3D work
does not go into the browser or the Three.js trial (`aps-3d.html`); those are
frozen references.

**Contents:** [Quick start](#quick-start) · [Style pillars](#style-pillars) · [World conventions](#world-conventions) · [Pixel pipeline](#pixel-pipeline) · [Materials and textures](#materials-and-textures) · [Geometry](#geometry) · [Lighting](#lighting) · [Shadows](#shadows) · [Environment](#environment) · [Shaders](#shaders) · [Characters](#characters) · [Camera](#camera) · [Collision and floors](#collision-and-floors) · [Adding a new building or area](#adding-a-new-building-or-area) · [Before you open a pull request](#before-you-open-a-pull-request) · [Do not](#do-not) · [Prompt for your AI assistant](#prompt-for-your-ai-assistant)

---

## Quick start

| What | How |
| --- | --- |
| Engine | **Godot 4.7.2 stable**, Forward+ renderer. Put the portable editor at `builds/godot-tools/4.7.2/Godot_v4.7.2-stable_win64.exe` (ignored by git), set `GODOT` to your executable, or have `godot` in PATH. Download: <https://godotengine.org/download/> |
| Play | `tools\run-aps-godot.cmd` (Windows), or open `src/drafts/aps-godot/project.godot` in Godot and press F5 |
| Editor | `tools\run-aps-godot.cmd -e` |
| Checks | `tools\run-aps-godot.cmd --headless -- --test` prints JSON; every check must be `true` and `checks_pass` must be `true` |
| Review shots | `sh tools/capture-aps-godot.sh` writes shots to the ignored `builds/aps-godot-review/port/`. One shot: `-- --hour=16.5 --hide-help --zoom=28 --capture=<absolute .png path>` |
| Preview flags | `--hour=8\|12\|16.5\|21`, `--girl`, `--x=`, `--z=`, `--zoom=`, `--angle=`, `--view=canteen`, `--pixel=auto\|crisp\|pixel`, `--walk=<seconds>`, `--hide-help`, `--capture=<path>` (all after `--`) |

Files:

| File | Owns |
| --- | --- |
| `aps.gd` | The pixel buffer, camera, time of day, environment, UI, input, the headless checks and captures |
| `world.gd` | Every building, prop, material, procedural texture, collision rule and floor height |
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
   exception). Nothing should look wet or plastic.

---

## World conventions

- **Units:** metres. **Y up.** **+Z points to the road (towards the camera).**
- **Origin:** the APS main entrance, at ground level. The APS wing runs
  x −18..18; the tall balcony block x 18..31; the stair tower x 31.3..36.5.
- **Ground levels:** road −0.2, kerb top 0.0, sidewalk −0.04, canopy tile
  0.03, patio −0.05, canteen hall floor 0.45.
- **Storeys:** APS wing 3.05 m, tall block 3.0 m, canteen 3.05 m over a
  ~5.3 m open hall.
- **Plan:** an L. The canteen wing stands forward from the stair tower towards
  the road, its stalls facing **west** (−X) onto the herringbone-brick patio in
  the corner. The road runs along the frontage at z 4..11, turns a quarter
  circle about `BEND` (8.5, 20.5) with a 13 m centre-line radius, then runs
  towards the camera at x 18..25. Lawn is inside the bend; kerb, sidewalk and
  patio are outside it.
- **Local frames:** a wing that is not aligned with the frontage is built in its
  own straight coordinates under a turned `Node3D` (see `CanteenWing` in
  `world.gd` and `canteen_local()` / `canteen_world()`). Collision for it is
  tested in the same local frame. Reuse this pattern; do not hand-rotate every box.

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
umbrellas `#b96058` / `#9c6250`, lamp metal `#66503b`, lamp glass `#f2cc92`.

---

## Geometry

Helpers in `world.gd`:

| Helper | Use |
| --- | --- |
| `box(size, at, material, turn := 0.0)` | Every wall, slab, pier, rail and prop. Boxes with equal size and material become **one MultiMesh** at `_flush()`; keep using it, it is why ~1,500 boxes run fast. `turn` rotates about Y |
| `window(x, y, z, w, h)` | A full window: dark frame, glass (sometimes lit at night), mullions, sill |
| `panel(text, at, width, height, ink, board)` | A sign: a board and a shaded `Label3D`, readable at every zoom |
| `rod(from, to, radius, color)` | Poles, branches, trusses, rails at angles |
| `_ground(triangles, y, material)` | Flat curved ground (lawn inside a bend, patio, sidewalk rings). It does not cast shadows |
| `_ring(inner, outer)`, `_along_bend(radius, size, y, material, steps, piece)`, `bend_point()` | Surfaces, kerbs and road paint that follow the bend |
| `_tree(at, height, seed)` | A trunk, four branches and four foliage cards |
| `_umbrella(x, z, color)`, `pot(x, z)`, `_lantern(x, z)` | Patio and street props |
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

## Lighting

`_set_hour()` in `aps.gd` has four presets (**T** cycles them). The sun aims at
(22, 7, 0) from the offset below.

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
- Stall lights: omni `#ffd79d`, 1.6, reach 7.5.
- Canopy strips: omni `#ffcf92`, 0.55, reach 4.6, plus emissive strips.
- Omni attenuation is 1.4 everywhere.

New areas use these presets as they are. Add new light types to this table
before using them.

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
| `leaves.gdshader` | Alpha-cut foliage cards that sway (shadows follow), are lit from both sides and glow when backlit | `sway 0.045`, `phase` per tree, scissor 0.4, backlight 0.45 × leaf colour | Leaf images are procedural (`_leaf_material(seed)`), five greens from `#3a5650` to `#a8ab70` |
| `sky.gdshader` | An orthographic camera sees one direction, so the sky grades over the screen instead; fixed 2-px stars at night. Lighting probes use a direction-based gradient | `top_color`, `horizon_color`, `ground_color`, `stars` (set by `_set_hour`) | |
| `display.gdshader` | Final grade on the enlarged image: shade towards `shade_tint`, light towards `light_tint`, soft vignette | `warmth 0.06`, `vignette 0.22`, tints from `_set_hour` | Keep this the only colour grade |

---

## Characters

- Sprites are the **PixelLab** sheets in `sprites/<boy|girl>/<idle|walk>.png`
  (one row, frames side by side). The boy is 85 px tall, the girl 82 px.
  Frames: boy idle 12, walk 9; girl idle 12, walk 6.
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

- Orthographic. A framing is a **width in metres** of a 16:9 frame.
  `MIN_WIDTH 5` (the student nearly fills the screen) to `MAX_WIDTH 110`.

| Key | Framing | Width (m) |
| --- | --- | --- |
| 1 | APS + canteen | 98 |
| 2 | Whole building | 56 |
| 3 | Corridor | 36 |
| 4 | Canteen (moves the student to the patio) | 28 |
| 5 | Close-up | 10 |

- Three blends drive the camera from the width: `close` (22 → 8 m drops the
  target to the student's chest height), `wide` (22 → 56 m) and `campus`
  (56 → 98 m) raise and pull it back.
- **Legs:** `leg` blends from 0 (looking at the APS front, sliding in X) to 1
  (turned −90°, looking east at the canteen front at x = 33, sliding in Z).
  `leg_for(x, z)` decides it from the student's position, and it eases at rate 3.
  A new wing gets its own leg the same way.
- **Controls are camera-relative.** A/D move screen-left/right and W/S move
  away/towards, rotated by the leg, so holding D walks you round the corner.
- **Q/E** orbit ±0.25 rad. Default orbit 0.12. Smooth zoom (rate 10). **R** resets.

---

## Collision and floors

Three static functions in `world.gd` are the whole physics:

- `clamp_position(x, z)`: the outer bounds.
- `blocked(x, z)`: true for columns, piers, the tower, rails (with a gap at the
  steps), stalls, tables, the lawn, and anything outside the walkable L.
  Canteen rules are tested in its local frame.
- `floor_height(x, z)`: the walking height (hall 0.45, steps 0.3/0.15, kerb 0,
  road −0.2, sidewalk −0.04, canopy tile 0.03). `across_road()` gives the
  distance across the road on the straight, the bend and the leg alike.

The student moves on X then Z separately and refuses blocked spots, so it slides
along walls. Any new walkable area must extend these three functions **and**
add a headless check.

---

## Adding a new building or area

1. Put the photos in `assets/images/buildings/<BUILDING>/` (see `assets/README.md`).
2. Decide its world position from the aerial map and the existing coordinates.
   Write the reasoning in a comment.
3. Build it in a `_<name>()` function in `world.gd` with the helpers above. If
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

When the project outgrows one scene, split `world.gd` into one file per area
(`world_aps.gd`, `world_sjh.gd`, ...) that share the helpers and materials,
and keep every rule in this document.

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
- Do not use specular or metallic materials except glass.
- Do not enable contact-hardening shadows, a wide shadow blur, or bloom by day.
- Do not add a second colour grade, LUT or post effect outside `display.gdshader`.
- Do not change the time presets, palette, sprite density or shader parameters
  without updating this document in the same pull request and telling the team.
- Do not commit `.godot/`, `*.import`, `builds/` or engine binaries (already in `.gitignore`).
  Do commit the `*.uid` files Godot creates next to scripts and shaders.
- Do not put new 2.5D work in the browser game or `aps-3d.html`.

---

## Prompt for your AI assistant

Paste this at the start of a session (Claude Code or any other assistant):

> We are building Project HAU's campus in **Godot 4.7.2** in `src/drafts/aps-godot/`.
> Before doing anything, read `history/CONTEXT.md`, the newest file in
> `history/sessions/`, `docs/godot-art-style.md` and `src/drafts/aps-godot/README.md`.
> Follow `docs/godot-art-style.md` exactly: metres, Y up, +Z to the road; build
> everything in code with `world.gd`'s helpers (`box`, `window`, `panel`, `rod`,
> `_ground`, `_tree`) and `material(kind, tint)`. Use only procedural 128 px
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
