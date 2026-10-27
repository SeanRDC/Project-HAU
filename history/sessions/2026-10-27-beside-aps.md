# Beside APS: the pergola island, the sheds, the lanes and the rising gym lane

**Who:** Sean, with Claude Code.

## What was asked

Fix the ground beside APS in the Godot game to match the new photos in
`assets/Fix beside aps/` one to one, using Sean's outline on the satellite picture
(`fix-outline.png`): yellow is the road's edges, blue the island, orange the vine-roofed
structure beside APS with its stone tables and chairs and the round tables under big
umbrellas. Raise the road marked ROAD ELEVATION between the Covered Court and the IH Gym.
Take the measurements from "Covered Court view can see the one we are fixing". No cars.

## Decisions

- **The Covered Court moves 4 m east** (Sean). The satellite picture has about 8.4 m from
  the road's kerb to the court (the island about 4.6 m, the parking lane about 3.8 m);
  OSM left 5 m. Only the Godot plot moves (`GODOT_PLOTS.court` in `plan.ts`, then
  `npm run export:godot-plan`); `court.gd`'s shed, ramp and pad moved with it.
- **The lane by the gym is the part that rises** (Sean): flat past the side entrance, then
  up to 0.55 m at the back. The railed ramp along the court is unchanged.
- **The blue island is the Formation Center's drop-off island** (Sean). The bell post and
  the CMO board were on the court's apron (from the same photo, misplaced) and the
  Formation Center had a second bell by its steps; now there is one bell, on the island.
- **North of the canteen's tip is a paved lane** (Sean), not the old dirt strip with sheds
  and a pergola from the earlier "FAREST RIGHT SIDE" photos.
- **No cars** anywhere in this area (Sean). The parking lane is left empty.

## What changed

- `areas/beside_aps.gd` (new): the paved lane, the kerbed island (pergola, red concrete
  tables, palms in bowls, green sheds under trees), the umbrella corner at the tip's foot,
  the parking lane. `world.gd`'s `STRIP`, `PERGOLA_POSTS` and `SHEDS` are gone.
- `areas/court.gd`: 4 m east; its shed, tree, bell and board are gone (now on the islands).
- `areas/gym.gd`: `lane_y()`, `LANE_RISE`, `LANE_TOP`; the slab is drawn up the slope.
- `areas/formation.gd`: the bell, the two-faced board and a rock on the island.
- `aps.gd`: checks `pergola_island`, `tip_corner`, `gym_lane_rises`; the yard checks follow
  the lane; fast travel "Lane beside APS" and "Pergola beside APS".

## Left unfinished / known problems

- The photos in `assets/Fix beside aps/` are not committed: they show number plates and
  students, like the other walk photos. Keep them local or ask Sean.
- The island's ends are square; on the satellite picture they look rounded.
- The pergola's tables run along it, as in "closer view for details 3"; check against the
  other photos.
- Where the rising lane ends (x 101) is the outer bound; what lies past it is not built.
