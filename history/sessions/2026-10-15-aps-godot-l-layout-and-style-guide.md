# APS as an L in Godot, closer zoom, and the Godot style guide

**Who:** Mikko, with Claude Code.

## What was asked

- Make the Godot APS match the real layout. Mikko sketched it in Paint (the APS
  wing across the top, the canteen coming forward on the right, the road
  curving round with grass inside the bend, and a brown line that turned out to
  be the brick patio) and added 20 new photos of the corner, patio and canteen.
- The closest zoom stopped too far out.
- Write down the whole art style (shadows, lighting, shaders, graphics) so
  the team and their AI assistants can continue the Godot work in sync, then
  commit under Mikko's name and open a pull request.

## Decisions

- **The plan is an L.** The canteen wing stands forward from the stair tower
  towards the road, its stalls facing west onto the herringbone-brick patio in the
  corner (from the "ZOOM OUT OF APS BEFORE ENTERING CANTEEN" and "APS RIGHT
  ZOOM OUT" photos). The road bends a quarter turn round the patio, kerb and
  sidewalk on the patio side, lawn inside the bend (lawn-view photos).
- **The canteen is built in its old straight coordinates under a turned pivot**
  (`CanteenWing`) rather than re-placing every box. Collision is tested in the
  same local frame (`canteen_local` / `canteen_world`). This is the pattern for
  any future turned wing.
- **The camera turns with the place.** Along the APS front it looks north as
  before. On the patio it turns to face the stalls (`leg`). Controls follow the
  camera, so holding D walks round the corner.
- **Closest zoom is 5 m wide**; the camera drops to the student's height. Key 5
  is now a 10 m close-up. Auto pixel scale goes up to 8.
- **Lawn trees stay out of the canteen camera's sightline** (it sits ~30 m back
  over the lawn); otherwise they cover the stalls.
- **One style document for everyone:** `docs/godot-art-style.md`, plus a
  repo-level `CLAUDE.md` so assistants read it automatically. The browser game
  and the Three.js trial are frozen references; new 2.5D work goes to Godot.

## What changed

- `src/drafts/aps-godot/world.gd`: L layout, curved road with kerbs, sidewalk
  ring and road paint along the bend, lawn inside it, brick patio fan with
  umbrellas, two shade trees and the tower's lamp post; the stair tower split out;
  canteen roof tanks and AC units moved into the wing; `box()` takes a turn;
  new `_ground`, `_ring`, `_along_bend`, `bend_point`, `across_road`;
  `blocked()` / `floor_height()` / `clamp_position()` rewritten for the L.
- `aps.gd`: camera legs and camera-relative controls, `MIN_WIDTH 5`, close
  blend, new framings and checks (26 in total).
- `student.gd`: the sprite faces the screen-space input.
- `docs/godot-art-style.md` (new), `CLAUDE.md` (new), root `README.md`, the Godot
  `README.md`.
- Photos: `assets/images/buildings/PANERGO AND GIL APS BUILDING/corner, patio and canteen/`.

## Validation

- Headless `--test`: 26 checks pass, including the wing facing the patio, road in
  the bend, lawn blocking, walking round the corner, the canteen view facing the
  stalls and the closest zoom keeping the student in frame.
- Native captures checked: wide (APS + canteen), canteen noon/afternoon/night,
  the corner, and a 6 m close-up.
- `npm run check` and `npm run build` pass.

## Left unfinished

- The bend radius, the patio's size and the umbrella positions are estimated from
  photos, not measured. The canteen keeps its old ~29 m length, longer than in
  the sketch.
- Still not joined to the browser game's story, saves, NPCs or doors.
- Movement round the corner was checked by a scripted walk and captures; Mikko
  should play it and judge the camera turn.
