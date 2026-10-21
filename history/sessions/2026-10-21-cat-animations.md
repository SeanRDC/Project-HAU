# Cat animations

**Who:** Mikko, with Claude Code.

## What was asked

"Do the animations": the cats' poses that were still single frames (sit, sleep, petting) and
the idle extras (grooming, stretching, yawning), made with PixelLab and cleaned in pxl as
before.

## Decisions

- **PixelLab animate-with-text-v3 from the existing frames**, so the new poses are the same
  cat: from the sitting tabby the tail flick, grooming, yawn and the petted lean; from the
  sleeper the breathing. `pixellab/run.mjs` (new) sends a request and pads the first frame
  onto a bigger canvas so the pose has room to move; `convert.mjs` pads the same way so
  everything lines up. About 40 generations.
- **Rejected and redone:** the first petted pass drew a human hand into the frame, the first
  yawn turned the cat to face the camera, the first tail flick barely moved. The stretch
  would only walk when animated from the standing cat, so a stretch pose was generated on its
  own (generate-image-v2, the cat as reference and style, pick 4 of 25) and animated rising
  back to standing; played backwards, held and forwards it is the stretch.
- **The blink is drawn, not generated**: PixelLab kept giving the eyes a new (blue) colour.
  `closeEyes` in `convert.mjs` turns the eye's two pixels to fur with a lid line under them.
  On the dark coats the eye does not show in any frame, so neither does the blink.
- **Poses that follow each other in place share one box** (sit with its fidgets and petting;
  sleep with breathing), so the cat does not shift when it switches.
- **16 colours for the cats, not 12**: with the new frames, 12 flattened the tabby stripes.
  The pxl keys ran out, so punctuation keys were added.
- Behaviour: sitting, a cat fidgets every 2.5-6 s (tail or blink 35% each, groom or yawn 15%
  each, played once); asleep it breathes (the scale pulse is gone); it wakes with a stretch and
  strolls off; petted, it loops the lean with eyes closed.

- **Then a gallop and a real hop (Mikko approved).** The dash played the walk faster; now
  it is its own fast stride (animated from the walk's first frame, frames 2-6 of the second
  try; the first stayed a walk), 0.2 m a frame. The maya's hop was the standing frame twice;
  now it is crouch, legs tucked, landing (the second try; the first turned to the camera and
  grew), sharing a box with the ground frames; the code's arc is lower (0.06 m) as the
  frames lift the bird a little. The ground sheet is now standing and pecking only. The check
  also has a cat gallop off and a maya hop. About 6 more generations.

## What changed

- `assets/drafts/characters/critters/pxl/`: `pixellab/run.mjs` and the new requests, the
  new frames in `source/`, `convert.mjs`, `cats.px.js`; new sheets in
  `src/drafts/aps-godot/sprites/critters/` (tail, blink, groom, yawn, petted, breathe,
  stretch, per coat).
- `critters.gd`: `FPS`, `FIDGETS`, `_sit`, the sleep / stretch / petted states.
- `aps.gd`: `cats_and_birds` also checks the petted lean, a fidget, the breathing and the
  stretch.
- `docs/godot-art-style.md` (Ambient life), `README.md`.

## Checks

`tools\run-aps-godot.cmd --headless -- --test`: all true (after `--headless --import` for
the new sheets). `npm run check`, `npm run build` pass. Capture: Mingming sitting at the
APS front in the afternoon, unchanged in size and place with the wider shared box.

## Left unfinished

- The tail flick is subtle at game size.
- The `sleep` sheet is still built and loaded but no longer shown (breathe replaced it).
- The PixelLab key is in Mikko's user environment (`PIXELLAB_API_KEY`), not in the repo.
