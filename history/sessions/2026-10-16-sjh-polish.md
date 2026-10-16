# St. Joseph Hall, polished

**Who:** Mikko, with Claude Code.

## What was asked

Polish the SJH building.

## What changed (`areas/sjh.gd`, new `_details()` pass, compared with the front photo)

- **Classroom windows:** white frames, a mullion, a transom and a sill on every one.
- **Balcony ceilings:** a tube light in front of each classroom, lit at night, with a
  little spill light on the balconies.
- **Teal glass panels:** joints like the tiled panels in the photos.
- **Centre tower:** its cladding is now light silver (it read dark navy) with panel
  joints.
- **Brown entrance block:** stone joints.
- **The ST. JOSEPH HALL sign:** a warm backlight under the letters at night, and
  downlights under the canopy.
- **Roofline:** an overhang and fascia along the slab, and AC units along the top floor.
- **The telecom tower:** a red-and-white lattice tower with a mast and antennas at the
  east end, where it shows over the roof in the front photo.
- **Night-only glow:** lit classrooms and the glass entrance doors use a new
  `_night_glass()`. They look like dark glass by day and glow only at night (a plain
  glow material showed its warm colour in daylight).

## Validation

- Headless `--test`: all pass.
- Captures checked: the front in the afternoon and at night, wide at noon, and close up.

## Left unfinished

- The front still faces north and reads darker than the sunny photos.
