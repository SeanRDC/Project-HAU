# 2026-10-27: How cutscenes look, and Lance's cutscene reference

**Who:** Mclaren, with Claude Code.

## What was asked

- Where the last session stopped; a look at the Lance sprite drafts and the 3D model.
- Ideas for cutscenes that need full animation, and how to do them when nobody on the
  team can draw.
- PixelLab tries of Lance: full body, half body, and finally one made to match a picture
  Mclaren chose, saved as his cutscene reference.

## Decisions

- **The inspirations:** Until Then for the overall feel, Omori for the storytelling, and
  A Space for the Unbound for how the characters look.
- **Pixel art stays in the game world; cutscenes and flashbacks are drawn art, not pixel
  art** (Omori's split). The world characters are chibi pixel sprites; the cutscene art
  can be taller and more expressive.
- **Lance's cutscene look is `assets/drafts/characters/cutscene-art/lance.png`:** messy
  auburn hair, tired brown eyes, white short-sleeve polo with an open collar and no tie,
  maroon backpack with black buckles. Made with PixelLab from `lance-source.png`.
- **Pat's cutscene look is `cutscene-art/pat.png`**, made the same way from `pat-source.png`:
  very long dark brown hair, tired brown eyes, white blouse with an open collar, black
  backpack straps, grey and red plaid skirt.
- **Ysha's cutscene look is `cutscene-art/ysha.png`**, from `ysha-source.png`:
  shoulder-length wavy golden hair, white-framed glasses, orange cat lanyard with an ID
  card, navy backpack straps, plaid skirt. Her hair came out brighter than the source.

## What changed

- `assets/drafts/characters/cutscene-art/` (`lance.png`, `lance-source.png`) and its
  section in `assets/drafts/characters/README.md`.
- `tools/pixellab-styled.mjs`: PixelLab generate-image-v2 with a style image and
  reference images (`PIXELLAB_API_KEY` from the environment).

## Left unfinished / known problems

- How the drawn cutscenes are made is still to be tried. The idea: pose the smooth 3D
  Lance (`assets/drafts/3d/lance-hd.blend`), render it as ink lines (Blender Line Art,
  flat shading), put it over a campus photo inked by `manga.gdshader`, touch up by
  tracing in Krita, and animate with a few frames (blinks, hair) plus camera moves.
- The cutscene reference has no tie, the pixel portraits and 3D model still do; decide
  which uniform is right.
- The 3D model's hair is too big and its arms too stiff to pose; not fixed yet.
- `tools\run-aps-godot.cmd` didn't find Godot on this computer (it is at
  `D:\Tools\Godot\`); set `GODOT` to its path.
- Still untracked: `assets/drafts/characters/boy/pxl-asano/` (the Lance sprite drafts),
  `tools/gen-image.mjs`, `tools/pixellab-image.mjs`.
