# 2026-10-16: the boy as a rig, and NPCs in the Kazoku look (Godot)

**Who:** Mclaren, with Claude Code (and the PixelLab API for the early walk tries).

## What was asked
Give the boy a walking animation in Godot from a new reference (no tie, black pants, no sunset light baked in), make it natural and smooth with steady eyes, fix stray and missing pixels, animate the hair, add more to the idle, then make it more detailed. Then pull the team's updates and add NPCs "like Bokura no Kazoku".

## Decisions
* **The boy is a rig, not generated frames.** PixelLab redrew his face every frame (the eyes changed shape, looked different ways and blinked at random) and its walks were half cycles that slid sideways. The rig in `assets/drafts/characters/boy/three-quarter/rig/Rig.cs` cuts his reference into parts and animates them, so every frame keeps his drawing:
  * the head is his own, bobbing with the step; the crown of hair and the backpack land a frame late
  * arms are his own pixels turned with **RotSprite** (Scale2x three times, rotate, sample back). A cruder rotation thinned them to sticks, and drawn tubes looked blocky. The far arm is hidden in his drawing, so it is his near arm a shade darker
  * legs and shoes are drawn at fixed widths so neither leg looks thinner: a pressed crease, knee wrinkles, a fold above the shoe, a toe shine and brown sole edge
  * a final pass fills missing pixels (small holes and notches), and slivers between the legs become the far leg's shade
* **Reference fixes:** the tie removed, pants made black, the orange sunset rim light taken off, the chin and cheek repainted (`first-frame-fixed.png`). Godot's own lighting colours him by time of day.
* **Footsteps land with his feet:** `CONTACT` in `student.gd` (0.25 of the cycle for the boy; the girl is unchanged).
* **NPCs in the Kazoku look, drawn by code** (Mclaren chose this over PixelLab): round heads, dot eyes, rosy cheeks, one hair highlight, flat colours with one shade, coloured outlines, at the student's pixel density. Kazoku itself (PS2, 2005) puts simple cartoon people on realistic backgrounds, which suits our realistic campus.
* **Talking:** E, Space or Enter. E already turns the camera, so it talks only when someone is in reach, and holding it after talking does not turn the camera.
* Names reuse the browser game where they fit (Migo, Rica, Paolo, Bianca, Coach Gab); Bea, Kuya Ben and Ate Lorna are new. Lines are Taglish with a little Kapampangan (Mayap a gatpanapun, Dakal a salamat).

## What changed
* `src/drafts/aps-godot/`: new `npc.gd`, `npcs.gd`; `aps.gd` (the cast, talk keys, `_to_screen`, `--talk` for review captures, four checks: `npcs_spawned`, `npcs_on_walkable_ground`, `npcs_wander`, `npc_talks`); `student.gd` (frame counts, `CONTACT`, the `stepped` signal timing); new sheets in `sprites/boy/` and `sprites/npcs/<id>/`.
* `assets/drafts/characters/boy/three-quarter/`: the reference and its fixed version, the PixelLab walk tries kept for reference, and the rig with `build.ps1`.
* `assets/drafts/characters/npcs/`: `NpcArt.cs`, `build.ps1`, `preview.png`.
* `docs/godot-art-style.md` (Characters), the Godot `README.md` (controls, files).

`tools\run-aps-godot.cmd --headless -- --test`: all checks true. Review: `-- --x=1.2 --z=5.0 --zoom=12 --talk --capture=<png>` shows a conversation with Kuya Ben.

## Left unfinished / known problems
* The boy's run is the walk played faster; there is no separate run cycle or front/back view for W/S.
* The girl is still the PixelLab sheet and looks less polished next to the boy.
* NPCs walk through the student (no collision between people) and have no schedules; posts never leave.
* Lines are short placeholders and need a native speaker's check, like the browser game's dialogue.
* At night the NPCs stay out; nobody goes home yet.

## NPCs redone in the style reference's look (same day)
Mclaren wanted the NPCs to match the boy's art exactly, and to move like him (three-quarter, front facing, walking left and right).
* **Tried and dropped:** code-drawn Kazoku characters (a style board of five looks) were too simple next to the boy. PixelLab `generate-with-style-v2` at 88 px came out about 60% there: crisp native pixel art with black outlines and small eyes. Removing the outline (`SoftEdges.cs`) helped but not enough.
* **What matches:** the style sheet's own characters, and edits of them made at 512 px with `edit-images-v2`, then shrunk exactly the way the boy was. The soft, painterly texture comes from that shrink. One edit costs 25 generations; the 88 px style generation cost 10.
* **The four free NPCs:** Bianca (the sheet's girl), Bea (the girl edited: ponytail, pink backpack), Migo (the sheet's second boy, tie removed and pants made black like the player), Kuya Ben (the safety-vest man, now a traffic marshal). The sunset rim light is removed from all of them, and the girls are mirrored to face right like the boy.
* **Skirts:** the grey HAU plaid from Mclaren's photo (`Plaid.cs`), shaded per pleat in three tones with a solid hem, plus hand-painted touch-ups on the girls' hands and Bianca's eye (`pixellab/touchup.ps1`).
* **Animation:** `npcs/rig/NpcRig.cs` is the boy's rig with his numbers moved into per-character setups (`NpcCast.cs`): arm cut-outs (by lightness, by lightness without the backpack, or by area for Kuya Ben's dark sleeves), shoulder and elbow pivots, backpack columns, hips and leg lengths, pants colours or skin legs with socks, eyes for the blink, and the mouth for a new 4-frame talk loop. The far arm is the near arm a shade darker, as for the boy.
* **Then the other four** (Mclaren asked for more): Rica (the girl with a black bob, no backpack), Ate Lorna (the girl as a canteen cook: bun and hairnet, red shirt, apron, dark pants), Paolo (the second boy with a buzz cut, glasses and a green backpack) and Coach Gab (the vest man in a green tracksuit, whistle, white sneakers), each a 512 px edit (25 generations, 100 in all), shrunk the boy's way, outlines softened (`SoftEdges.cs`), Rica in the plaid. The rig gained an apron option (Ate Lorna's legs walk under her apron) and per-character shoes (Coach Gab's sneakers). `pixellab/shrink.ps1` is the shrink step.
