# 2026-10-14: the Covered Court and the Aero Laboratory

**Who:** Sean, with Claude Code.

## What was asked
Sean added 15 photos in `assets/images/buildings/covered court beside IH/`. Build the covered court beside the IH Gym, inside and out, fully explorable. One of the photos says to leave out the parked cars.

## Questions asked, and Sean's answers
* **Which side are the bleachers on?** The IH Gym side.
* **How do you get into the Aero Laboratory?** By the small door in its yellow gate, from the covered court.
* **What is the second small court?** Badminton / multipurpose.

## Decisions
* **Which end is which.** On the plan the court runs along `u`, its gable ends facing the gym lane (the front, by the parking) and the campus wall at the far end. The long sides face the IH Gym's gable end across a 6 m lane, and Sacred Heart. The basketball court is at the front, the volleyball and badminton courts behind it, side by side, and the aero lab across the far end.
* **The front is drawn on the gym lane**, where the old generic covered court was: the gable with the fan of glass panes, the low side roofs, the open hall with its columns, and the mesh fence. No cars, as asked.
* **Inside is one long walk** (`ccourt`), the camera on the Sacred Heart side looking south-east, so the bleachers and the IH Gym beyond them are in view. The left end is the aero gate and the right end is the gym lane, the same left and right as the gym side lane scene. The two small courts are side by side across the width, so the badminton court is drawn beyond the volleyball court, further from the camera.
* **The aero gate is drawn facing the camera** at the left end, like the stage end in the IH Gym, although it really stands across the far end.
* **Inside is not to the 9 px a metre scale**, like the other interiors.
* **Ways in and out:**
  * the gym lane ↔ the front of the covered court
  * the side lane by the IH Gym's side entrance ↔ the open side by the bleachers
  * the aero gate's small door ↔ the Aero Laboratory

## What changed
* `src/game/art/ccourt.ts` (new):
  * the front, `ccFront`
  * the steel roof and portal frames, the bleachers
  * the basketball court (maroon, tan border, grey circles, winged seal), the red courts, the volleyball net and posts, the referee's ladder, monobloc chairs
  * the AERO LABORATORY gate
  * the hangar: corrugated walls, red bays, the trainer planes (ANGEL-1 and the older red-winged one), the jet engines in their frames, benches, the fan, the extinguisher, notice boards
* `src/game/scenes/ccourt.ts`, `src/game/scenes/aerolab.ts`, `src/game/story/ccourt.ts` (new). People: Dennis, Joanna and Kiko on the courts; Lance and Engr. Dizon in the lab.
* `scenes/gym.ts`: the real front replaces `coveredCourt`. The stone benches in front of it are gone, and its hotspot now leads inside.
* `scenes/gymside.ts`, `story/ihgym.ts`: a way into the covered court from the side lane.
* `game.ts`, `ui/map.ts`, `campus/streets.ts`: registered, on the C map, placed on the plan for the minimap.
* `assets/README.md`, `docs/campus-layout.md`, `history/CONTEXT.md`.

New flags: `visited_ccourt`, `saw_ccourt`, `visited_aero`, `saw_angel1`, `met_lance`.

`npm run check`, `npm run build` and `npm run check:links` pass. Each scene was checked by screenshot against the photos.

## Left unfinished / known problems
* **The Sacred Heart side** of the court (behind the camera) is not drawn; you cannot leave that way.
* **The aircraft** are drawn from three photos at angles. The older plane's markings and both planes' exact proportions are guesses.
* **`coveredCourt` in `art/buildings.ts`** is no longer used.
* **Dialogue** needs a native speaker's check.
