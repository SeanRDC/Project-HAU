# Girl sprite test

**This is an early test, not the game's girl character.** Nothing here is loaded by either game. The Godot game's characters are built in `../characters/` (see [its README](../characters/README.md)) into `src/drafts/aps-godot/sprites/`; the browser prototype uses the PixelLab sheets in `src/game/sprites/`.

It tries out one AI-generated image (`girl_source.png`, 256x256) as a sprite sheet with animations. All frames are the original pixels moved or lightly retouched; no new poses were drawn.

| File | What it is |
|---|---|
| `girl_source.png` | The generated image everything else is made from |
| `spr_student_girl_sheet.png` | 4 x 2 frames, 72 x 200 each. Row 0 idle (breathing bob), row 1 walk facing the camera |
| `spr_student_girl_idle.gif` | Row 0 animated, 4 fps, 3x scale |
| `spr_student_girl_walk_down.gif` | Row 1 animated, 8 fps, 3x scale |
| `spr_student_girl_faces_sheet.png` | 5 x 4 frames, 72 x 200 each. Rows: neutral, happy, surprised, annoyed. Columns 0-3 talking mouth shapes, column 4 blink |
| `spr_student_girl_talk_*.gif` | Head-and-shoulders talking loops for each expression, 5x scale |

## Why it was not used
* It does not match the style reference (`../characters/style-reference.png`) the characters follow now, and it is about 192 px tall where the Godot sprites are about 85 px.
* There is only one pose, front facing, so a three-quarter walk would need new art.

Kept for reference only.
