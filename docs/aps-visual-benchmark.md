# APS visual benchmark

The latest browser 2.5D trial is at <http://localhost:5173/aps-3d.html>.
It starts zoomed out to show APS and the canteen, with closer views available
through the framing selector or mouse wheel. See
[`src/drafts/aps-browser/`](../src/drafts/aps-browser/README.md) for controls,
scope, and checks. This separate WebGL page runs without Godot.
Use **Canteen view** or <http://localhost:5173/aps-3d.html?view=canteen> to
inspect the new canteen frontage and walk through the gap in its patio railing.

A later standalone Godot 2.5D trial is available in
[`src/drafts/aps-godot/`](../src/drafts/aps-godot/README.md). On Windows, run
`tools/run-aps-godot.cmd` from the repository root. It is a separate native scene;
the dev-server URLs below show the earlier Canvas benchmark.

The APS exterior is the first review scene for the requested Until Then-inspired
direction: crisp pixel art, dimensional architecture, warm sun against cool
recesses, directional shadows, and restrained atmosphere. This is a Canvas art
and lighting pass; it does not introduce a 3D engine or replace the student sprites.

## Review in the dev server

- Entrance, afternoon: http://localhost:5173/?area=aps&spawn=apslobby&hour=16.5
- Character in direct sun: http://localhost:5173/?area=aps&x=570&hour=16.5
- Entrance, noon: http://localhost:5173/?area=aps&spawn=apslobby&hour=12
- Entrance, night: http://localhost:5173/?area=aps&spawn=apslobby&hour=21
- Rain: http://localhost:5173/?area=aps&spawn=apslobby&hour=16.5&rain=1
- Canteen: http://localhost:5173/?area=aps&spawn=canteen&hour=16.5

Walk with A/D or arrows. T advances the clock by 1.5 hours. These query-string
previews use the existing debug mode, which does not change the normal save.

## Implemented

- A roof plane and visible thickness on the entrance canopy, pier side faces,
  recessed corridor ceilings, slab undersides, and material weathering.
- Quieter asphalt texture, kerb thickness, and perspective pavement joints.
- One sun projection shared by canopy, lantern, umbrella, foliage and sprite
  shadows. Morning and afternoon cast opposite directions; noon is shorter.
- Cool character shading under the canopy and in garden shade, applied to the
  isolated sprite so it preserves transparency and the existing half-pixel detail.
- Window emission is occluded by the new canopy roof. Lamp ground pools and
  doorway spill remain visible at night with less bloom.
- Finer foreground branches and ferns, dappled wall shadows, and sparse backlit
  motes. Direct sunlight and shadows fade during rain and disappear at night.

## Scope and limits

Only APS opts into the new lighting. Shared actor drawing has an optional path
for isolated sprite shading and silhouette shadows; other areas keep the prior
rendering. Campus layout, doors, story, controls and saves retain their behavior.

This is the first benchmark for the art direction, not final Until Then-level
asset fidelity. Building and prop shadows use authored 2D projections rather
than a 3D visibility solver; wall foliage shadows are baked and sway slightly.
Full spatial lighting, camera depth and a unified higher-detail environment and
NPC asset pass remain future work after visual review.
