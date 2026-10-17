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

## Talking like the browser game (same day)
Mclaren asked for the interaction to work like the browser game, with sound. `npcs.gd` now does what `src/game/dialogue.ts` does: an "E  Kausapin si …" prompt bobbing over whoever is in reach; a paper bubble with a shadow, the speaker's portrait (cut by the rig: mouth closed, open and blinking, `portrait.png`), a maroon name tag and a tail; the line typing out at 42 letters a second with a blip every third letter in the speaker's voice (`audio.gd` `blip()`, pitches from the browser's VOICES where they had one); a key shows the whole line, the next moves on; a blinking arrow when a line is out. The student stands still while talking, and the NPC's mouth moves only while the words come out. New check: `npc_talk_closes_when_away`.

## Sprite polish pass (same day)
Mclaren said the sprites looked broken and asked for a careful polish. Every sheet was scanned (`npcs/rig/check.ps1`: pieces not joined to the body, notches) and every character's key frames were checked at 5x. Fixed in the NPC rig, so all eight benefit:
* **Arm cut-outs keep only what is joined to the arm.** Shirt pixels at its edge used to float beside the far arm (Migo, Paolo).
* **The arm's own dark outline moves with it** instead of staying behind as a line.
* **The gap a moving arm leaves is filled only where a backpack or the body (3+ solid pixels) is behind it.** It used to leave a ghost block of sleeve or shirt colour in the air (Rica, Coach Gab, Kuya Ben).
* **Arms cut by area never take pants pixels, but only where the pants are** (below the hips): Coach Gab's fingertips lost their pants specks, and Kuya Ben's dark cuff stays on his arm. Kuya Ben is holding something in his near hand; it moves with the hand.
* **Pieces of 6 pixels or fewer not joined to the body are removed** (backpack specks).
* **A soft shadow under the skirt hem** on the girls' legs.
* Ate Lorna's tiny apron-tie loop is gone (3 px, it read as noise and caused a red bar).
* `build.ps1` now rebuilds all eight by default (it had only the first four, so three NPCs had silently missed fixes).

All sheets are clean by the checker; the boy's needed nothing.

## Campus sounds (same day)
Mclaren picked "sound layers" from a list of ways to get closer to Until Then. Still no audio files: `audio.gd` synthesises them like the rest.
* Road sounds (a rumble, cars, tricycles, jeepney horns) were tried and taken out the same day: the roads here are inside the campus, with no such traffic.
* **Student murmur** (five filtered-noise voices shaped into syllables) loudest near the APS front, the canteen patio, the chapel plaza and the gym; a fifth as loud at night.
* **Birds** outdoors by day, twice as often before 10:00; the crickets still take the night.
* Indoors (canteen, hallway, walkway) the murmur is muffled. It renders on a worker thread (about 0.25 s) and fades in, so starting the game does not stutter.
* New check: `campus_sounds`.

## Rain, light and depth (same day)
Mclaren picked three more from the Until Then list: rain with wet reflections, warmer cinematic light, and depth layers. Everything is in the new `atmosphere.gd`.
* **Rain** comes and goes on its own, or with G (`--rain` for captures). Mclaren chose to add it and change the rule: the art style said nothing is ever wet, so `docs/godot-art-style.md` now has an exception for the hard ground while it rains, **flagged for Sean**. The ground goes dark and glossy, puddles appear, the light goes grey; it all dries back.
* **Reflections:** screen-space reflections do not work with the orthographic camera. Lamp glints as ground decals came out as flat horizontal bars from the low camera, so each lamp now has an upright warm card standing in front of it, sized to the ground it covers.
* **Light:** shafts under the trees along the sun (morning and afternoon), leaves falling from every tree.
* Dust motes by day and fireflies at night were tried and taken out: Mclaren found the little white and green dots distracting.
* **Depth:** dark lamp posts and leafy branches drawn on a layer in front, sliding past faster than the world, were tried and taken out at Mclaren's asking.
* **Sound:** rain loop, muffled indoors; it quietens the murmur and the birds stop.
* New checks: `rain_wets_then_dries`, `leaves_and_shafts`. All checks pass.

## NPCs that react, and dialogue choices (same day)
Mclaren removed the fireflies, the dust motes and the foreground layer (they read as green and white specks and clutter), then picked two more from a list: NPCs that react, and choices in dialogue.
* **Waving:** the rig makes a fifth sheet, `wave.png` (4 frames): the near arm's elbow out to the side and the forearm up beside the head, the hand rocking. A first try with the arm in front read as a hand on the chest.
* **Noticing:** within 3 m an NPC stops wandering, turns to the student and waves once; it waves again only after the student has been 6 m away.
* **Umbrellas** in the rain, each NPC its own colour, matte like the patio umbrellas; none under the canteen roof (Ate Lorna).
* **Choices:** talks are scripts of lines and questions. Replies show on a dark card at the bottom (W/S or arrows and E, 1-3, the mouse). Some replies are remembered and change the next talk: Migo's quiz, Bea's favourite (Ate Lorna then knows you like turon), Rica's message for Paolo (and her thanks after), Bianca's nerves, Kuya Ben and the forgotten ID, Ate Lorna's sisig, Coach Gab's practice. Memory is for the session only; there is no save yet.
* New checks: `dialogue_choices`, `npc_notices_and_waves`, `npc_umbrellas`; `npc_talks` follows the scripts.

## NPC walks and waves redrawn with PixelLab (same day)
Mclaren said the NPC sheets were inconsistent and the pixels deformed (Bea, then "almost all"), and allowed PixelLab. The cause was the rig: it cut arms out of each drawing and turned them (hands blurred, cut edges on backpacks), and drew legs in code that did not match the drawing.
* **Tried:** PixelLab `correct-pixelart` on the rig's frames only tidied a few pixels; the shapes stayed wrong.
* **What works:** `animate-with-skeleton-v3`. PixelLab estimates each drawing's skeleton (`estimate-skeleton`), the rig's walk angles move it frame by frame, and PixelLab redraws the character in each pose at native size (128 x 128 canvas, drawing at 32, 16). A 12-frame walk or 4-frame wave costs 3 generations; all eight walks and waves cost about 50. Running more than two jobs at once made them fail to start, so `animate-all.mjs` runs two and retries.
* `rig/NpcSheets.cs` puts the sheets together: PixelLab walk and wave, cleaned (solid alpha, every colour snapped to the drawing's palette so walking does not change colour, specks and notches filled, lowest foot on the ground), with the rig's idle and talk. Talk no longer turns the arm (mouth only), so its hands stay sharp.
* Mclaren asked whether T-poses would help: they would help a rig cut limbs cleanly, but the redraws need no rig, so none were made.
* All sheets clean by `check.ps1`; all game checks pass.

## Migo in pxl (2026-10-17)
Mclaren had pxl (github.com/crsolver/claude-pxl, a pixel-art-as-code tool and Claude Code skill) installed for their user account, not the repo, and asked to try it.
* **Drawn from scratch** in pxl, Migo looked bad: long neck, box shapes, flat shading, helmet hair. Placing pixels by coordinates without a drawing does not work for a character this size.
* **Traced** from his reference (colours reduced by k-means) he looked like himself; pxl is good for holding and editing art, recolouring and small patches, not for drawing new poses.
* Mclaren asked for the chin to be fixed (a near-black smudge under the mouth, from the original drawing), then for it to stop changing shape in the walk (PixelLab drew it a little differently each frame), then for slight hair movement. Then: put this Migo in the game.
* `assets/drafts/characters/npcs/pxl/migo/`: `convert.mjs` turns his four game sheets (`source/`) into `migo.px.js` on one 20-colour palette, cleans the chin in the standing pose, finds the head in every frame (the step's bob, the breath) and copies that chin there (only below the mouth, so talking still opens it), moves the crown of the hair a frame behind the body and trails the tips on push-offs, and fills single missing pixels. `build.ps1` builds it with pxl into the game sheets and remakes the talk portrait. The rig's `build.ps1` now skips any NPC kept in pxl.
* The other seven NPCs still have the chin variation in their walks; not changed.
* All sheets clean, all checks pass.

## The player boy in pxl (2026-10-17)
Mclaren asked for a new, detailed main character traced from his reference, like Migo.
* Reference: `boy/three-quarter/first-frame-fixed.png` (the boy the game uses: black pants, no tie).
* **Walk:** a PixelLab skeleton redraw (`npcs/pixellab/frames/boy/walk`, 3 generations), replacing the rig's turned arms and code-drawn legs. **Idle:** his drawing from his rig, breathing and blinking. `npcs/rig/NpcSheets.cs` (now fine without talk or wave) cleaned the walk and put both in one 44 x 85 box.
* `boy/pxl/`: `convert.mjs` (from Migo's) puts both on one 20-colour palette, keeps the chin the same in every frame, moves the crown of the hair a frame behind the body and the tips back on push-offs, removes lone specks on the legs (a two-pixel speck between the knees in one frame), fills notches. `build.ps1` builds them into `sprites/boy`. His rig now writes its sheets to a temporary folder so it cannot overwrite these.
* All sheets clean, all checks pass.
