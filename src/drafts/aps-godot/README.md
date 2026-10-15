# APS in Godot (2.5D)

**This is the art style everyone continues in.** Every rule and value (shadows,
lighting, shaders, materials, pixel pipeline, camera, checks) is written down in
[`docs/godot-art-style.md`](../../../docs/godot-art-style.md). Read it before changing
anything here, and update it when you change a style value.

The Archbishop Pedro Santos Building moved from the browser Three.js trial
(`src/drafts/aps-browser/`) into Godot 4, with the art style and graphics
polished on the way. It has the whole frontage: the long classroom wing and its
corridors, the entrance canopy and stone piers, the taller balcony block, the
stair tower, and the five-floor canteen wing with its open hall, three stalls,
blue awning, brick patio, umbrellas and fire escape. It is not yet joined to
the browser game's story or saves.

The plan is an L, as on campus: the canteen wing stands forward from the stair
tower towards the road, with its stalls facing west onto the herringbone-brick
patio in the corner. The road bends a quarter turn round the patio, with a kerb
and sidewalk on the patio side and lawn inside the bend. Walking past the tall
block turns the camera to face the stalls, and A/D/W/S stay relative to the
camera, so holding D walks you round the corner.

The IH Gym down the east road can be walked into, through either front doorway
or the side entrance. The camera glides round and down to look along the hall
at the stage, and the roof, the north wall and whatever stands between it and
the student fade away (they still cast their shadows). Inside: the court, the
bleachers upstairs on both sides (climb the rows), the balcony over the side
entrance, the lobby and equipment room, the corridors under the stands, the
stage with its steps and the backstage rooms. Key 0 jumps onto the court.

## Run

```powershell
.\tools\run-aps-godot.cmd
```

Or open `project.godot` in Godot 4.7 and press F5. The portable editor lives in
the ignored `builds/godot-tools/4.7.2/`. Other machines can
[download Godot](https://godotengine.org/download/windows/) or set `GODOT`.

## Controls

| Key | Action |
| --- | --- |
| A/D, W/S (or arrows) | Walk along the building / towards it and the road |
| Shift | Run |
| Mouse wheel, +/- | Zoom (smooth), in to about the student's own height |
| 1-6 | APS + canteen, Whole building, Corridor, Canteen (patio), Close-up, Chapel (plaza) |
| 7-9, 0 | IH Gym (front), Gym side (the side entrance from the lane), SJH, Gym inside (the court) |
| Q/E | Camera angle |
| T | Morning, noon, afternoon, night |
| C | Boy / girl |
| E, Space or Enter | Talk to someone in reach (E turns the camera when nobody is near) |
| M | Mute |
| P | Pixels: Auto, Crisp, Chunky |
| R | Reset |
| F11 | Fullscreen |
| F1 | Fast travel (dev): a panel of places; click one (or arrows + Enter) to jump there |
| Tab / Esc | Hide controls / close |

## Clear at every zoom

The world renders into its own buffer and is enlarged with nearest-neighbour
sampling, so pixels are always whole blocks. The badge at the top right shows
the buffer size.

- **Auto** (default) picks the buffer from the zoom. Close framings render near
  the students' own texel density (about 46 px per metre), so the sprite and
  textures read as pixel art. Wide framings render at the window's full
  resolution, so window frames and rails stay sharp. The switch has hysteresis
  so it does not flicker while zooming.
- **Crisp** always renders at full resolution. **Chunky** always renders at
  about 360 lines.
- 4x MSAA, mipmapped nearest textures and anisotropic filtering keep thin
  geometry and distant ground from shimmering when zoomed out.
- Textures are mapped in world space (triplanar) at a fixed size per material,
  so a 36 m wall and a 0.5 m pier have the same pixel density.
- The camera moves in whole render pixels, so edges do not crawl while it follows.
- Fog and the sun's shadow range follow the camera distance, so the wide views
  are not hazy and their shadows keep their resolution.

## Lighting and shaders

- Sun with an 8192 shadow map, tight soft filtering (crisp, steady edges), four
  time presets, with SSAO and filmic tone mapping.
- The students are lit, alpha-cut sprites that cast their real animated
  silhouette. A decal contact shadow drapes over steps. The sprite faces the
  camera's direction, not its position, so neither it nor its shadow twists while walking.
- `shaders/edges.gdshader`: one-pixel dark lines where an object sits in front
  of something farther away, plus a faint highlight on convex corners. It is
  read from depth and normals and multiplied over the image.
- `shaders/leaves.gdshader`: pixel foliage that sways a little (shadows follow)
  and glows when backlit.
- `shaders/sky.gdshader`: a screen gradient for the orthographic camera, with
  pixel stars at night.
- `shaders/display.gdshader`: warm-light / cool-shade grade and a soft vignette.
- Night: lit classrooms, canopy strips, lantern spotlights with shadows, stall
  lights, and glow on emissive surfaces.

Contact-hardening soft shadows (`light_angular_distance`) were tried and dropped.
At close canteen framings they lost the Vulkan device on the RX 5600 XT,
because their kernel grows with zoom.

## Files

| File | What |
| --- | --- |
| `aps.gd` | Display buffer, camera, time of day, UI, input, checks/captures, the fast-travel places |
| `dev_travel.gd` | The F1 fast-travel panel and its fade (dev tool) |
| `world.gd` | APS, the canteen, patio and street, the shared helpers, materials, procedural textures, collisions and floor heights |
| `campus_plan.gd` | Generated by `npm run export:godot-plan` from `src/game/campus/plan.ts`: every building's real outline, in Godot metres. Do not edit |
| `roads.gd` | The campus loop road round the chapel lawn, and the distance across it |
| `areas/chapel.gd` | The Chapel of the Holy Guardian Angel, its plaza, oval parking, paths and planting |
| `areas/plots.gd` | Reserved plots for the buildings teammates are making |
| `areas/gym.gd` | The Immaculate Heart Gymnasium from outside at its real size (41 x 69.5 m, about 12 m to the fascia, 16.6 m to the ridge): the front with HOLY ANGEL UNIVERSITY, both open doorways, the north gable and side entrance, the back, the solar roof, its walk, apron and lane |
| `areas/gym_interior.gd` | Inside the gym, walkable everywhere a student could go: the court with the seal, the bleachers upstairs on both sides, the balcony, the lobby, equipment room and corridors, the stage and backstage, the roof structure; its storeys, collision and cutaway groups |
| `areas/hallway.gd` | The APS ground-floor hallway (walk in from the sidewalk: the outside cuts away), the bust and the campus map |
| `areas/sjh.gd` | St. Joseph Hall: the slab, its covered walkway (walk in through a railing gap), the Mary statue garden, the parking and cars |
| `student.gd` | Sprite, animation, contact shadow, movement, footstep timing |
| `npc.gd` | One NPC: a sheet animated by the boy's rig, strolling near home, talking |
| `npcs.gd` | The cast, their lines, the talk hint and speech bubble |
| `audio.gd` | Synthesised music, wind, footsteps, blips and crickets (no audio files) |
| `shaders/` | Edges, leaves, sky, display grade |

Boxes that share a size and material are batched into MultiMeshes (about 1,470 boxes).

## Checks

```powershell
.\tools\run-aps-godot.cmd --headless -- --test
```

Checks the canteen and signs, that the wing faces the patio, the road bend, lawn and patio, walking round the corner, the canteen view facing the stalls, the closest zoom, column/pier/stall/tower/table collisions, the
rail gap, walking up the canteen steps, floor heights, lights per time, sheet
switching, sprite shadows, and that the wide/whole-building framings contain
the frontage, and the gym inside (walking in through a doorway and the side entrance, its two storeys, the stairs and bleacher rows, the stage and backstage, the cutaway and the hall view). Rendered pixels need the GPU: `sh tools/capture-aps-godot.sh`
writes 26 review shots into the ignored `builds/aps-godot-review/port/`.

Optional arguments after `--`: `--hour=8|12|16.5|21`, `--girl`, `--x=`, `--z=`,
`--level=` (an upper storey inside the gym), `--zoom=`, `--angle=`, `--view=canteen|gym|gym-side|gym-in`, `--pixel=auto|crisp|pixel`,
`--walk=<seconds>`, `--hide-help`, `--capture=<absolute PNG path>`.

Geometry is approximate, from the walk photos, not a survey. The far sidewalk,
verge, road markings, the bend's exact radius, drain grates, rooftop tanks/vents, AC units and the
canteen's rear wall are additions made in Godot, not taken from photos.
