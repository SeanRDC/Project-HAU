# Weathering and atmosphere

**Who:** Mikko, with Claude Code.

## What was asked

How to improve the art style further. Of the suggestions, do the first two together:
weathering, and atmosphere that moves (cloud shadows, a waving flag, night light
pools). On a separate branch (`weathering`, from `facade-detail`) so Mikko can test it
first.

## Decisions

- **Weathering as a material pass, not per building.** `material()` gives the
  `WEATHERED` kinds (stucco, concrete, brick, stone, ledge) `shaders/weathering.gdshader`
  as a `next_pass`: a multiplied, world-space grime band at the foot of vertical faces
  in three hard steps, and faint paint patches. Every existing and future building gets
  it for free.
- **Tried first: tagging walls by roughness and reading it in `edges.gdshader`.** The
  normal-roughness buffer did not give back the roughness reliably, so it was dropped.
- **Rain streaks as geometry.** `streak()` lays a multiplied card (two procedural
  patterns) under each sill; `window()` and `framed_window()` call it, so APS, MGN and
  every framed window have them.
- **Cloud shadows in `edges.gdshader`.** It already reads depth, so it rebuilds the
  world position, follows the ray to the sun up to a cloud deck and darkens in two hard
  steps. Off at night.
- **Dropped later: the waving flag and night pools on the middle road.** Both were
  built on the old middle road. Sean rebuilt it as HAU Boulevard on `main`, so on
  2026-10-20 the team's boulevard was kept as it is and these two were left out (see
  `2026-10-20-sunny-noon-and-rain-glints.md`).

## Validation

- Headless `--test`: all pass. `npm run check` and `npm run build` pass.
- Captures: APS and MGN wide and close, SJH, the flagpole, and the middle road at
  night.

## Left unfinished

- The grime band is measured from world height 0, so upper storeys and raised
  floors get little of it.
- PGN's photo-matched polish pass is next.
