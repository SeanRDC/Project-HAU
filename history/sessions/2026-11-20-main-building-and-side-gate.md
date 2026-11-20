# 2026-11-20: The Main Building and the side gate

**Who:** Sean, with Claude Code (over two sessions the same day).

## What was asked

- Build the Don Juan D. Nepomuceno Building (the Main Building) and the side gate in the
  Godot campus, 1:1 from the photos in `assets/MAIN BUILDINGS DJDN/` and the older
  references: the front and its grounds, the lobby, the courtyard, both gallery storeys;
  the flag circle, the walk, the gatehouse, the colonnade, the fence, the car gate.
- Design and plan: `docs/superpowers/specs/2026-11-20-main-building-and-side-gate-design.md`,
  `docs/superpowers/plans/2026-11-20-main-building-and-side-gate.md` (nine tasks). Then
  "continue" task by task, and finally "nonstop build until finish".

## Decisions

- **No cars anywhere** at the Main Building or the side gate (Sean). The bays stay empty.
- **Nothing past the fence**: no street; the gatehouse's turnstiles are as far as you go.
- **The courtyard is built as it was before the works** (the blue tarps in the new photos
  are not shown), from `INSIDE DJN BUILDING.jpg` and `CLOSER VIEW INSIDE DJN.jpg`.
- **The gate point** is where the perpendicular from the flag circle's middle meets the
  fence, (-189.9, 110.7), not the spec's "about (-187.4, 111.9)": in the photos the walk runs
  straight from the circle to the gatehouse.
- **Inside, the camera faces east** (the front's quarter turn) in a cutaway. A view wider
  than a room shows the solid rooms beside it cut by the near plane: they get a **section
  fill** (`w.sectioned()`, `shaders/section.gdshader`: back faces drawn in the cut band's
  colour), and from the lobby, where the slanted cut still leaves their outside wall in
  view, they are drawn flat dark. Whatever stands between the camera and the student is a
  fade group (the front, the front block's rooms past the lobby, the north wing west of the
  Student Center's gate passage, the glass roof, each gallery's upper floor and roof).
- **The courtyard opens out to 30 m** and the focus rises with the framing, so the theatre's
  front reads over the student (at the hallway's tight framing it showed only red floor).
- **Facing the gate the cut is a fixed line** past the flag circle's palms (38 m from the
  fence). A cut 4 m in front of the student sliced the walk's trees and left their crowns
  floating; nothing between the student and the camera hides them there anyway.
- Stairs are solid floors (0.2 m risers); upstairs is a ring; stepping off an edge is the
  storeys' drop rule (more than 0.6 m: refused).

## What changed

- `areas/djdn.gd` (new): the building, its grounds, inside (lobby, arcade, courtyard, stage,
  theatre front, galleries, masts, glass roof, three stairs, mezzanine), storeys, views,
  fade groups. `areas/side_gate.gd` (new): the flag circle, the walk, lawns and parking,
  the gatehouse, colonnade, pavilions, fence, car gate, guardhouse, angel; the fence's
  frame; the gate view and the colonnade's cutaway.
- `world.gd`: both wired in; `sectioned()`. `shaders/section.gdshader` (new).
- `areas/student_center.gd`: the courtyard gate is open (no daylight card); it leads up a
  ramp through the north wing into the courtyard.
- `aps.gd`: the front, inside, courtyard, gate and colonnade views and cuts; the fade groups
  and the inside lights; fast travel to the front, lobby, courtyard, gallery (upstairs:
  fast-travel places may carry a level), flag circle, walk, gatehouse and colonnade; checks
  `djdn_*`, `lobby_props`, `walk_into_lobby`, `walk_out_of_lobby`, `courtyard_walkable`,
  `stage_reachable`, `courtyard_cutaway`, `courtyard_gate_through`, `gallery_upstairs`,
  `gallery_no_drop`, `flag_circle`, `walk_to_gate`, `gate_view_faces_gate`, `side_gate_built`,
  `colonnade_cutaway`. Three older checks walked further than they meant to now that the
  campus goes on (`walk_into_student_center` through the courtyard gate, `walk_onto_drive`
  up the circle's steps): they stop where they meant to.
- `docs/godot-art-style.md`, `src/drafts/aps-godot/README.md`: the new files, views and rules.

## Left unfinished / known problems

- From the courtyard at the default angle the south wing's courtyard wall faces away from
  the camera and shows as a dark section strip at the right edge (as the lobby's sides do).
- A student directly east of a courtyard stair, in its 1 m strip, is partly behind it.
- The palm crowns are full but read a little like broad trees.
- The 25 new photos in `assets/MAIN BUILDINGS DJDN/` (20261019_*.jpg) are not committed.
- Rotonda 2 and SFJ stay reserved plots; the Covered Walkway along the street too.
