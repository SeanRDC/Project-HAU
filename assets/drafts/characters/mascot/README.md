# Mascot (draft, 2026-11-14)

A draft design for the game's guide: a doodle Ysha drew in ballpen on a handout, come to
life. Mclaren asked for a mascot "like Takopi" (a small, innocent guide); this one is the
project's own design, not a copy of that character. Not in the game. No name yet.

- `pxl/mascot.px.js` - the source. Build with pxl (Node 22.18+):
  `node <pxl>/bin/pxl.js build mascot.px.js`; pictures land in `pxl/out/` (not committed).
  `mascot-concept.png` and `mascot-world.png` here are copies of its two scenes.
- `mascot_concept` (64 x 64) - the design: a paper-white blob, a paper boat folded from a
  handout as its hat (one ruled line still showing), dot eyes, cheeks the orange of Ysha's
  lanyard, stick limbs in ballpen ink, and two hands that don't match, because she can't
  draw hands.
- `mascot_world` (13 x 11 before its outline) - the small one that would follow Lance about.

The role it was designed for is in `history/sessions/2026-11-14-paeng.md`.

## 3D model (draft)

`tools/blender/mascot.py` builds it in a T-pose with a skeleton, the way `lance.py` builds
Lance: `blender --background --factory-startup --python tools/blender/mascot.py -- --preview
builds/mascot-3d` writes `src/drafts/aps-godot/models/mascot.glb` and
`assets/drafts/3d/mascot.blend`, and renders the T-pose from four sides and a test pose.

- About half a metre tall, 1,742 triangles. Parts are material names: `paper`, `ink`,
  `cheek`, `rule`.
- 13 bones: `root` > `body` > `hat`; `arm.L/R` > `forearm.L/R` > `hand.L/R`; `leg.L/R` >
  `foot.L/R`. Every vertex follows one bone, so the limbs move like cut paper. `.L` is its
  own left.
- To pose it: open `mascot.blend`, select the rig, Pose Mode, rotate a bone. A bone's own
  Y axis runs along it (a twist); X and Z swing it.
- Not in the game: `actor.gd` has no palette for it yet, and it has no animations.
- The preview renders look grey; that is Blender's preview light, not the paper colour.
