# 2026-10-27: How cutscenes look, and the cast's cutscene references

**Who:** Mclaren, with Claude Code.

## What was asked

- Where the last session stopped; a look at the Lance sprite drafts and the 3D model.
- Ideas for cutscenes that need full animation, and how to do them when nobody on the
  team can draw.
- PixelLab versions of pictures Mclaren chose for Lance, Pat, Ysha and Lance ten years
  later, "exactly like" the pictures, saved as their cutscene references.

## Decisions

- **The inspirations:** Until Then for the overall feel, Omori for the storytelling, and
  A Space for the Unbound for how the characters look.
- **Pixel art stays in the game world; cutscenes and flashbacks are drawn art, not pixel
  art** (Omori's split). The world characters are chibi pixel sprites; the cutscene art
  can be taller and more expressive.
- **The references are converted from Mclaren's pictures, not redrawn.** Redrawing with
  PixelLab (generate-image-v2, the picture as style and reference, 128 x 192) drifted: the
  hair, eyes and colours changed, and two tools at two sizes gave young and older Lance
  different looks. PixelLab's image-to-pixelart in faithful mode (`fixer`, starting from
  the picture at strength 150, 256 x 384, a quarter of the 1024 x 1536 sources) keeps them
  as drawn. All four are made the same way so they match.
- **Each picture keeps its own eyes.** Pasting young Lance's eyes onto the older Lance
  was tried and made him look childish; don't move features between versions.
- The references keep their sources' backgrounds for now (young Lance's white shirt is
  close to his grey background, so a quick removal could eat into it).

## What changed

- `assets/drafts/characters/cutscene-art/`: `lance.png`, `pat.png`, `ysha.png`, the
  ten-years-later `lance-older.png`, `pat-older.png`, `ysha-older.png` (drafts), each
  one's `-source.png`, and `cast-draft.png` (all six side by side); their section in
  `assets/drafts/characters/README.md`. The older three have their eye whites made skin by
  hand, so every eye is a dark lid line over a rounded iris.
- `docs/godot-art-style.md`: "Full pixel art (cutscene portraits)", the 256 x 384 canvas.
- `opening/STORY.md` revised to be emotional the way Omori is, by holding back (its
  "What changed in this revision" lists each change): November 11 is no longer also
  Ysha's birthday and 11:11 is used once; a new "Who Ysha is" (her humour, drawings,
  opinions, a running joke with Lance) so she is a person before she is a worry; fewer
  speeches (Pat's ending line is now "Ito 'yung nahulog mo noon."); the true ending is
  "Sabay tayo"; "Sa likod" is silent (no "Totoong Tayo", so no song permission needed); Pat
  has edges (a cold week, a fight); the cost is honesty with Pat, not romance.
- `tools/pixellab-convert.mjs`: PixelLab image-to-pixelart-pro (finds the picture's own
  pixel scale), or with `--size` image-to-pixelart in faithful mode at that size.
- `tools/pixellab-styled.mjs`: PixelLab generate-image-v2 with a style image and
  reference images (used for the first tries).

## Left unfinished / known problems

- How the drawn cutscenes are made is still to be tried. The idea: pose the smooth 3D
  Lance (`assets/drafts/3d/lance-hd.blend`), render it as ink lines (Blender Line Art,
  flat shading), put it over a campus photo inked by `manga.gdshader`, touch up by
  tracing in Krita, and animate with a few frames (blinks, hair) plus camera moves.
- Older Lance's hair is a deeper red than young Lance's (as in the sources); decide
  whether that is on purpose.
- The cutscene references have no tie, the pixel portraits and 3D model still do; decide
  which uniform is right.
- The 3D model's hair is too big and its arms too stiff to pose; not fixed yet.
- `tools\run-aps-godot.cmd` didn't find Godot on this computer (it is at
  `D:\Tools\Godot\`); set `GODOT` to its path.
- Still untracked: `assets/drafts/characters/boy/pxl-asano/` (the Lance sprite drafts),
  `tools/gen-image.mjs`, `tools/pixellab-image.mjs`.
