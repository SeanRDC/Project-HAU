# The walk along the chapel's south side

**Who:** Mikko, with Claude Code.

## What was asked

Build the chapel's right-hand (south) sidewalk from 8 new photos (CHAPEL RIGHTSIDE
SIDEWALK), plus the chapel's south wall itself. The walk goes west to east: from the
plaza's south end along the chapel, SJH and the parking on the right, to the picnic
sheds by the east road. Copy the photos into the repo, but not the ones with cars in them.

## Decisions

- **Its own area, `areas/chapel_south.gd`.** The path is a smoothed centre line
  (`PATH`, Catmull-Rom); walking, collisions, floor heights and the grass all ask it.
  The dirt is clipped round the chapel and the Formation Center's plot, so the plot's
  pad still shows.
- **The camera faces north at the chapel along the walk** (the default view). The road
  and SJH behind it are cut away with the near plane, through the ground line just
  past the road, so the parked cars nosed in to the grass fill the bottom of the view,
  as in the photos. At the west end the chapel's view takes over, at the east end the
  gym's.
- **The chapel-side cars are nosed in to the grass** (they faced the road), and park at
  a slant (`Sjh.SLANT`, 0.44 rad, bays `SLANT_BAY` 2.9 m apart) with slanted bay lines,
  as in the RIGHT SIDE DETAILS photo. Their collision follows the slant.
- **The parking, the grass and the path are one walkable piece** (Mikko: "make the
  chapel parking to sidewalk walkable"): the walk's ground reaches into the parking and
  west to where it starts. Out of a bay you walk along its slant, then over the grass.
- **More grass** (Mikko): a grass verge along the path's chapel side before the dirt
  starts, thick tufts on the strip by the cars, a few more on the dirt; the picnic
  corner is lawn worn to dirt only under the sheds, with red-tipped shrubs and a young
  tree, as in the photo.
- **The south glass hall:** the three outline edges facing the walk
  (`Chapel.south_bays()`) are glass between white double columns, a white beam, a gold
  half-moon in a white arch up to the roof bands, and wide steps with cheek blocks.
  Further east the white wall has tall narrow bronze slots over a grey plinth.
- **No palms on this walk.** The photos have foxtail and royal palms, but `_palm()`'s
  level fronds are edge-on to this low view and read as bare poles; young trees stand
  in the grass instead.
- **Bollards glow, but give no light**, like the gym's wall lamps (added to the style
  guide).
- **Photos:** only the three without parked cars went into `assets/CHAPEL/` (08 to 10);
  the repo is public and the others show plates.

## What changed

- `areas/chapel_south.gd` (new), `areas/chapel.gd` (south bays, steps solid, its south
  trees moved to the new area), `areas/sjh.gd` (car facing), `world.gd` (wiring, grass),
  `aps.gd` (the walk's cutaway, fast travel "Chapel south walk" and "Picnic corner",
  checks `walk_chapel_south`, `chapel_south_blocks` and `parking_to_chapel_walk`).

## Validation

- Headless `--test`: all pass.
- Captures: the walk at noon, 16:30 and 21:00, close and wide, and both ends.

## Left unfinished

- The Formation Center (the cream building with louvers at the east end) is still a
  reserved plot.
- The photos' palms, until palms get fronds that read from a low camera.
- The path's last stretch north beside the Formation Center to its driveway.
