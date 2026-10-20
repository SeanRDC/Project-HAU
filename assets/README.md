# Art, Audio, and Assets

This directory holds Project HAU's media: **reference photos of the real Holy Angel University campus**, and the **character sources** the game's sprites are built from. The game copies the campus 1:1, so every building should look like its photo, not a generic facade.

**The game does not load the photos.** The Godot game (`src/drafts/aps-godot/`) builds every building in code from them, and the frozen browser prototype draws them in `src/game/art/`. The only images the Godot game loads are its sprite sheets in `src/drafts/aps-godot/sprites/`, and those are built from `drafts/characters/` (see [its README](drafts/characters/README.md)).

## Reference Photos
Most are in `images/`: one folder per building in `images/buildings/`, the side gate entryway in `images/sidegate entryway/`, and everything else in `images/other references/`. The walk photos from the October photo trip are in their own folders at the top of `assets/`.

### Walk photos (October 2026)

| Folder | What it shows | Built in Godot? |
| --- | --- | --- |
| `APS WALK FROM CHAPEL LAWN/` | 31 photos walking along APS from the chapel lawn: the wing, canopy, tall block, stair tower, canteen and patio | Yes, `world.gd` and `areas/hallway.gd` |
| `CHAPEL/` | The Chapel of the Holy Guardian Angel from the front and both sides, a layout sketch, and the walk along its south side (08-10; the photos of that walk with parked cars are left out, for the plates) | Yes, `areas/chapel.gd` and `areas/chapel_south.gd` |
| `SJH BUILDING/` | St. Joseph Hall from the front and both sides | Yes, `areas/sjh.gd` |
| `MGN BUILDING/` | The Mamerto G. Nepomuceno Building from the front and both sides | Yes, `areas/mgn.gd` |

These show people and number plates. Don't put them in a build or post them anywhere.

### `images/`

| Folder / file | What it shows | Drawn in the game? |
| --- | --- | --- |
| `images/buildings/GGN BUILDING/` | The long front of GGN: the lobby, the canopy, the floor slabs and the louvred towers | Yes, `src/game/art/ggn.ts` |
| `images/buildings/PANERGO AND GIL APS BUILDING/` | The Archbishop Pedro Santos (APS) Building | Yes, in Godot (`world.gd`), with the walk photos above |
| `images/sidegate entryway/` | The side gate entryway: the walkway, the flag plaza close up (`closer view.jpg`), its floor pattern, the steps down toward SFJ, and pans left and right from SFJ | Yes, `src/game/art/entry.ts` (scene `src/game/scenes/entry.ts`) |
| `images/buildings/ih_gym immaculate heart/` | The Immaculate Heart Gymnasium, outside and in: the front with its two entrances, the left side entrance by the covered court, the lobby, the corridor with the equipment room and stairs, the court, the stage and the second-floor bleachers | Yes, in Godot (`areas/gym.gd` outside, `areas/gym_interior.gd` inside) and the browser (`src/game/art/ihgym.ts`, `ihgymin.ts`) |
| `images/buildings/covered court beside IH/` | The Covered Court beside the IH Gym: its front gable, the basketball court, the bleachers, the volleyball and badminton courts, the Aero Laboratory gate and the planes inside | Yes, `src/game/art/ccourt.ts` |
| `images/buildings/beside the main building + the main walkways/` | The student center and Cafe Juan, both covered sidewalks 1, both sidewalks 2, the road between them, MGN, the PGN side | Yes, in the browser (`src/game/art/walks.ts`); in Godot the middle road (`areas/middle_road.gd`) |
| `images/other references/` | Aerial shots, the campus map, eye-level photos and a few odd references, listed below | Mostly |

### `images/other references/`

| File | What we use it for |
| --- | --- |
| `Aerial shot of HAU enclosed in red line.png` | Where every building is. Positions in `src/game/campus/plan.ts` and the campus map (C key) come from this picture |
| `haucampusmap_2022.jpg` | The university's building numbers, names and offices |
| `aerial diagram close to epiphany of angels.png` | The gates, the fountain plaza, the rotunda and the sheds around the Epiphany of Angels |
| `epiphany begin, facing the campus.png`, `epiphany end going to gate.png`, `shot where the epiphany of angels walkway ends.png`, `walkway going to the chapel.png`, `rotounda statue fountain.png` | The park and walkways at eye level |
| `SJH BUILDING.jpg`, `SJH BUILDING BESIDE CHAPEL.jpg` | St. Joseph Hall (`src/game/art/sjh.ts`) |
| `SFJ BUILDING AND FOUNTAIN.jpg`, `SFJ BUILDING CORNER VIEW.jpg`, `FOUNTAIN IN FRONT OF SFJ.png` | SFJ and the fountain plaza (`src/game/art/sfj.ts`) |
| `SFJ AND FOUNTAIN SIDE VIEW.jpg` | The brick basin of the rotunda statue fountain (`src/game/art/street.ts`) |
| `THE CURRENT IN GAME FOUNTAIN IN FRONT OF SFJ.png` | A screenshot of the game's old fountain, kept to compare against |
| `INSIDE DJN BUILDING.jpg`, `CLOSER VIEW INSIDE DJN.jpg` | The Main Building courtyard (`src/game/scenes/courtyard.ts`) |
| `HAU SIDE GATE DESIGN.jpg` | The gatehouse, fence and barricades (`src/game/art/gate.ts`) |
| `ACTDO.jpg` | The traffic enforcer's uniform at the side gate |
| `chevrolet-high-country-storm-main-1560834757.jpg` | The red pickup parked at the side gate (`src/game/art/traffic.ts`) |
| `HAU-GYMNASIUM` | An empty placeholder |

### Adding photos
* **One folder per building or place** in `images/buildings/`, named after it (`GGN BUILDING/`, `ih_gym immaculate heart/`). Use the building code from the campus map where there is one.
* **Name the shot by what it shows** (`facing sfj`, `floor pattern`, `closer view`) if you can. Camera names like `20261013_150813.jpg` work too, but descriptive names help whoever draws from them.
* **Get the whole building in at least one shot**, taken straight on from the road. Add close-ups of doors, windows, signs and the ground.
* **Don't rename photos once they're in.** The notes in `plan.ts`, the art files and `docs/campus-layout.md` point to them by file name.
* **No interiors are built** until the team gives the go and sends interior photos. So far that is the DJN (browser), the APS hallway and the IH Gym (Godot).

### Whose pictures these are
Some of these pictures are ours. Others came from Google Earth, a Google Maps photo sphere, the university's campus map or the web. This repository is public, so they are here as references only. Don't put them in a build. If anyone who owns one asks, take it out. See "Reference images" in `docs/campus-layout.md`.

## The `drafts/` Folder
Not sure if a sprite looks right? Drop it in `assets/drafts/`. This is our sandbox for rough sketches, WIP animations and tests. Files here do not need to follow the naming rules.
* `drafts/characters/` - the player boy and girl and the eight NPCs: references, the rig, PixelLab redraws and pxl clean-ups, and the scripts that build the game's sheets. See [its README](drafts/characters/README.md).
* `drafts/girl-test/` - an early sprite sheet test. The game does not use it (see its README).

## Aesthetic Goals
* **Visual Style:** 2.5D: pixel art in a real 3D world, seen through a side-view camera that turns to face each building, with real shadows, soft lighting, weather and a time-of-day cycle. Every rule is in `docs/godot-art-style.md`.
* **Characters:** soft, painterly pixel sprites in the look of `drafts/characters/style-reference.png`, about 46 px per metre, lit by the scene.
* **Environment:** The real Holy Angel University campus, laid out 1:1 and built from the photos above.
* **Audio:** Synthesised for now (`audio.gd`): a gentle melody, wind, footsteps, the student murmur, birds, crickets and rain. Recorded tracks may come later.

## Production File Naming Conventions
Finished game assets moved out of `drafts/` follow this pattern (reference photos don't):
`[AssetType]_[Name]_[State].[extension]`
* **Example:** `spr_student_walk_right.png`
* **Example:** `tile_computing_building_wall.png`
* **Example:** `sfx_quest_complete.wav`
