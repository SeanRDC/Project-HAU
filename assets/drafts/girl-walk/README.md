# Girl walk cycle test

**This is a test, not the game's girl character.** The game still draws both students from code (`src/game/art/character.ts`). Nothing here is loaded by the game.

A side-view walk for a schoolgirl, made from frames generated one at a time in ChatGPT, then cleaned into a pixel-art sprite sheet by `build.mjs`. Open `preview.html` in a browser to watch it.

| File | What it is |
|---|---|
| `frames/` | The approved ChatGPT pictures: `idle.png` and `frame1.png` to `frame8.png`, as generated |
| `clean/` | Each frame after cleaning: 140 x 200, her feet on row 196, the front of her face on column 80 |
| `girl_walk_sheet.png` | The same 9 cells in one row: idle, then walk frames 1 to 8 |
| `girl_walk.json` | For each walk frame, how far to move her (`advance`, pixels) and how long to show it (`hold`, times the normal frame time), so her planted foot stays put |
| `preview.html` | Walks her back and forth, with a speed slider, walk-on-the-spot, and the old even timing to compare |
| `build.mjs` | Makes everything above from `frames/`: `node build.mjs frames out` (needs the `pngjs` package, which the project does not install) |

## The walk
Frame 1 her left foot lands, 2 her weight comes down on it, 3 her right leg passes under her, 4 it reaches forward, 5 to 8 the same with the other leg. She faces right; the game would flip her to walk left.

## What `build.mjs` does to the ChatGPT pictures
* Finds each picture's real pixel grid (about 7.75 screen pixels per art pixel) and rebuilds it one art pixel per cell, which removes the blur and noise.
* Sizes each frame by its torso (collar to skirt hem) and then its legs, so all frames come out the same size.
* Puts frame 1's head on every frame, seated on the collar, so her face and eyes are identical throughout.
* Snaps every frame to one shared palette, and removes the red and yellow fringe left by the background removal.
* Measures the foot she stands on from frame to frame for `advance`, and sets `hold` from it.

## Known problems
* **Her body and backpack grow and shrink a little as she walks.** Frames 4 to 7 were generated with a reference picture that had different proportions, so their head, backpack and legs do not match frames 1, 2, 3 and 8. The build hides some of it but not all. The fix is to regenerate frames 4 to 7 with frames 1, 2 and 8 attached and the instruction to keep exactly the same proportions and backpack size.
* She is about 176 px tall at her own pixel size. The game's characters are 33 px tall, so using her would mean either shrinking her (which loses the detail) or drawing characters at a finer resolution than the world.
* Side view only: no walking towards or away from the camera.
