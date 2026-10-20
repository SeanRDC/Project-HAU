# Cats and birds

**Who:** Mikko, with Claude Code.

## What was asked

Ambient life: cats and birds.

## Decisions

- **Drawn in code**, as the world's textures are: there is no animal art, and at the
  characters' density a cat is about 26 x 18 px and a maya 10 x 8, small enough to draw
  as shapes (ellipses, legs, ears, a tail) per frame. The sheets are edged in a darker
  tone of their own colour, like the cast, and lit and shadowed like them (shaded
  Sprite3D, alpha cut, double-sided shadows).
- **Three cats with names** at busy spots: Mingming (orange tabby) at the APS front,
  Kiko (tuxedo) by the canteen, Tisay (calico) on the chapel plaza. Sit (tail flick),
  stroll, sleep curled (likelier at noon, at night, in rain); a student standing still
  near one may get a visit (and a "Meow!"); running at one makes it dash off; E beside
  one pets it: it sits and purrs ("Prrr..."). The NPCs' E comes first; the pet prompt
  only shows when no one is there to talk to.
- **Maya flocks** (tree sparrows, the campus bird): six spots, 4-6 birds each, hopping
  and pecking by day; the whole flock takes off together when the student comes close
  (further if running), with a flutter, and lands again later. Gone at night and in the
  rain, when the existing bird calls stop too.
- Sounds synthesised like the rest (`audio.gd`): a meow, a purr, a flutter.

- **Redrawn (Mikko: "more, bigger, and it looks like it's not a cat")**, with references:
  a side-view orange tabby and a sparrow sheet (and a cartoon pair, with a note to keep
  them side-on and less cartoonish). The shapes made of ellipses did not read; the frames
  are now hand-placed pixels written as rows of letters (`CAT_SIT`, `CAT_WALK`,
  `CAT_SLEEP`, `BIRD_GROUND`, `BIRD_FLY`), drafted and previewed outside the game first:
  a sitting tabby with ears, muzzle, white chest and paws, stripes and the tail along
  the ground; a walking one with banded stripes and the tail up; a curled sleeper; a
  maya with its chestnut cap, white cheek and black spot, streaked back, pecking and
  flying. Bigger than life so they read (the sitting cat about 0.6 m, the bird about
  0.35 m long). The downloaded sheets were used only as reference: their licence is
  unknown, so nothing was copied in. Coats as palettes (`COATS`); five cats now (Itim,
  black, at SJH; Puti, white, at the Student Center) and eight flocks of 5-8.

- **Made with PixelLab and pxl (Mikko gave the PixelLab key and asked for pxl first).**
  pxl (github.com/crsolver/claude-pxl) was installed as the Claude Code skill at
  `~/.claude/skills/pxl-pixel-art`, where Migo's build looks for it, and Node was upgraded
  to 22.23.2 (pxl needs 22.18+). Mikko then sent "Pixel Cat and Sparrow Companions", a
  side-on, softly shaded, outline-free picture close to the cast's look, and left the
  choice of method to me. PixelLab generate-image-v2 made the standing cat at game size
  from it (Bea's idle frame as the style image), then the sitting and sleeping cats and
  the maya with the chosen cat as the style; animate-with-text-v3 made the walk (8), the
  peck and the flight. 58 generations in all. The frames went through pxl as Migo's do:
  `convert.mjs` (solid alpha, near-black edges lifted to a darker tone of their own colour,
  lone pixels dropped, one box and one palette per animal; the palette's first colours
  picked far apart, else k-means collapsed the oranges), `cats.px.js` / `maya.px.js` (the
  other four coats as palette swaps with a neutral white for the chest and paws),
  `build.ps1` into `sprites/critters/`. The letter-drawn frames in `critters.gd` are gone;
  it loads the sheets. The key is not stored anywhere in the repo.

## What changed

- `critters.gd` (new); `aps.gd`: created with the NPCs, updated each frame (and in the
  free cam), E/Space pet a cat when no NPC answers, check `cats_and_birds`;
  `audio.gd`: `meow()`, `purr()`, `flutter()`.
- `README.md`, `docs/godot-art-style.md` (Characters: ambient life).

## Checks

`tools
un-aps-godot.cmd --headless -- --test`: all true. `npm run check`, `npm run build`
pass. Captures: Mingming sitting at the APS front at noon; a flock pecking on the road in
the morning.
