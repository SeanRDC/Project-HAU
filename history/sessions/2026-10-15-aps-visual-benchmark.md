# APS visual benchmark

## Who and request

Mikko, with Codex. Requested better graphics, shadows and lighting, specified
Until Then as the visual target, then approved doing APS first for review.
Also requested opening the dev server; opened the APS afternoon preview.

## Decisions

- Build a reviewable APS exterior in the current browser game. Keep the planned
  Godot migration separate from this first art-direction benchmark.
- Preserve the campus layout, student sprites, interactions, controls and saves.
- Favor dimensional architecture, warm/cool separation and directional shadows;
  reduce the existing full-frame sunlight wash and lamp bloom on APS.
- Other scenes retain the prior lighting. New shared actor-lighting behavior is
  optional and enabled only by APS.

## Changes

- `src/game/art/aps-lighting.ts`: APS architectural recesses and roof planes,
  pavement material, finer foreground branches/ferns, baked wall foliage shade,
  directional canopy/prop shadows, night pools and sparse daylight motes.
- `src/game/scenes/aps.ts`: integrate the benchmark, mask window emission behind
  the new roof plane, retain the prior scene layout and travel routes.
- `src/game/types.ts`, `src/game/area.ts`: optional sunlight configuration,
  weather-aware scene view, isolated sprite shading and silhouette ground shadows.
- `docs/aps-visual-benchmark.md`: review URLs and implementation limits.

## Validation

- `npm run check` and `npm run build` pass.
- `npm run check:links` passes, including APS lobby, canteen, lawn, halls and gym
  travel, the existing walking check and campus map check.
- Headless Chrome captures: entrance at noon/afternoon/night, canteen, garden,
  rain, a character in direct sun, and a mobile landscape viewport. No runtime
  exceptions. Captures and the local capture script are in ignored
  `builds/aps-review/`.
- Browser assertions pass: morning/afternoon shadow direction reversal, shorter
  noon projection, sunlight off at night, reduced sunlight in rain, and stronger
  character shade beneath the canopy than on the open road.

## Limits / next review

This is an initial Canvas benchmark, not full Until Then asset fidelity or a 3D
renderer. Static objects use authored 2D shadow projections; wall leaf shadows
are baked. The user should review APS before any other campus areas receive this
treatment. No new touch controls; mobile is a visual check only.
