# 2026-10-12 - Girl sprite sheet test

**Who:** Mclaren, working with Claude Code.

## What was asked
> i generated this image can u make a sprite sheet animation ?

then talking with facial expressions, and to commit it to the assets folder as a test.

## Decisions
* **It is a test, kept in `assets/drafts/girl-test/`.** The game's girl is still drawn by the code rig; nothing loads these files.
* **Frames reuse the generated image's own pixels.** The body is cut into body, left leg and right leg and moved for idle and walk. Talking and expressions repaint only the eye and mouth pixels, using colours already in the image. No new poses were drawn.
* **Walk is facing the camera only**, because the source image is front facing.

## What changed
* New: `assets/drafts/girl-test/` (source image, two sprite sheets, idle, walk and four talking GIFs, README).

## Left unfinished / known problems
* Does not match the game: side view, 33 px characters, versus front-facing art about 192 px tall.
* No side-view or back-view walk; that needs new art.
* The scripts that built the frames were not committed.
