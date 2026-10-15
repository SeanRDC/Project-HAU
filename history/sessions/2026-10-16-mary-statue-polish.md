# The Mary statue, polished

**Who:** Mikko, with Claude Code.

## What was asked

Polish the Mary statue in front of SJH, and its grass and details.

## What changed (from the "CLOSE UP RIGHT SIDE" photo)

- **The figure** is rebuilt from smooth turned shapes (a new `_lathe()` helper in
  `areas/sjh.gd`). It has a white robe with a gentle unborn-child belly; a pale-blue
  mantle over her head, open at the front and falling down her back; a veil framing a
  pale face turned a little down; arms held out and down in wide bell sleeves with
  hanging folds and open palms; and a pink heart with a gold flame on her chest.
- **The pedestal** is octagonal with a flat face to the road, a wide base and a
  capping slab. It carries a black plaque with a title and lines of the prayer, and a
  ring of yellow, white and orange flowers over green leaves at her feet.
- **The garden:** lush grass tufts on her island (clear of the pedestal), green
  trimmed hedges (new `HEDGE_COLORS`; `_shrub()` now takes a colour set) mixed with
  the red-tipped shrubs, and the bamboo behind her.
- **A ground lamp** in the lawn in front lights her at night. It has no shadow on
  purpose: from that low, the flowers cast jagged stripes up her robe.

## Validation

- Headless `--test`: all pass.
- Captures checked close up at noon, the garden in the afternoon, and at night.
