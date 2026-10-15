# 2026-10-15: the two students as PixelLab sprite sheets (draft)

**Who:** Mclaren, with Claude Code and the PixelLab API.

## What was asked
Make the boy and girl look like the students in a reference mockup of the side gate (small, cute, soft shading), using PixelLab. Then: put them in the game with idle, walk and talk animations; a talking portrait in the speech bubble; emotions on the girl's portrait; a tired stance only in cutscenes; and clean up the character select screen.

## Decisions
* **The two playable students are sprite sheets now; NPCs stay on the code rig.** Art comes from PixelLab, using the user's own reference images as exact copies for one direction where possible. Everything else in the game is still drawn by code.
* **The scene renders at double detail.** `DETAIL = 2` in `src/engine/display.ts`: the buffer is 960x540 and the scene is drawn into it scaled by 2, so all drawing code keeps its 480x270 coordinates and backgrounds look the same. The students' sheets are drawn at twice the game's pixel size and shown at 0.5, so every pixel of them lands on one buffer pixel. Before this they were shrunk by uneven amounts and looked sloppy.
* **Both students share one pixel density.** The girl came from the user's reference; the boy was resized up to her density with PixelLab's pixel-art resize and remade from that.
* **Idle animations are hand-made**, not generated: the upper body drops a pixel and back (breathing) and the eye closes once a loop. The generated idles turned the head or slumped.
* **The slumped breathing animation is the "tired" stance and only plays in cutscenes** (`Area.inCutscene`, set by the game every frame).
* **Bubble portraits are cut from each student's own front sprite** (32x32, the same pixel art as the walking sprite), with talking mouth shapes drawn in. The girl's has a row per `Face`. A detailed anime-style portrait was tried and dropped as not matching.
* **Speech bubble style is unchanged.** A dark pixel-art bubble was tried and reverted at the user's request; only the bigger portrait card for the students was kept.
* The girl's hard black outline was softened into a selective outline so she matches the boy.

## What changed
* `src/engine/display.ts`: `DETAIL` and `Display.frame()`.
* `src/game/art/sprites.ts` (new): sprite sets for both students (idle, tired, walk, talk, front, back, portrait), `drawSprite`, `drawSpriteFacing`, `drawPortrait`.
* `src/game/sprites/boy/`, `src/game/sprites/girl/` (new): the sheets the game loads. `src/vite-env.d.ts` so the code can import PNGs (the first image files the game uses).
* `src/game/area.ts`: draws the player from their sheets; bubble anchors use the sprite height; `inCutscene`.
* `src/game/dialogue.ts`: students' portraits with emotions and a moving mouth.
* `src/game/ui/select.ts`: both students face front on the picker and name screen; taller panels.
* `assets/drafts/characters/` (new): the PixelLab outputs, references and every animation frame, for redoing the sheets.

`npm run check` and `npm run build` pass. Checked in the game with headless Chrome: picker, lobby, side gate cutscene, day and night.

## Left unfinished / known problems
* The boy's portrait has no emotions yet; the girl's angry and surprised faces are subtle.
* NPCs are still drawn by the code rig, in the old style, next to the new students.
* No umbrella on the students in the rain; faces on the walking sprites don't change with emotion (only the portrait and emote do).
* A thin dark strap sticks out of the boy's backpack in his side view.
* Rebuilding the sheets needs the PixelLab API (a paid key, kept out of the repo).
