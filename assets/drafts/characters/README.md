# Characters

The sources for every character in the Godot game: the player boy and girl and the eight campus NPCs. The game loads none of these files directly. The scripts here build the sheets it does load, in `src/drafts/aps-godot/sprites/` (`idle.png`, `walk.png`, and for NPCs `talk.png`, `wave.png` and `portrait.png`).

Every character matches `style-reference.png`: soft, painterly pixels at about 46 px per metre, no baked-in sunset light (the game lights them by time of day). The rules are under "Characters" in `docs/godot-art-style.md`; the full story of how they were made is in `history/sessions/2026-10-16-godot-npcs-and-boy-rig.md`.

## The player boy (`boy/`)
* `pxl/` - **what the game uses.** `convert.mjs` puts his walk (a PixelLab skeleton redraw) and his idle (from the rig, breathing and blinking) on one 20-colour palette in `boy.px.js`, keeps his chin the same in every frame and moves his hair a frame behind the body. `build.ps1` builds it into `sprites/boy/`.
* `three-quarter/` - his reference (`first-frame-fixed.png`: no tie, black pants, no rim light), the PixelLab walk tries (`walk-a`, `walk-b`, `walk-c`, `walk-steady`) kept for comparison, and `rig/Rig.cs`, the rig that cuts his drawing into parts and animates them. The rig writes to a temporary folder so it cannot overwrite the pxl sheets.
* `awake/`, `directions/`, `hi-res/` - the PixelLab sheets made for the browser prototype (idle, walk, talk, tired, eight directions). Kept for reference.

## The player girl (`girl/`)
PixelLab sheets from the browser prototype: references, directions, idle, walk, talk, the tired stance, talking portraits and emotions, and a soft-outline test. The Godot girl in `sprites/girl/` comes from these and has not been redone like the boy yet.

## NPCs (`npcs/`)
Migo, Bea, Bianca, Kuya Ben, Rica, Paolo, Ate Lorna and Coach Gab. Each is an edit of the style sheet's characters made at 512 px, then shrunk the way the boy was.
* `pixellab/` - the edits and finals (`<name>-final.png`), `animate-all.mjs` (skeleton-posed walk and wave redraws, two jobs at a time with retries), `shrink.ps1`, `touchup.ps1`, and `frames/<name>/` with each walk and wave and the skeletons that posed them.
* `rig/` - `NpcRig.cs` and `NpcCast.cs` (the boy's rig with per-character setups, for the idle, talk and portrait), `NpcSheets.cs` (cleans the PixelLab walk and wave and puts every sheet together), `build.ps1` (rebuilds all of them, skipping any kept in pxl) and `check.ps1` (finds loose pieces and notches; every sheet should come out clean).
* `pxl/friend/` - the player's friend from the opening (no name yet): drawn in pxl over the redesigned player boy (`boy/pxl-new/`), so same body and size, with a black wolf cut (curtain bangs, middle parting), his own narrower half-lidded eyes, a black hoodie and a navy backpack. Idle and talk portrait only so far (no PixelLab key was at hand for a walk); `build.ps1` builds them.
* `pxl/migo/` - Migo kept in pxl, like the boy: his chin cleaned and steady in every frame, his hair moving in the walk. `build.ps1` builds his sheets and portrait.
* `Plaid.cs` - the grey HAU skirt plaid, shaded per pleat. `SoftEdges.cs` - softens the outlines.

## Cutscene art (`cutscene-art/`)
The reference for how each character looks in the full-art cutscenes and flashbacks (drawn art, like Omori; the game world stays pixel art). Not loaded by the game.

**The canvas for full pixel art is 256 x 384** (half body, head to waist); the rule is under "Full pixel art (cutscene portraits)" in `docs/godot-art-style.md`. Each `<name>.png` is its `<name>-source.png` (1024 x 1536) converted to true pixel art at 256 x 384 with PixelLab, in faithful mode starting from the picture, so nothing is redrawn: `node tools/pixellab-convert.mjs <name>-source.png <name>.png --size=256x384 --strength=150`. They keep their sources' backgrounds. Redrawing instead (`tools/pixellab-styled.mjs`) drifted from the sources, so don't.
* `lance.png` - Lance at school: messy golden-brown hair, tired brown eyes, white short-sleeve polo with an open collar and no tie, maroon backpack with black buckles.
* `lance-older.png` - Lance ten years later: shaggy auburn hair past the jaw, light stubble, a dark open overshirt over a black t-shirt. His hair is a deeper red than at school, as in the source. After converting, the whites of his eyes were made skin (shaded under the lid) by hand, so his eyes are drawn like young Lance's: a dark lid line over a rounded iris, no whites. Redo that if he is converted again.
* `pat.png` - Pat: very long dark brown hair with loose strands and bangs between the eyes, white blouse with an open collar, black backpack straps, grey and red plaid skirt.
* `ysha.png` - Ysha: shoulder-length wavy golden hair, white-framed glasses, an orange cat lanyard with an ID card, navy backpack straps, grey and red plaid skirt.
* `pat-older.png` - Pat ten years later (draft): shoulder-length dark brown hair, a pendant necklace, a dark open jacket over a white top, a belt and a bag strap. Eye whites made skin by hand, like older Lance's.
* `ysha-older.png` - Ysha ten years later (draft): short messy golden hair, no glasses, a loose white t-shirt and dark jeans. Eye whites made skin by hand, like older Lance's.
* `paeng.png` - Paeng (Rafael Sicat), Lance's friend: wavy black curtain hair past the ears, a black hoodie with white drawstrings, hands in the pocket, navy backpack straps. **Not made by PixelLab** (it was out of credits on 2026-11-14): the source, cropped to 2:3, was converted on this computer in two steps (needs Pillow and numpy): `python tools/pixelart-local.py paeng-source.png raw.png --merge=5` (256 x 384; never averages: each pixel is the most common real colour of its cell, thin lines are found first and drawn one pixel wide, leftover blends are removed), then `python tools/cutscene-grade.py raw.png paeng.png --eyes=92,92,166,114`, which recolours it to the cast's look, since the source is pink and purple-tinted with near-black lines and white eyes: the cast's beige wall, warm brown-black, their skin tones, and eye whites made skin. The older one: `--eyes=94,93,168,110 --older`. Shrinking by averaging was tried first and left orange and blue specks along the hair, so don't. Convert it with PixelLab like the others when there are credits.
* `paeng-older.png` - Paeng ten years later: short swept-back black hair, a black polo with cream-tipped collar and sleeves. Made the same local way as `paeng.png`. The laurel on the chest is a real clothing brand's logo; swap or remove it before release. After converting, his mouth was redrawn by hand (the conversion left it in three colours with stray pixels above and below): one line of (64, 48, 41) on row 132 from x 123 to 138, with a pixel a row lower at each end (122 and 139), as his source's mouth turns down slightly at the corners. Redo that if he is converted again.
* `cast-draft.png` - the cast side by side, at school on top and ten years later below (Lance, Pat, Ysha, Paeng).

## Adding a character
1. Edit one of the style sheet's characters at 512 px and shrink it with `npcs/pixellab/shrink.ps1`.
2. Add their setup to `npcs/rig/NpcCast.cs`. Put their drawing in `npcs/pixellab/frames/<id>/reference.png`, estimate its skeleton (`skeleton.mjs`), add their look to `animate-all.mjs` and redraw their walk and wave with it (`PIXELLAB_API_KEY` in the environment; about 6 generations).
3. Run `npcs/rig/build.ps1`, then `npcs/rig/check.ps1`.
4. Add them to the cast in `src/drafts/aps-godot/npcs.gd`, open the Godot project once so the sheets import, and run the checks.
