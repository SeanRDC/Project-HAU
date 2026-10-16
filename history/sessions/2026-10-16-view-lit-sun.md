# The sun turns with the view

**Who:** Mikko, with Claude Code.

## What was asked

"Why does the APS building look better than everything else?" The biggest single
reason: the sun was fixed for APS. It came from the south, so the APS front (facing the
camera) got full warm light, while SJH's and MGN's north block faces sat in their own
shade. Then: fix the lighting first.

## Decisions

- **Each view gets the APS front's lighting.** `_aim_sun()` in `aps.gd` turns the time
  preset's sun offset about the vertical by the camera zone's turn (`_sun_turns()`), so
  the face a view looks at is lit from the camera's side. It re-aims only when the turn
  changes, and glides with the camera between zones.
- **The canteen keeps the APS sun.** Turned, the tall block threw a large diagonal
  shadow over the canteen wing's upper floors. The patio had been tuned under the old sun.
- **The gym's inside view keeps the sun of the gym's front view**, so the hall's light
  does not swing as the camera turns inside.
- **MGN's view mirrors the slant** (offset x × (1 − 2·mgn)). From the usual side,
  SJH's slab shaded most of MGN's front.
- Shadows now fall differently per view. That is intended for a 2.5D game lit for its
  camera, not a geographic sun.

## What changed

- `aps.gd`: `_sun_offset`, `_sun_turns()` and `_aim_sun()`. `_set_hour()` stores the
  offset, and `_update_camera()` re-aims the sun.
- `docs/godot-art-style.md`, Lighting: how the sun turns, and the exceptions.

## Validation

- Headless `--test`: all pass.
- Before and after captures in the afternoon:
  - **APS:** unchanged.
  - **SJH:** front now warm and lit (was grey).
  - **MGN:** lit, with shadows from the trees and balconies.
  - **Chapel:** glass and stone lit.
  - **Gym front:** lit.
  - **Middle road:** MGN's north block lit.
  - **Canteen:** unchanged.

## Left unfinished

- The other two reasons APS looks better are still to do: APS's facade helpers
  (framed windows, slab bands, rails, parapets) should be shared and used on MGN, SJH
  and the gym, and each building needs a photo-matched polish pass.
- Morning, noon and night were not compared view by view, only the afternoon.
