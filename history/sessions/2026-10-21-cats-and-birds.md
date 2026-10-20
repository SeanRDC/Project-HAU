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

## What changed

- `critters.gd` (new); `aps.gd`: created with the NPCs, updated each frame (and in the
  free cam), E/Space pet a cat when no NPC answers, check `cats_and_birds`;
  `audio.gd`: `meow()`, `purr()`, `flutter()`.
- `README.md`, `docs/godot-art-style.md` (Characters: ambient life).

## Checks

`toolsun-aps-godot.cmd --headless -- --test`: all true. `npm run check`, `npm run build`
pass. Captures: Mingming sitting at the APS front at noon; a flock pecking on the road in
the morning.
