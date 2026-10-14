# 2026-10-15: St. Joseph Hall, MGN and the chapel from photos

**Who:** Mikko (H1enZ).

## What was asked
Redraw St. Joseph Hall from new photos, then the road round to MGN and the chapel, from photos and sketches sent one step at a time, and polish each part. The photos are in `assets/SJH BUILDING/`, `assets/MGN BUILDING/` and `assets/CHAPEL/` on Mikko's machine. They are not committed: they show number plates and people.

## Decisions
* **Going round from the chapel it is the chapel, MGN, then SJH.** MGN is its own scene (`scenes/mgn.ts`) between the chapel lawn and SJH, so you press E once to reach MGN and again to reach SJH. The lawn's way to SJH now goes to MGN, and so does the far end of the SJH scene.
* **From in front of SJH you only see the end of MGN.** MGN runs at right angles to SJH (Mikko's sketch), so the SJH scene shows just its narrow end, close by at the right-hand edge, with a side road between the two running back to a high wall.
* **The chapel's glass front stays flat and front-on.** The real front is flat glass between two end pillars. Depth comes from the room seen through the glass and from the building behind it, not from turning it to an angle like the AI reference image Mikko shared.
* **The parking in front of the chapel is an oval island** with a white kerb, the stamped-concrete road looping round it, and trees close in on both sides of the chapel standing in grass (Mikko's sketch).
* The lawn scene's tail past the chapel was tried at 400 px with the chapel's side grove and jogging path, then cut back: that side is not seen from the front. It now ends just past the last car, at the way on to MGN.

## What changed
* `art/sjh.ts`: SJH redrawn from the front photo: the tower of silver panels round cream stone and dark glass, the brown window band, ST. JOSEPH HALL in white on black, the curved canopy; both wings the same height; the silver-clad first floor, the white awning on slanted struts, brown piers, the stepped teal panels; terracotta end towers with cream end blocks on tiled bases. The statue at the end is Mary ("A Mother's Prayer for her Unborn Child"), not St. Joseph: `maryStatue` replaces `josephStatue`. New `drawMGN` and `mgnEnd`.
* `scenes/sjh.ts`: cars nosed in (`carEnd`), bamboo and a palm by the entrance, the statue on her grass island with a curved yellow kerb, the side road and high wall, and the end of MGN.
* `scenes/mgn.ts` (new), `story/streets.ts` (`mgnHotspots`), `game.ts`, `ui/map.ts` (on the teleport list), `campus/streets.ts` (`FIXED.mgn`, and new tails for `sjh` and `lawn`).
* `art/buildings.ts`: the inside of the chapel seen through the glass (ceiling, pews, the altar and its cross); new `chapelRear` (the lower white body behind it, with tall framed windows, some lit at night). The 3D rings, the night glass and `carEnd` came in the APS walk session.
* `art/props.ts`: new `layeredTree` (a shaded back canopy, side clumps, branches between the front clumps, a thicker trunk) and `treeline` (a dark row of trees far behind); `foliage` can break up its edges with leaf tufts. Only the lawn scene uses these; other scenes' trees are unchanged.
* `scenes/lawn.ts`: the oval parking and loop road, grass beds and a lawn under the trees, the dark treeline, the Formation Center's window glow kept off the chapel, and the trees cut out of the glow behind them.
* `scenes/aps.ts`: the two big trees in front of the patio removed (asked for).

## Checked
* `npm run check`, `npm run build` and `npm run check:links` pass.
* Each step compared with the photos and sketches by eye, by day and at night.

## Left unfinished / needs checking
* MGN's own scene is made up from the side photos and the MGN photos; what stands in front of it (the garden, the cars) is a guess.
* The chapel's inside, seen through the glass, is a guess: no photo of the inside yet.
* The chapel's right side (the grove, the side entrance with its arches, the black jogging path) is in the photos but not in the game; it is not seen from the lawn road.
