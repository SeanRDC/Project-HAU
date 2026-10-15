# APS browser graphics trial

Run `npm run dev`, then open <http://localhost:5173/aps-3d.html>.
This separate Three.js/WebGL 2 scene explores the approved Until Then-inspired
direction in the browser. Godot is not required to run it.

The default **APS + canteen** view shows the full frontage, including the stair
tower and canteen wing, with a small student for scale. **Whole building** gives
the previous APS-only view. Scroll or use the view selector to zoom closer.
Reset returns to the wide afternoon view. Portrait phones put controls outside
the scene to keep the building visible.

| Control | Action |
| --- | --- |
| A/D or left/right | Walk along the frontage |
| W/S or up/down | Walk towards the building or road |
| Shift | Run |
| Q/E or Camera | Change camera angle |
| Scroll, +/− or view selector | Zoom |
| T or time selector | Morning, noon, afternoon, night |
| C or Character | Switch boy/girl |
| R or Reset | Restore starting position and wide camera |
| H | Hide/show help |
| Onscreen arrows | Touch movement |

URL options: `hour=8|12|16.5|21`, `zoom=22..110` (larger means wider),
`char=boy|girl`, and starting `x`/`z` coordinates.
`view=canteen` starts at the canteen patio with a closer camera.

Walk right from APS to reach the canteen, or select **Canteen view**. The new
frontage includes the cream classroom block, stair tower, blue-gray awning,
stone-faced pillars, open stalls, tiled steps, brick patio, umbrellas and tables.
Use the gap in the front rail to enter. The open hall is walkable; counters,
columns, railings and tables block movement. It is a spatial graphics trial,
with no canteen dialogue or original-game scene transitions yet.

Shadows use a fixed world-space 4096px sun map with surface-anchored PCF
sampling, reduced normal bias, and a soft foot contact shadow. Orthographic
sprites align to the camera direction, preserving their lighting and shadow
angle while walking. Camera follow advances in render pixels to reduce edge
crawl. Canopy, awning and umbrella geometry shade the student; stall lights
turn on at night.

The scene uses spatial architecture, directional shadows, shadowed student
sprites, procedural pixel textures, and night lamps. It renders at 640×360 with
nearest scaling and reuses the original PNG sprite sheets. Repeated box geometry
is instanced. The original Canvas game remains at `/`; this trial is a separate
build entry with no story, NPC, save, or campus navigation integration.

The browser lighting now follows the supplied native-trial screenshot: matte
diffuse materials, brighter gray shade, cream walls, muted window reflections,
and quieter surface grain. Entrance framing uses the reference's lower camera
angle. The image scales to the available window instead of stopping at integer
display sizes; the underlying pixel render remains 640×360. Manual zoom is
labeled Custom zoom until a named framing preset is selected again.

This is an art and technology trial, with approximate architecture and procedural
materials. It is not finished reference-level artwork or a campus migration.
Three.js loads only on this page.

Verification: `npm run check`, `npm run build`, then, with the dev server running,
`npm run check:aps-browser`. Chrome is required; set `CHROME` if not found.
`-- --capture` saves screenshots under ignored `builds/aps-browser-review/`.
For the built page, start `npm run preview`, set `GAME_URL` to its address, and
run `npm run check:aps-browser -- --production`.
