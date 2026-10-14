# Art, Audio, and Assets

This directory holds Project HAU's media. Right now that is mostly **reference photos of the real Holy Angel University campus**. We use them to draw the game's buildings, props and sprites. The game copies the campus 1:1, so every building should look like its photo, not a generic facade.

**Nothing in the game loads these pictures.** All the art you see in the game is drawn by code in `src/game/art/`. The photos are what we draw from.

## Reference Photos

| Folder / file | What it shows | Drawn in the game? |
| --- | --- | --- |
| `GGN BUILDING/` | The long front of GGN: the lobby, the canopy, the floor slabs and the louvred towers | Yes, `src/game/art/ggn.ts` |
| `PANERGO AND GIL APS BUILDING/` | The Archbishop Pedro Santos (APS) Building | Not yet. The APS scene (`src/game/scenes/aps.ts`) still uses a generic facade |
| `sidegate entryway/` | The side gate entryway: the front, a close-up, the floor pattern, the view toward SFJ and pans left and right from SFJ | Not yet |
| `HAU_GYMNASIUM/` | Waiting for the gymnasium photos (only a placeholder file so far) | No |
| `other references/` | Aerial shots, the campus map, eye-level photos and a few odd references, listed below | Mostly |

### `other references/`

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
* **One folder per building or place**, named after it (`GGN BUILDING/`, `sidegate entryway/`). Use the building code from the campus map where there is one.
* **Name the shot by what it shows** (`facing sfj`, `floor pattern`, `closer view`) if you can. Camera names like `20261013_150813.jpg` work too, but descriptive names help whoever draws from them.
* **Get the whole building in at least one shot**, taken straight on from the road. Add close-ups of doors, windows, signs and the ground.
* **Don't rename photos once they're in.** The notes in `plan.ts`, the art files and `docs/campus-layout.md` point to them by file name.
* **No interiors are drawn** (other than the DJN) until the team gives the go and sends interior photos.

### Whose pictures these are
Some of these pictures are ours. Others came from Google Earth, a Google Maps photo sphere, the university's campus map or the web. This repository is public, so they are here as references only. Don't put them in a build. If anyone who owns one asks, take it out. See "Reference images" in `docs/campus-layout.md`.

## The `drafts/` Folder
Not sure if a sprite looks right? Drop it in `assets/drafts/`. This is our sandbox for rough sketches, WIP animations, tileset tests and temporary sound effects. Files here do not need to follow the naming rules. `drafts/girl-test/` is a sprite sheet test, and the game does not use it (see its README).

## Aesthetic Goals
* **Visual Style:** 2D pixel art seen from the **side**, with parallax layers, soft lighting and a time-of-day cycle. Characters are about 33 px tall.
* **Environment:** The real Holy Angel University campus, laid out 1:1 and drawn from the photos above.
* **Audio:** Upbeat, nostalgic chiptune or lofi tracks, paired with ambient campus sounds.

## Production File Naming Conventions
Finished game assets moved out of `drafts/` follow this pattern (reference photos don't):
`[AssetType]_[Name]_[State].[extension]`
* **Example:** `spr_student_walk_right.png`
* **Example:** `tile_computing_building_wall.png`
* **Example:** `sfx_quest_complete.wav`
