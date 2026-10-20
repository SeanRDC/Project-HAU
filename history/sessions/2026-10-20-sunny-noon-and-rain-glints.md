# Sunny noon, rain glints, and weathering onto main

**Who:** Mikko, with Claude Code.

## What was asked

Bring the `weathering` work up to date with `main` without touching the middle road
(Sean's HAU Boulevard rebuild stays as it is). Then: noon looked bland ("noon in the
Philippines is sunny"), and at night in the rain glowing blobs floated over the patio
in front of APS.

## Decisions

- **The middle road is the team's.** The flag and the warmer middle road lamps from
  the weathering session were built on the old road, so they were left out, not
  redone on the boulevard. `shaders/flag.gdshader` went with them.
- **Noon is a clear, sunny Philippine midday.** The sun was nearly overhead and weaker
  than the afternoon's, so walls had no lit and shaded side and the haze turned the
  far ground grey-green. Now: sun offset (−55, 80, 34), `#fff4de` × 1.42; ambient
  `#a9bdd8` × 0.32; sky `#3f86d0` / `#bfdcf0`; fog density 0.1; saturation 1.18,
  contrast 1.08; cloud shadows 0.5. Other hours unchanged. A warmer sun was tried
  first and turned the walls yellow.
- **Wet-ground glints only under outdoor lampposts.** Every light (stall lights,
  canopy strips, entrance lights) had a glint card, standing several metres in front
  of it; under roofs and up close they floated among tables and people. Now only
  `SpotLight3D` lamps on open ground get one.

## What changed

- `aps.gd` `_set_hour()`: the noon preset; `docs/godot-art-style.md` lighting table.
- `atmosphere.gd` `_build_puddles()`: which lamps get glints.

## Validation

- Headless `--test`: all pass.
- Captures: noon wide and on the boulevard against the old noon and 16:30; night in
  the rain at the canteen framing, before and after.

## Left unfinished

- The lampposts' pools of light are small; brighter lamps would change the style
  guide's lamp presets, so they were left for the team.
