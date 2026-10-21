# Project HAU in Godot (2.5D)

**This is the game, and the art style everyone continues in.** Every rule and
value (shadows, lighting, weather, shaders, materials, pixel pipeline, characters,
camera, checks) is written down in
[`docs/godot-art-style.md`](../../../docs/godot-art-style.md). Read it before changing
anything here, and update it when you change a style value.

It started as the Archbishop Pedro Santos Building, moved from the browser
Three.js trial (`src/drafts/aps-browser/`) into Godot 4, and is now the campus.
Everything stands on the team's campus plan (`campus_plan.gd`); a building not
built yet is a reserved plot, and a building is merged on its plot as
`areas/<id>.gd`. Built so far:

- **APS:** the whole frontage (the long classroom wing and its corridors, the
  entrance canopy and stone piers, the taller balcony block, the stair tower),
  the five-floor canteen wing with its open hall, three stalls, blue awning,
  brick patio, umbrellas and fire escape, and the ground-floor hallway you can
  walk into.
- **The chapel** with its plaza, oval parking and the road loop round its lawn.
- **The IH Gym**, outside at its real size and walkable inside.
- **St. Joseph Hall**, its raised ground floor (the walkway, the elevator lobby, the west side entrance and ramp, the lane to MGN), the Mary statue garden and parking.
- **MGN** from outside, walkable up to the turnstile, and **HAU Boulevard** (the
  middle road) between PGN and the Main Building out to the angel fountain.
- **The Student Center**, the open arcade along the Main Building beside the
  boulevard: Cafe Juan's front, the courtyard gate, study tables, the BDO ATM, and
  a brick apron at its west end out to the fountain.
- **Eight NPCs** (Migo, Bea, Rica, Paolo, Bianca, Kuya Ben, Ate Lorna, Coach
  Gab) who stroll or keep their posts, look your way, wave when you come near, and the
  friendlier ones say hi (their own line, another once you've met, or one for the hour or the rain), open umbrellas
  in the rain and talk: their lines type out with a blip in their voice, they ask
  questions, and they remember your replies for the session.
- **Weather and sound:** rain that comes and goes, with wet ground, puddles and
  lamp reflections; light shafts and falling leaves; the student murmur, birds,
  crickets, wind and footsteps, all synthesised.

It is not yet joined to the browser game's story or saves; nothing is saved
between runs.

The plan is an L, as on campus: the canteen wing stands forward from the stair
tower towards the road, with its stalls facing west onto the herringbone-brick
patio in the corner. The road bends a quarter turn round the patio, with a kerb
and sidewalk on the patio side and lawn inside the bend. Walking past the tall
block turns the camera to face the stalls, and A/D/W/S stay relative to the
camera, so holding D walks you round the corner.

West off the west road, between PGN and the Main Building, HAU Boulevard runs to
the angel fountain: one lane each way either side of a grass median with urns and
topiary, then on each side a hedge strip with tall white poles, an open walk of red
octagon pavers with bronze lampposts and banners, a strip of red-tipped shrubs and
shade trees, and a covered walkway (cream tiles, terracotta block pillars, a white
slatted roof, granite benches). Four yellow zebras cross it. The camera faces the
side the student is on (PGN's from the north half, the Main Building's from the south
half) and glides round as they cross; under a covered walkway it closes in and cuts
the road away, as in the APS hallway.

On the Main Building's side, behind the covered walkway, the Student Center runs the
length of the building: step in through the planter where the three western zebras
lead, or from the brick apron at the west end by the fountain. Inside, the camera
closes in the same way, the roof fades so you see the whole back wall (Cafe Juan's
tall windows and doorway, the courtyard gate, the offices), and the posts and planter
in front are cut away (`--view=student-center`).

The IH Gym down the east road can be walked into, through either front doorway
or the side entrance (the back has two open doorways too). Inside, the camera is
a low 2.5D view that faces the student's own half of the hall: the west stand
from the west half, the east stand from the east half, the stage from the stage.
It glides round as the student crosses the middle, and whatever stands in front
fades away (it still casts its shadow). Inside: the court, the bleachers upstairs
on both sides (climb the rows; the camera closes in on them, as on the stage),
each stand's two stairs beside its exits, the balcony over the side entrance,
the lobby and equipment room, the corridors under the stands, the curved stage
with its side stairs, and the backstage rooms. Key 0 jumps to centre court.

## Run

```powershell
.\tools\run-aps-godot.cmd
```

On macOS: `"$GODOT" --path src/drafts/aps-godot` with `GODOT` set to `Godot.app/Contents/MacOS/Godot`.

Or open `project.godot` in Godot 4.7 and press F5. The portable editor lives in
the ignored `builds/godot-tools/4.7.2/`. Other machines can
[download Godot](https://godotengine.org/download/windows/) or set `GODOT`.

After pulling new sprites, open the project in the editor once (or run Godot with
`--headless --import`) so they are imported; otherwise they fail to load and the
NPC checks fail.

## Controls

| Key | Action |
| --- | --- |
| A/D, W/S (or arrows) | Walk along the building / towards it and the road |
| Shift | Run |
| Mouse wheel, +/- | Zoom (smooth), in to about the student's own height |
| 1-6 | APS + canteen, Whole building, Corridor, Canteen (patio), Close-up, Chapel (plaza) |
| 7-9, 0 | IH Gym (front), Gym side (the side entrance from the lane), SJH, Gym inside (the court) |
| Q/E, or right-drag | Camera angle (hold the right mouse button and drag) |
| T | Dawn, morning, noon, afternoon, golden hour, dusk, night |
| G | Weather: clear, overcast, rain, thunderstorm, windy (it also changes on its own) |
| C | Boy / girl |
| E, Space or Enter | Talk to someone in reach, like the browser game: the line types out with a blip in their voice; press again to show it all, again for the next line (E turns the camera when nobody is near). When they ask something, pick a reply with W/S (or the arrows) and E, 1-3, or the mouse; they remember what you said |
| M | Mute |
| P | Pixels: Auto, Crisp, Chunky |
| R | Reset |
| F11 | Fullscreen |
| F1 | Fast travel (dev): a panel of places; click one (or arrows + Enter) to jump there |
| F2 | Free cam (dev): fly anywhere to look round. Mouse looks, W/A/S/D (or arrows) fly along the view, Space/E rise, Ctrl/Q sink, Shift fast, the wheel sets the speed (3 to 96 m/s). The student waits; T, G, P, M, Tab and F11 still work. F2 or Esc lands back on the student |
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
  read from depth and normals and multiplied over the image. It also lays cloud
  shadows that drift across the campus by day.
- `shaders/weathering.gdshader`: a second pass on every wall material, a stepped
  grime band at the foot of the walls and faint paint patches. Windows also get
  rain streaks under their sills (`streak()` in `world.gd`).
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
| `areas/chapel.gd` | The Chapel of the Holy Guardian Angel, its plaza, oval parking, paths and planting; the south side's glass hall with gold arches |
| `areas/chapel_south.gd` | The walk along the chapel's south side: the path, dirt under the trees, bamboo, the grass strip by the parking, bollards, the picnic corner and the evacuation sign |
| `areas/plots.gd` | Reserved plots for everything on the campus layout not built yet (buildings, covered walks, gates, ground areas): a dashed white outline and the name painted on each |
| `areas/gym.gd` | The Immaculate Heart Gymnasium from outside at its real size (41 x 69.5 m, about 12 m to the fascia, 16.6 m to the ridge): the front with HOLY ANGEL UNIVERSITY, both open doorways, the north gable and side entrance, the back, the solar roof, its walk, apron and lane |
| `areas/gym_interior.gd` | Inside the gym, walkable everywhere a student could go: the court with the seal, the bleachers upstairs on both sides, the balcony, the lobby, equipment room and corridors, the stage and backstage, the roof structure; its storeys, collision and cutaway groups |
| `areas/hallway.gd` | The APS ground-floor hallway (walk in from the sidewalk: the outside cuts away), the bust and the campus map |
| `areas/sjh.gd` | St. Joseph Hall: the slab, its raised ground floor (the walkway behind its railing, the planter, brown sidewalk and grass strip in front, the elevator lobby up the long stair in the middle, the side entrance and ramp at the west end, the lane to MGN under the bridge), the Mary statue garden, the parking and cars; the back facade and the lane behind it (sheds, carports, the HAU vans, the basement ramp), reached round the east end |
| `areas/mgn.gd` | The Mamerto G. Nepomuceno Building from outside: the open-corridor block, the box-window wing over the entrance (walk in up to the turnstile), the open stair, the north block, the south wing with its roof tank, the raised garden. The camera turns to face it on the west road |
| `areas/student_center.gd` | The Student Center, the open arcade between the boulevard and the Main Building: the planter and rail (open at the crossings), the cream posts and the roof (it fades while you are under it), Cafe Juan's windows and doorway, the courtyard gate, the offices, the study tables, the ATM and cafe tables at the west end, the brick apron out to the fountain, the lawn at the east end. Its camera weights |
| `areas/middle_road.gd` | HAU Boulevard between PGN and the Main Building, from the west road to the angel fountain: the lanes and grass median, the hedge strips and poles, the octagon-paver walks and bronze lampposts, the shrub strips and trees, both covered walkways (pillars, slatted roofs, benches), the zebras, signs, bins and urns, and the fountain. Its camera weights (which side it faces, the covered walkway cutaway) |
| `student.gd` | Sprite, animation, contact shadow, movement, footstep timing |
| `critters.gd` | Ambient life: a dozen campus cats (Mingming, Kiko, Tisay, Itim, Puti and seven more scattered about) who sit (flicking the tail, blinking, grooming, yawning), stroll, sleep breathing and wake with a stretch, come to a student standing still, gallop off from a running one and lean into a pet (E), flocks of maya birds scattered over the open ground that hop and peck by day and flutter off when you come close, and little groups flying over; their side-on sheets are PixelLab frames cleaned in pxl (`assets/drafts/characters/critters/pxl/`, `build.ps1`) |
| `npc.gd` | One NPC: a sheet animated by the boy's rig, strolling near home, talking, looking at the student when standing about, stopping to wave and say hello, an umbrella in the rain |
| `npcs.gd` | The cast and their talk scripts (questions, replies, what they remember), the talk hint, speech bubble and reply card |
| `audio.gd` | Synthesised music, footsteps, blips, crickets, the student murmur, birds and rain (no audio files) |
| `atmosphere.gd` | Rain and wet ground, puddles and lamp reflections, light shafts, falling leaves |
| `opening.gd` | The opening on a plain launch: a manga-style memory of the campus in Tagalog, page by page (`opening/README.md`) |
| `opening/` | The opening's pictures: `panels/` (drawn), `photos/` (campus photos standing in until drawn) |
| `shaders/` | Edges, leaves, sky, display grade, light shafts |
| `sprites/` | The sheets the game loads: `boy/`, `girl/` (idle, walk) and `npcs/<id>/` (idle, walk, talk, wave, portrait). Built from `assets/drafts/characters/`; don't edit them by hand |
| `main.tscn` | One node with `aps.gd`. Keep it that way so diffs stay readable |

Boxes that share a size and material are batched into MultiMeshes (about 1,470 boxes).

## Checks

```powershell
.\tools\run-aps-godot.cmd --headless -- --test
```

Checks the canteen and signs, that the wing faces the patio, the road bend, lawn and patio, walking round the corner, the canteen view facing the stalls, the closest zoom, column/pier/stall/tower/table collisions, the
rail gap, walking up the canteen steps, floor heights, lights per time, sheet
switching, sprite shadows, and that the wide/whole-building framings contain
the frontage, and the gym inside (walking in through a doorway and the side entrance, its two storeys, the stairs and bleacher rows, the stage and backstage, the cutaway and the hall view), SJH, MGN, the middle road and the walk along the chapel's south side, every fast-travel place being walkable, the NPCs (spawned on walkable ground, wandering, noticing and waving, umbrellas, talking, choices, the talk closing when you walk away), the campus sounds, and rain wetting the ground and drying. Rendered pixels need the GPU: `sh tools/capture-aps-godot.sh`
writes review shots into the ignored `builds/aps-godot-review/port/`.

Optional arguments after `--`: `--hour=5.75|8|12|16.5|17.75|18.5|21`, `--weather=clear|overcast|rain|storm|windy`, `--girl`, `--x=`, `--z=`,
`--level=` (an upper storey inside the gym), `--zoom=`, `--angle=`, `--view=canteen|gym|gym-side|gym-in|sjh|sjh-rear|mgn|middle|middle-north|fountain|student-center`, `--pixel=auto|crisp|pixel`,
`--walk=<seconds>`, `--rain`, `--talk` (start a conversation with whoever is in reach), `--travel` (open the fast-travel panel), `--hide-help`, `--capture=<absolute PNG path>`.

Geometry is approximate, from the walk photos, not a survey. The far sidewalk,
verge, road markings, the bend's exact radius, drain grates, rooftop tanks/vents, AC units and the
canteen's rear wall are additions made in Godot, not taken from photos.
