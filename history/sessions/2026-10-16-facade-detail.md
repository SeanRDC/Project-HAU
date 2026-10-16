# Facade detail: MGN to the APS standard

**Who:** Mikko, with Claude Code.

## What was asked

After the view-lit sun, do the second reason APS looks better: its facade detail. Give
the other buildings framed windows, bands and parapets.

## Decisions

- **One shared window helper.** `framed_window(at, w, h, normal, lit, mullions)` in
  `world.gd` builds APS's `window()` look on any face (±X or ±Z): a dark frame, glass
  that glows only at night, light mullions and rails, a sill and a head. New buildings
  should use it instead of bare glass boxes. APS's own `window()` is unchanged.
- **MGN first.** It had flat dark glass boxes and plain blocks. SJH already got framed
  windows in its polish pass, and the gym has white-framed awning grids and louvres,
  so they were left as they are.

## What changed (`areas/mgn.gd`)

- **Framed windows everywhere:**
  - the classroom fronts in the corridors (two mullions each)
  - the backs of the long block and the north block
  - the north block's paired windows on the north face (seen from the middle road)
    and its slits on the east face
  - both long faces of the south wing
  - the wing's narrow windows
- **Box windows:** the wing's deep box windows are split into three panes by mullions.
- **Floor bands and parapets:** new `_floor_bands()` and `_parapet()` add thin white
  bands at each floor line on the plain faces, and a parapet with a coping on the
  north block and the south wing.
- **AC units:** split AC units on brackets under the north face's window pairs.

## Validation

- Headless `--test`: all pass.
- Captures checked: MGN in the afternoon (whole and close up), at night, and from the
  middle road.

## Left unfinished

- A photo-matched polish pass per building (the third reason APS looks better).
- MGN's corridor block reads a step darker than its wing on purpose (the corridors are
  in shade in every photo).
