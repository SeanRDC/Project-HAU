# APS hallway in Godot, with a cutaway transition

**Who:** Mikko, with Claude Code.

## What was asked

Build the APS ground-floor hallway from the APS HALLWAY photos. From outside it
must show as a detailed hallway. Walking in enters the hallway, and then only the
hallway is seen, with an animated transition.

## Decisions (Mikko chose each one)

- **The ground floor is an open corridor** behind ledgestone-clad piers, as in the
  photos, visible from the road.
- **Transition: cutaway + camera glide**, no loading screen. Stepping under the slab
  closes the view in (8.5 m), glides the camera to the corridor and tilts it down a
  little. The near plane sweeps up to just behind the piers, so everything outside
  falls away, and dark bands close over everything above the ceiling and below the
  floor. Walking out reverses it.
- **Inside view: side view along the corridor** (dollhouse), walking left and right
  as outside.
- **Scope: the whole corridor.** From west to east: the left stairs behind an open
  barred gate and the electrical room, classroom bays (brown doors, amber glass,
  white geometric grilles, signs, fire alarms, pilasters and downpipes), the high
  dark-wood strip windows over the mission/vision and quality-policy boards, the
  bell by the lobby doors, the maroon-inlay entrance tiles, Comlab 1 and 2, the
  fire-hose cabinet, the printing shop, and the right stairs. Fluorescent tubes on
  drop rods and a conduit run the whole length. Outside, on a brick patch east of
  the canopy: the bronze bust on its marble pedestal and the campus map board with
  its solar lamps (the east pots and bench made room for them).

## What changed

- New `areas/hallway.gd`. New `floor` and `ledge` textures in `world.gd`. The
  ground-floor windows, the stone sill and the east pots and bench are removed. The
  corridor is walkable and its stairs, piers, bust and map are solid.
- `aps.gd`: the `hall` weight, the shown width, the glide, the near-plane cutaway,
  the cut bands and indoor sound; 4 new checks (42 in total).
- `shaders/display.gdshader`: the `cut` bands.
- `docs/godot-art-style.md` ("Interiors (cutaway)", new materials), the Godot
  README, `CONTEXT.md`.

## Validation

- Headless `--test`: 42/42 pass, including walking in from the sidewalk (camera in,
  outside cut, student in view) and back out (everything restored).
- Captures checked: outside close, inside by the boards, Comlab 1, the left stairs,
  the bust and map, and night inside. Fixed from them: the thin front columns poking
  into the inside view (the cut plane moved back), and dark gaps between lights at
  night (every tube is lit now).

## Left unfinished

- The doors don't open; there are no rooms behind them, stairs up, or people.
- The transition was checked with scripted walks and still captures; play it to
  judge its speed (`hall` eases at rate 3.5 in `aps.gd`).
- The lantern east of the canopy stands in front of the bust from the road.
