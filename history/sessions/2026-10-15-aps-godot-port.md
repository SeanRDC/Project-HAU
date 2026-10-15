# APS moves to Godot, with art and graphics polish

Mikko asked to transfer the 2.5D APS to Godot with polished shadows,
lighting, shaders and details, and said that both zoomed out and zoomed in
must stay clear. Mid-task he confirmed the direction: we are moving to Godot
while polishing the art style and graphics.

## Changes

- `src/drafts/aps-godot/` rewritten. The entrance-only trial is replaced by the full
  browser frontage (same coordinates): APS wing, canopy, tall block, stair
  tower, canteen wing with open hall, stalls, awning, valance, patio, umbrellas,
  fire escape. Collision and floor heights are ported, and the student can walk up
  the canteen steps through the rail gap. Split into `aps.gd`, `world.gd`,
  `student.gd` and `shaders/`.
- Clarity at all zooms: adaptive render buffer (Auto / Crisp / Chunky, P key)
  tied to sprite texel density, with whole-block nearest upscale. Also 4x MSAA,
  mipmapped nearest plus anisotropic textures, world-space triplanar texel
  density, pixel-step camera, and fog/shadow ranges that follow the camera.
- Graphics: 8192 sun shadows with tight filtering, real sprite silhouettes, a decal
  foot contact, a depth/normal edge shader, swaying backlit foliage, an
  orthographic screen sky with night stars, a display grade/vignette, SSAO, night glow,
  lantern spotlights with shadows, and stall and canopy lights.
- Added details: far sidewalk and verge (the street trees no longer stand in the
  road), lane and kerb markings, drain grates, rooftop tanks and vents, AC units,
  and a rear wall for the canteen hall (its front stays open).
- Smooth wheel zoom, 1-5 framings, F11, and a badge showing framing and buffer size.
- `tools/capture-aps-godot.sh`: 14 native review shots.

## Validation

- Headless `--test`: 19 checks pass (collisions, rail gap, canteen steps,
  floors, lights, sheets, shadows, framings containing the frontage).
- Native Forward+ captures on the RX 5600 XT for wide (four times), whole
  building, corridor at an angle, close-up afternoon/night/girl/walking/chunky,
  and canteen afternoon/night/inside. All were inspected. Fixes made from them:
  fog covering the sky, overly blue shade, grain from a wide shadow kernel, the
  empty road band, trees in the road, and the see-through canteen hall.
- Contact-hardening shadows caused a reproducible Vulkan device loss at the
  canteen framing and were removed.
- The browser game and browser trial were not modified.

## Limits

Approximate geometry; procedural textures; no NPCs, story, saves or doors. Motion
was checked through captures and the pixel-step design, not watched live. Mikko
should run it and judge the movement, the zoom transitions and the edge-line strength.
