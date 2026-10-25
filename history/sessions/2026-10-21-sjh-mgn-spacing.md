# Spacing between SJH and MGN

**Who:** Mikko, with Claude Code.

## What was asked

"Fix the spacing between SJH and MGN, make sure it is not too compact", from four photos:
MGN FRONT.JPG, sjh front right to back connector.JPG (and its closeup), sjh back right
side.JPG.

## Decisions

- **Measured first.** On the plan, MGN's south wing stood 5.7 m forward of the long block,
  ~1.1 m from SJH's west wall (the cream stair tower), right under the bridge, and MGN's
  garden kerb was 3 m from that wall. The bridge session had already noted "the plots may
  be a little off there". In the photos a one-lane concrete drive about 5 m wide runs south
  between SJH's west steps and MGN's kerbed planting, and the bridge spans about 8-9 m.
- **MGN's south wing comes back flush with the long block** (`SOUTH_FRONT` 5.7 -> 0): ~9 m
  wall to wall under the bridge, which lengthens to match (it measures SJH's face). It
  could not keep its depth by growing back: MGN's back already touches the covered walkway's
  plot. The garden now runs on in front of the wing (`GARDEN_FROM`), with three more shrubs.
- **SJH moves 2 m east** (`EAST_SHIFT`; it was already off its outline by `SETBACK`), so the
  drive beside the garden is ~4.7 m, not 3. Moving MGN west instead would have pushed into
  the covered walkway's plot and opened a gap at the west road. SJH's east end is now 6 m
  from the annex's reserved plot. `ENTRANCE_GAP` and MGN's `CUT_X` (world x) moved with it;
  the parking rows and the Mary island stay where they were.
- **The lane is the drive** from the stair tower to the garden kerb (`LANE` 4.75 m,
  `LANE_BACK` to the same kerb line), with the wall at its far end as wide as the lane.

- **Then MGN's front walk (Mikko: "continue").** MGN FRONT.JPG: a brown zigzag-paver walk
  runs from the drive's kerb in at a slant through the garden to the corridor, between
  low white kerbs. Built in `_walk()` (`WALK_FROM`, `WALK_TO`, 1.6 m wide), laid just
  over the grass at 0.32 m (the garden is one grass box, so it cannot sit below it as in
  the photo), walkable from the drive (`in_walk`; the garden stays solid either side). A
  palm, a shrub and any rocks on its line moved off it. New check `mgn_front_walk`. The
  captures did not catch it (that stretch is between camera views); it is checked, not
  seen.

- **Then the middle and MGN's north end** (Mikko, with "mgn and Sjh middle.jpg", "mgn
  rightside to sidewalk.jpg" and IMG_6063). Asked first: the drive starts off the road's
  bend; Mary gets the big lawn; IMG_6063 is "another MGN entrance"; where the north-end
  forecourt is, Mikko was not sure.
  - **The drive** (`Sjh.DRIVE`, a curve from the bend's kerb to the lane, 4.4 m) runs round
    the Mary lawn along MGN's garden kerb, in concrete, walkable.
  - **The Mary lawn** (`Sjh.lawn()`): one lawn from the drive's kerb round the road's
    sidewalk to the SJH front strip and the ramp, behind a yellow-painted kerb, replacing
    the small island; her bed of shrubs stays. Solid.
  - **MGN's north entrance**, my reading of the photos: the forecourt with the bins is on
    the north block's face to the west road, between the wing's open stair and the
    boulevard's covered walkway (the photo's covered walkway and red pavers are the
    boulevard's). A raised forecourt (`FORECOURT`, 0.25 m) of pale grey squares in dark
    grout bands behind a white kerb, the first floor's overhang on two square pillars with
    the dark lobby behind, a grated drain at the road, yellow/green/blue bins and potted
    plants; red octagon pavers (`CORNER`) to the walkway with the road kerb painted yellow.
  - New checks `mgn_north_entrance`, `mary_drive_and_lawn`.

- **Corrections from Mikko (screenshots 1170/1173 with red markings, MGN FRONT.JPG, mgn and
  Sjh middle.jpg; "don't hallucinate, base it on the photos").**
  - **The curve at MGN's right side:** the paving at the boulevard's corner is one paved
    sweep, not a rectangle. The kerb now curves from the west road into the south lane
    (`MiddleRoad.CORNER_R` 2.5 m, yellow; outside it the lane's road, at road height), the
    loop's grey sidewalk is paved in red octagon pavers from that curve down to MGN's
    forecourt (`PAVED_TO`), the opening in the sidewalk and kerb (`Roads.OPENINGS`) runs to
    the curve's end, and the south lane's kerb starts there. The yellow strip I had put by
    the forecourt is gone (the photo's yellow is only at the curve).
  - **The walk is beside the Mary statue:** `WALK_FROM`/`WALK_TO` moved so it leaves the
    drive's kerb opposite her (z 119.5, she is at 119.3); the palm and shrub moved for its
    old line are back. The `mgn_solid_and_garden` check's garden spot (0, 2) now lies on the
    walk, so it tests (5, 2) instead.
  - **The Mary statue, checked against CLOSE UP RIGHT SIDE.jpg and mgn and Sjh middle.jpg:**
    the pedestal is square (a plinth, the white shaft, a cap in two steps, the plaque on
    its front face), not octagonal; on her chest a white rose with a blush-pink heart and
    two leaves, not a pink heart with a flame; the mantle a clearer pale blue (it read as
    white). Her arms held out and down in bell sleeves were already as in the photos.
  - **Her lawn's kerb is rounded** (the outline's corners cut twice), as in the photos.

- **"Fix this, merge it well and polish"** (screenshot 1176, the free cam over the drive):
  the walk was a dark slab lying on the garden behind its kerb wall, not joined to the drive.
  Now it runs straight in (`WALK_X`, opposite Mary) so the garden splits cleanly into two
  beds, each with its own kerb wall, and the walk is sunk between their white-kerbed faces,
  rising from the drive's level to the corridor floor (`WALK_Y`, `walk_height`), in a lighter
  red-brown, as in MGN FRONT.JPG. The palm beside it moved 1.5 m off its line. The garden's
  rocks were black cubes: grey now, lower and tilted.

## What changed

- `areas/sjh.gd`: `EAST_SHIFT`, `LANE`, `LANE_BACK`, `ENTRANCE_GAP`, the end wall.
- `areas/mgn.gd`: `SOUTH_FRONT`, `GARDEN_FROM`, `CUT_X`, the garden and its shrubs.
- `docs/godot-art-style.md` (the SJH and MGN rows).

## The walk angled, the bridge on the third floors

Mikko marked the walk on screenshot 1178: it runs at an angle, not straight in. It now
leaves the drive opposite Mary and slants 3 m north to the corridor (`WALK_SLANT`); the
beds' ends by it are filled with grass wedges and its kerbs follow the slant. The
bridge is on the third floor (Mikko); it already sat on MGN's (7.0 m) but SJH's third
floor is 7.5 m, so the deck now rises between the two.

## Checks

`--test`: all true. `npm run check`, `npm run build` pass. Captures from the lane's north
end (before and after): before, SJH's stair tower and MGN's south wing nearly touched and
the bridge was hidden; after, the gap is open and the bridge shows across it.

## Left unfinished

- The forecourt's place on the north block is a reading of the photos (Mikko was not sure); the lobby behind it is a dark panel, not walkable.
- The drive's kerb with the lawn is one polygon: its corners by the road are not rounded as in the photo.

- The walk's slant (3 m) is read off a screenshot sketch, not measured.
- The walk's pavers are the `brick` texture tinted brown, not the photo's zigzag pattern, and it ends at the corridor's face (the ground floor is not walkable).
- Near the lane the camera is between views (SJH's cutaway and the overview), so the spot is hard to see in play.
- The road behind SJH (sjh back right side.JPG) is not built; the lane still ends at a wall.
