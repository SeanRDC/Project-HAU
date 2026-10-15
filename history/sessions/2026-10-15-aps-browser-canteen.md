# Moving-shadow polish and browser canteen

Mikko requested better shadows/lighting while moving and pointed out that the
canteen was absent from the isolated browser trial. The original Canvas APS
scene already had it; this work extends the browser scene.

Inspected walk photos 16, 18 and 20 and the existing canteen art/layout/history.
The frontage order remains long APS wing, entrance canopy, taller balcony block,
plain stair tower, then the cream five-floor canteen block. Added the tower,
classroom windows with projecting boxes, blue-gray awning and truss, red trim
and scalloped edge, stone-faced piers, food stalls, tiled steps, railing gap,
brick patio, round tables, rusty red umbrellas, and exterior fire escape.
Respected the prior correction that the ground-floor hall is open, with stalls
inside rather than a perimeter wall. The geometry remains approximate.

The student can walk right past the former x=15 boundary to the canteen and
through its rail opening. Columns, counters, railings, tables and tower block
movement; floor height follows road, pavement, entrance tiles and steps. Added
Canteen view and APS + canteen presets and `?view=canteen`. The default and Reset
show the complete extended frontage; Whole building retains the APS-only view.

The moving-shadow problem had two concrete causes: PCF samples rotated from
screen-space noise as the camera moved, and sprites faced the camera position
rather than its orthographic direction, twisting their normals and silhouettes
while walking. Sampling is now anchored in shadow-map coordinates. The pinned
Three.js shader patch is isolated to the trial. Sprites use camera direction;
camera translation follows whole render pixels. The fixed sun frustum covers
both wings with a 4096px map, lower bias and gentle filtering. Added a faint
foot contact shadow; the animated alpha-tested sprite still casts real shadows
and receives canopy/awning shadows. Canteen stall lights join the night preset.

The canteen is an exterior/open-hall graphics study, without story, NPCs, saves,
or navigation into the original game's canteen/back-hall scenes.

Validation: TypeScript and production build passed. Chrome verified fixed
billboard angle and shadow matrix during actual keyboard movement, the patched
surface-anchored filter, foot contact on the road, sun occlusion under the APS
canopy and inside the canteen awning, steps and column collision, extended road
movement, all frontage/roof bounds, night lights, touch movement and portrait
control separation. No browser/WebGL errors; original Canvas game still loads
separately. Inspected wide/entrance, moving student, shaded student, canteen
afternoon/night and portrait captures in a build/fix/confirmation pass. An
initial awning check was corrected to walk farther inside: low afternoon sun
correctly reaches the front edge before the student enters full shade.
The current trial has 1,280 authored boxes (instanced) and about 37,638 rendered
triangles including shadows in the checked view. Vite warns about the isolated
Three.js chunk size (about 143 kB gzip); no warning was hidden.
