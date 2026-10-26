# Project Context

**How cutscenes look, 2026-10-27.** Inspirations: Until Then (feel), Omori (storytelling),
A Space for the Unbound (character look). Pixel art stays in the game world; cutscenes and
flashbacks are drawn art, not pixel art. The cast's cutscene references are in
`assets/drafts/characters/cutscene-art/` (Lance, Pat and Ysha at school and ten years later,
side by side in `cast-draft.png`): Mclaren's
pictures converted to pixel art at 256 x 384 by PixelLab's faithful mode
(`tools/pixellab-convert.mjs`), not redrawn, which drifted. How the drawn scenes are made is
still to be tried. See `sessions/2026-10-27-cutscene-direction.md`.

**3D cutscene characters, 2026-10-23.** Characters who matter in cutscenes become low-poly
3D models drawn like the pixel portraits, so cutscenes need no generated pictures. Lance is
first: built by `tools/blender/lance.py` into `models/lance.glb`, shown by `actor.gd` with
two tones a part (`toon.gdshader`), a one-pixel black line (`outline.gdshader`) and eight
swappable pixel faces. `tools\view-actor.cmd` shows him alone to turn and zoom;
`--actor-capture=<dir>` renders him to pictures. He is not in the game world. No rig yet; Pat and Ysha next. The three portrait sheets were also rebuilt to one
grid and palette (`assets/drafts/characters/portraits/`). See `docs/godot-art-style.md`
("Cutscene characters (3D)") and `sessions/2026-10-23-lance-3d.md`.

**The opening's story, 2026-10-21.** The opening now tells the game's story (draft in
`src/drafts/aps-godot/opening/STORY.md`): Lance remembers the campus and Ysha, the girl he
lost on November 11, 2026, and wakes in his old classroom in June 2026. Ten pages, campus
photos standing in for drawn panels; `opening/SCRIPT.md` has every line. Contains
depression and suicide themes (nothing shown; content warning and help line required).
`tools\preview-opening.cmd` shows every screen on one sheet. See
`sessions/2026-10-21-opening-story.md`.

**The opening can't be skipped the first time, 2026-10-21.** Space and Esc only move on
until the opening has been watched to the end once on that computer (`user://opening.cfg`);
after that, hold Space (or Esc) skips it as below. `--opening-first` replays the first
time. See `sessions/2026-10-21-opening-first-time.md`.

**Cat animations, 2026-10-21.** Sitting cats now and then flick the tail, blink, groom or
yawn (`FIDGETS` in `critters.gd`); asleep they breathe, they wake with a stretch, and a petted
cat leans into the hand with its eyes closed. Run at one and it gallops off; maya hop with their own frames. PixelLab frames from the existing cat, cleaned in
pxl (`pixellab/run.mjs` sends a request; the blink is drawn in `convert.mjs`). See
`sessions/2026-10-21-cat-animations.md`.

**Atmosphere, 2026-10-21.** T now steps through dawn, morning, noon, afternoon, golden hour,
dusk and night (`PRESETS` in `aps.gd`); windows and lamps light at dusk and dawn. G steps
through the weather (clear, overcast, rain, thunderstorm with lightning and thunder, windy), which also changes on its own. Golden-hour shafts and dust. See
`sessions/2026-10-21-atmosphere.md`.

**Chapel parking from the road, 2026-10-21.** The lawn between the west road and the chapel's
oval parking is walkable (`Chapel.roadside`, z 42..78), so the parking can be reached from the
road anywhere along it, not only by the drive. The planted island stays solid.

**Cats and birds, 2026-10-21.** `critters.gd`: a dozen campus cats (five named spots, seven scattered)
who sit, stroll, sleep, visit you and can be petted (E), and maya flocks scattered over the open ground that peck by day, groups flying over,
and flutter off when you come close. PixelLab frames cleaned in pxl
(`assets/drafts/characters/critters/pxl/`, `build.ps1`; Node 22.18+). See `sessions/2026-10-21-cats-and-birds.md`.

**NPCs say hello, 2026-10-21.** As they wave, some NPCs say hi (each with its own chance, `CHATTY`) in a small bubble (their own
line, another once you've met, or one for the hour or the rain, some in Kapampangan);
standing about, they look your way from 6 m. `HELLOS` in `npcs.gd`. See
`sessions/2026-10-21-npc-hellos.md`.

**Camera turn, 2026-10-21.** A ±45° turn was tried and taken back (the views broke down
turned that far): Q/E and right-drag turn ±0.25 rad as before (`ORBIT_MAX`), and the turn
now eases after the mouse (`orbit_goal`). See `sessions/2026-10-21-wider-turn.md`.

**The camera centres the student top to bottom, 2026-10-21.** Dead centre close up;
zoomed out it stops where the frame's lower edge would go under the ground, so the
student sits a little low there (centring fully would need steeper angles than the
style's). See `sessions/2026-10-21-camera-centre.md`.

**The night sky, 2026-10-21.** `shaders/sky.gdshader`: varied, tinted, slowly twinkling
stars (the brightest with a pixel cross), a faint Milky Way band and the moon with a
glow where the night light comes from; rain hides them. In the F2 free cam the sky is laid
out by direction (`free_look`), so it stays put as the camera turns. `--free-cam=<yaw>,<pitch>`
for captures. See `sessions/2026-10-21-night-sky.md`.

**SJH's ground floor, 2026-10-20.** `areas/sjh.gd`: the cars park at road level and the
ground floor is raised 0.9 m (`WALK_Y`) on a plinth behind an unbroken railing; along
the whole front grass, shrubs and bamboo (0.5 m) with the brown paver sidewalk winding
through it, a low wall at the kerb, the front row of cars parked against it. SJH now stands 12 m back (`SETBACK`, was 10).
Clad piers, bar tables, bins, a diamond-tiled floor (`diamond` in world.gd). The centre
tower opens into the elevator lobby up a long stair from the kerb: 5 steps (between the
handrails, grass either side), a 2 m landing, 4 steps.
At the west end a passage through the terracotta block leads to steps, a ramp, a yard
and the lane to MGN under the bridge (MGN's, from #33; this branch's own bridge was
dropped in the merge). `--view=sjh-walkway`, `sjh-lobby`,
`sjh-west`, `sjh-steps`. See `sessions/2026-10-20-sjh-ground-floor.md`.

**Hold Space to skip the opening, 2026-10-20.** Holding Space for 0.9 s skips the
opening (a tap still moves on; Esc still skips at once), with a "HOLD SPACE TO SKIP"
hint and a filling pen line in the page's bottom-right margin. See
`sessions/2026-10-20-opening-hold-skip.md`.

**The SJH–MGN bridge, 2026-10-20.** A covered bridge joins MGN's south wing (the service
block) to SJH's west face at the third floor (`_bridge()` in `areas/mgn.gd`): concrete
deck, parapets, steel rail, ribbed tin roof. Scenery only, and hidden from the game
cameras behind SJH's stair tower (F2 free cam shows it). See
`sessions/2026-10-20-sjh-mgn-bridge.md`.

**Right-drag camera angle, 2026-10-20.** Holding the right mouse button and dragging
turns the camera angle like Q/E (same ±0.25 rad orbit, `DRAG_TURN` in `aps.gd`), the
cursor hidden while held. Not a full 360° turn: the zones' cuts assume their facing.
Every framing now follows the student across the screen, wide ones too, and wide frames
are raised over the outdoor cuts so no empty band shows under SJH, MGN or the boulevard. See
`sessions/2026-10-20-camera-right-drag.md`.

**The chapel's south walk, 2026-10-20.** `areas/chapel_south.gd`: a black path with
white kerbs from the plaza's south end along the chapel to the east road, dirt under
thin trees and bamboo on the chapel side, a grass strip and the parked cars (now nosed
in to it at a slant, and walkable through to the path) on the other, bollards on the
curve, picnic sheds on a lawn in the corner and the
EVACUATION SITE 3 sign. The chapel's south side is a glass hall with three gold arches
and steps (`Chapel.south_bays()`). Along the walk the camera faces north and cuts away
the road and SJH. Fast travel: "Chapel south walk", "Picnic corner". See
`sessions/2026-10-20-chapel-south-walk.md`.

**Sunny noon and rain glints, 2026-10-20.** Noon is a clear, sunny midday (strong
white sun, crisp shadows, little haze); the other hours are unchanged. Wet-ground
glints at night are only under outdoor lampposts. See
`sessions/2026-10-20-sunny-noon-and-rain-glints.md`.

**Weathering and atmosphere, 2026-10-17.** Every wall material weathers on its own
(`shaders/weathering.gdshader`: grime at the foot, paint patches), windows get rain
streaks (`streak()`), and cloud shadows drift over the campus by day (`edges.gdshader`).
The flag and warmer middle road lamps from that session were left out: the middle road
is the team's HAU Boulevard as it is. See `sessions/2026-10-17-weathering.md`.

**The Student Center, 2026-10-19.** `areas/student_center.gd` builds it on its plot
from `assets/images/buildings/student center/`: the open arcade between the boulevard's
south covered walkway and the Main Building (still a plot), with the planter of lady
palms and its rail (open, with the boulevard's south planter, at the three western
crossings), cream posts, a tiled ceiling with fans, the terracotta `circles` floor,
Cafe Juan's windows and doorway (facade only), the courtyard gate, offices, study
tables, the BDO ATM, and a brick apron past the west end out to the fountain. The
boulevard's south view carries on inside; under the roof it is the walkway's cutaway,
with the roof faded and daylight fill lights. `--view=student-center`. See
`sessions/2026-10-19-student-center.md`.

**The friend, 2026-10-19.** The player's friend from the opening is in the game as
"Kaibigan" (no name yet) in front of APS 104-105: drawn in pxl over the redesigned boy
(black curtain hair, black hoodie, navy bag), idle and portrait only, with a short talk.
Sources in `assets/drafts/characters/npcs/pxl/friend/`. See
`sessions/2026-10-19-friend-character.md`.

**The opening, 2026-10-19 (test).** A plain launch now plays `opening.gd` first: a
black-and-white manga memory of the campus in Tagalog, page by page, ending on the
title and fading into the game (paused behind it). Panels use drawn pictures from
`opening/panels/`, else campus photos inked by `shaders/manga.gdshader`, else grey cards
naming what to draw; `opening/README.md` lists the 16 pictures. Any run with arguments
skips it (`--opening` forces it). See `sessions/2026-10-19-opening-cutscene.md`.

**The campus layout, 2026-10-18.** Godot's plots now follow Sean's labelled
`assets/MAIN CAMPUS LAYOUT REFERENCE.jpg`: `GODOT_PLOTS` in `plan.ts` (traced in that
picture's pixels, fitted to the built fountain, boulevard and road loop) lists every
building, covered walk, student gate and ground area; the exporter writes them with a
`kind`. Built buildings did not move. SFJ and STL moved south onto the picture, St.
Martha is redrawn, the Student Center sits between the boulevard and the Main Building,
St. Gabriel is one plot, the Gym Annex is Aero Hall, Plaza de Corazon is gone. Plots
have dashed white outlines and their names painted on them. The browser game's
`BUILDINGS` are unchanged. See `sessions/2026-10-18-campus-layout.md`.

**Facade detail, 2026-10-16.** `framed_window()` in `world.gd` puts APS's window look
on any face; use it for every new building's windows. MGN now has framed windows
throughout, floor bands, parapets and AC units. See `sessions/2026-10-16-facade-detail.md`.

**The sun turns with the view, 2026-10-16.** The sun was fixed for APS, so north- and
east-facing buildings (SJH, MGN) sat in shade. `_aim_sun()` in `aps.gd` now turns it
with each camera zone, so every view's face is lit like the APS front. The exceptions
are the canteen (keeps the old sun), the gym inside, and MGN (slant mirrored). See
`sessions/2026-10-16-view-lit-sun.md`.

**HAU Boulevard, 2026-10-18.** `areas/middle_road.gd` is rebuilt from the boulevard
photos: from the west road to the angel fountain (which replaces the flagpole), 30.6 m
between PGN's face (z 49.3) and the Main Building's and MGN's (z 79.9). `plan.ts` moves
those three outlines apart to fit (`SHIFT_V`; MGN's `areas/mgn.gd` moved with it). On
each side: covered walkway (two rows of terracotta block pillars, slatted white roof),
shrub strip, red octagon-paver walk with bronze lampposts, hedge strip; one lane each
way and a grass median; four yellow zebras. The camera faces the side the student is
on and glides round crossing the road; under a covered walkway it is the hallway
cutaway. The controls keep their side while a key is held. Commits now go under the
developer's own name, no AI co-author line, one per change (`CLAUDE.md`). See
`sessions/2026-10-18-hau-boulevard.md`.

**MGN in Godot, 2026-10-16.** `areas/mgn.gd` builds the Mamerto G. Nepomuceno
Building from outside on its plan plot (five storeys, ~17 m, facing east onto the west
road): the open-corridor long block, the box-window wing over the entrance with the
turnstile and the open stair, the north block, the south wing with its roof tank, and
the raised garden. The student can walk in under the wing up to the turnstile. On the
west road the camera turns right round to face it (`--view=mgn`), the chapel lawn cut
away behind. Geometry not in the photos is listed as guesses in
`sessions/2026-10-16-mgn-godot.md`.

**Dev free cam, 2026-10-18.** F2 (`dev_free_cam.gd`) flies the camera anywhere to look round: mouse look, WASD, Space/Ctrl up and down, Shift fast, wheel speed. Perspective while flying, zones and cutaways stop, the student waits; F2 or Esc hands back. See `sessions/2026-10-18-godot-dev-free-cam.md`.

Dev fast travel in Godot, 2026-10-16: F1 opens a panel of 15 places (APS, hallway, canteen, chapel, gym, SJH, Mary, MGN...) and jumps there with a short fade. Add new buildings' spots to `travel_places()` in `aps.gd`. See `sessions/2026-10-16-godot-dev-fast-travel.md`.

**Inside the IH Gym, 2026-10-16.** The gym can be walked into through either
front doorway (the right one is now open, like the left) or the side entrance.
Inside, the camera is a low 2.5D view in three zones from Sean's sketch: in the
west half it faces the west stand, in the east half the east stand, on the stage
the stage (`face_for`), gliding between them; whatever stands in front fades
away but keeps its shadow. On the stage or a stand it closes in to a side view.
Inside: the court (its lines filling the red surface), a landscape practice court,
the curved stage with long stairs up its side walls and line arrays hung over
it, curved striped end walls, bleacher rows on both sides, each stand's two
stairs beside its exits as in the left-entrance photo (the left and right
entrances, and two new open doorways in the back wall), the balcony, the lobby
from its photo, the equipment room, corridors, closed rooms and backstage.
Floors are levels: `blocked()` / `floor_height()` take the walker's height (see
"Storeys" and "Interiors and the cutaway" in `docs/godot-art-style.md`). Key 0
jumps to centre court. Room layouts not in the photos are still first guesses.
See `sessions/2026-10-16-ih-gym-interior.md`.

**NPCs and the boy rig in Godot, 2026-10-16.** Eight campus NPCs in the style
reference's look, animated by the boy's rig made general
(`assets/drafts/characters/npcs/rig/`): Migo and Bea stroll near APS,
Rica and Paolo on the canteen patio, Bianca at the chapel; Kuya Ben (traffic marshal)
at the APS entrance, Ate Lorna at her canteen stall and Coach Gab at the gym stay at
their posts. New NPCs are PixelLab edits of the style sheet (25 generations each).
E, Space or Enter talks to whoever is in reach. The playable boy is now a rig
built from his reference (`assets/drafts/characters/boy/three-quarter/rig/`), not
PixelLab frames. Campus sounds (student murmur, birds) and `atmosphere.gd`: rain that comes and goes (G) with wet ground, puddles and lamp reflections, light shafts and falling leaves. Wet ground in rain is a new exception to the matte rule, waiting for Sean. NPCs stop, turn and wave when you come near, open umbrellas in the rain, and ask questions you answer (W/S, 1-3); they remember your replies for the session. NPC walks and waves are now PixelLab redraws posed by skeletons (`assets/drafts/characters/npcs/pixellab/`), not the rig's rotated limbs. Migo's sprites are kept in pxl (`assets/drafts/characters/npcs/pxl/migo/`): clean chin, the same chin in every frame, hair that moves in the walk. The player boy too (`assets/drafts/characters/boy/pxl/`): his walk is a PixelLab redraw now, not the rig's. See `sessions/2026-10-16-godot-npcs-and-boy-rig.md`.

St. Joseph Hall in Godot, 2026-10-16: `areas/sjh.gd` builds SJH on its plan plot
(nine storeys, 96 x 19 m, facing north, set back 10 m from its OSM outline per Mikko's map), with its covered walkway (the same
cutaway as the APS hallway), the Mary statue garden and the parking with cars.
The south road is walkable and the whole road loop with it; key 9 frames SJH.
See `sessions/2026-10-16-sjh-godot.md`.

**English language setting, merged with main 2026-10-16.** Every line of the browser
game has English beside the Tagalog; L switches, Tagalog stays the default.
`npm run check:translations` lists any line without English. See
`sessions/2026-10-16-english-localization-merge.md`.

**The IH Gym in Godot, 2026-10-16.** `areas/gym.gd` builds the Immaculate Heart
Gymnasium from outside on its plan plot at its real size (41 x 69.5 m, about 12 m
to the fascia, 16.6 m to the ridge, solar panels on the roof). The east road is
now walkable down past it, with the apron in front and the lane to the side
entrance; keys 7 and 8 frame its front and side. The annex is still a reserved
plot. See `sessions/2026-10-16-ih-gym-godot.md`.
APS hallway in Godot, 2026-10-16: the APS ground floor is an open corridor behind
ledgestone piers (doors, grilles, comlabs, boards, bell, printing shop, both stair
halls), seen from outside. Walking in cuts away the outside and glides the camera
in; walking out reverses it (`areas/hallway.gd`, "Interiors (cutaway)" in
`docs/godot-art-style.md`). See `sessions/2026-10-16-aps-godot-hallway.md`.

**Godot is the direction, 2026-10-15.** Campus work moves to Godot 4.7.2 in the
style of `src/drafts/aps-godot/`. Every style rule and value is in
`docs/godot-art-style.md`; read it before any Godot work and update it when a
value changes. The repo-level `CLAUDE.md` points AI assistants there. The browser
game and `aps-3d.html` are frozen references. APS is now an L: the canteen wing
stands forward from the stair tower, its stalls facing the brick patio in the
corner, and the road bends round it with lawn inside the bend. The camera turns to
face the stalls on the patio, controls follow the camera, and the zoom goes in to
5 m. See `sessions/2026-10-15-aps-godot-l-layout-and-style-guide.md`.
Then: trees are 2.5D (round crowns of crossed leaf clusters), there is grass
everywhere, patio armchairs, LED street lights, and a pergola and green picnic
sheds past the canteen. See `sessions/2026-10-15-aps-godot-patio-polish.md`.
**Since then, the Godot world is the team's campus plan** (`campus_plan.gd`,
generated from `plan.ts` by `npm run export:godot-plan`; x = u + 4.7,
z = v + 58.8). APS is full length, a road loop circles the chapel lawn, the chapel
stands with its plaza and oval parking, and every other building is a reserved
plot. Merge a building as `areas/<id>.gd` on its plot (see "Campus plan and
merging buildings" in `docs/godot-art-style.md`). See
`sessions/2026-10-15-godot-chapel-and-campus-plan.md`.

APS Godot sound, 2026-10-15: `src/drafts/aps-godot/audio.gd` ports the browser
game's synthesised audio (wind, the pentatonic melody with its echo, footsteps,
the menu blip, night crickets). There are still no audio files. M mutes. See
`sessions/2026-10-15-aps-godot-sound.md`.

APS Godot port, 2026-10-15: we are moving APS to Godot while polishing the
art style and graphics. `src/drafts/aps-godot/` now holds the full browser
frontage (wing, canopy, tall block, stair tower, canteen) with sun shadows,
lit sprite silhouettes, edge/foliage/sky/grade shaders and night lighting. An
adaptive pixel buffer keeps both the wide and close framings clear. Run
`tools/run-aps-godot.cmd`; captures via `tools/capture-aps-godot.sh`. See
`sessions/2026-10-15-aps-godot-port.md`.

APS moving-shadow/canteen pass, 2026-10-15: Mikko requested shadow/lighting
polish while moving and the missing canteen. The browser trial now includes the
stair tower and five-floor canteen wing with an open stall hall, awning, steps,
brick patio and umbrellas. Default framing is APS + canteen; Canteen view or
`?view=canteen` opens the patio. The road continues right and the student can
enter through the railing gap. Stable world-anchored shadow filtering, a 4096px
sun map, orthographic sprite alignment, pixel-step camera follow, and foot
contact address motion shimmer. See `sessions/2026-10-15-aps-browser-canteen.md`.

APS browser reference correction, 2026-10-15: Mikko supplied screenshots 1075
(browser) and 1074 (native Godot) and asked for the latter's graphics. Browser
materials now use diffuse shading, cream sunlight with readable gray shade,
muted window reflections, quieter grain, and a lower entrance camera. The
preview fills the available window; whole-building framing remains the default,
with Entrance view for the supplied close composition. Custom wheel zoom no
longer falsely displays the Whole building label.

APS browser 2.5D trial, 2026-10-15: Mikko approved trying spatial graphics while
staying in the browser, then requested a wider view of the entire building so
it feels large. Open `/aps-3d.html` on the Vite server. The isolated Three.js
scene starts at Whole building framing, with existing student sprites, real
shadows, day/night controls, and touch movement. Godot is optional; the original
Canvas game is still `/`. See `sessions/2026-10-15-aps-browser-3d.md`.

APS Godot trial, 2026-10-15: a standalone 2.5D entrance prototype now lives in
`src/drafts/aps-godot/`. Run `tools/run-aps-godot.cmd` on this Windows setup or
open its `project.godot` in Godot 4. The local portable 4.7.2 editor is under
ignored `builds/godot-tools/`; no engine binary is committed. This is a spatial
graphics trial, not a migration of the browser game. See
`sessions/2026-10-15-aps-godot-trial.md`.

APS visual benchmark, 2026-10-15: Mikko approved an Until Then-inspired exterior
pass on APS first. See `sessions/2026-10-15-aps-visual-benchmark.md` and
`docs/aps-visual-benchmark.md` for preview links, scope, and limitations. APS alone
uses the new directional sprite shadows, canopy shade, architectural depth,
foreground branches, and restrained bloom; the game remains on Canvas.

Last updated: 2026-10-15 (the boy and girl are PixelLab sprite sheets with idle, walk, talk and a cutscene-only tired stance, talking portraits and the girl's emotions, drawn on a double-detail buffer; draft. Before that: characters restyled with outlines and three-tone shading, draft v1; APS, its canteen and the chapel lawn redrawn from the walk photos, with a 3D chapel; GGN redrawn from photos at its real size, and the campus map redrawn to match the aerial photo; before that, the fountain plaza in front of SFJ, buildings from photos, the side gate and the opening screens)
Last updated: 2026-10-15 (APS lit at night: window light spilling onto the walls and trees, softer lanterns, shading, wet-road reflections in the rain; the chapel lawn's ends: no way to the back road, only APS at its left end; the chapel walkway as five lanes, with the student center and Cafe Juan, from 31 photos; St. Joseph Hall redrawn from photos with the statue of Mary, MGN as its own stop between the chapel and SJH, the chapel with depth and the oval parking; the Covered Court and the Aero Laboratory, from 15 photos; the IH Gym outside and in, from 21 photos: front, side entrance, lobby, corridor, court, stage and second floor; characters restyled with outlines and three-tone shading, draft v1; the side gate entryway and its flag plaza; APS, its canteen and the chapel lawn redrawn from the walk photos, with a 3D chapel; GGN redrawn from photos at its real size, and the campus map redrawn to match the aerial photo; before that, the fountain plaza in front of SFJ, buildings from photos, the side gate and the opening screens)
Last updated: 2026-10-15 (an English language setting, L to switch, with the whole game translated; the chapel lawn's ends: no way to the back road, only APS at its left end; the chapel walkway as five lanes, with the student center and Cafe Juan, from 31 photos; St. Joseph Hall redrawn from photos with the statue of Mary, MGN as its own stop between the chapel and SJH, the chapel with depth and the oval parking; the Covered Court and the Aero Laboratory, from 15 photos; the IH Gym outside and in, from 21 photos: front, side entrance, lobby, corridor, court, stage and second floor; characters restyled with outlines and three-tone shading, draft v1; the side gate entryway and its flag plaza; APS, its canteen and the chapel lawn redrawn from the walk photos, with a 3D chapel; GGN redrawn from photos at its real size, and the campus map redrawn to match the aerial photo; before that, the fountain plaza in front of SFJ, buildings from photos, the side gate and the opening screens)

## What This Is
A free-roam, side-view pixel art game set on the Holy Angel University campus in Angeles City. It is inspired by the feel of *Until Then* (everyday Filipino student life, soft lighting, speech bubbles, a phone) without copying it. It is a student project, not an official university product, and every character is fictional.

## Decisions So Far
| Decision | Choice | Why |
| --- | --- | --- |
| Camera | Side-view with parallax layers | Closest to the look we want; free roam comes from doors and connected scenes |
| Engine | Our own, TypeScript on the browser canvas | Wanted everything written from scratch; easy to run and share |
| Later | Port to Godot 4 | Decided up front; do it once the prototype's look and feel are settled |
| Language | Taglish with a little Kapampangan | Sounds like actual students here |
| English | An English line (`en`) beside each Tagalog one, picked with L; Tagalog stays the default | So non-Tagalog speakers can follow the story. The Tagalog is never changed; a line with no English shows its Tagalog. Kuya/Ate/Manong, food words and baon stay as they are, Kapampangan stays with its meaning after it. The choice is kept in `project-hau-lang`, apart from the save |
| Scope | The whole campus outdoors first, interiors after | Done: all 21 buildings from the outside, on ten connected outdoor scenes. Interiors (other than the DJN lobby and courtyard) wait for reference photos of each one |
| Layout | One-to-one with the real campus, anchored on the chapel | Buildings come from OpenStreetMap (`npm run import:osm` writes `src/game/campus/osm.ts`); gates, junctions, GGN and the Formation Center from an aerial photo. All of it goes into `src/game/campus/plan.ts` and the scenes are placed from it. Scale set by one Google Earth measurement (140.36 m, rotunda statue to the chapel), which OSM confirmed to 0.6% |
| Scale | 9 game pixels per metre | The DJN Building and the angel pedestals were already drawn at about this |
| Camera per street | Each street picks the side with the most to see | A side view only shows one side of a road. Buildings behind the camera get a sign and a "look back" hotspot |
| Saving | Autosave to the browser | No menus to build; Enter continues, N starts over |
| Art | Drawn by code, except the two playable students | Lets the time-of-day lighting recolour everything. The boy and girl are PixelLab sprite sheets (`src/game/sprites/`), still lit by the light map |
| Render detail | The scene buffer is 2x the 480x270 view (`DETAIL` in `engine/display.ts`) | Drawing code keeps 480x270 coordinates; the students' sheets are drawn at half a game pixel per pixel so none of their pixels are lost |
| Character style | Outlined, three tones, rounder heads, same 33 px rig | Matches the reference image picked in October; the outline is stamped from the drawn body so every look gets it |
| Player | Choose Boy or Girl, then type a name, before a new game | Same rig for both (`Look`), so the girl is just a different look; the name only labels the player's speech bubbles |
| Opening | New games start outside the Main Gate with a cutscene | Bag check and ID tap are the first thing every HAU student does each day |
| Cutscenes | A list of steps in the story files, played by `src/game/cutscene.ts` | Writers can script scenes without touching the engine; no timeline editor to build |
| Campus map | Follows the aerial photo where OSM disagrees with it; roofs in the photo's colours | Sean wants the C map to look like `Aerial shot of HAU enclosed in red line.png`. OSM is 7 to 14 m off the photo on the west side. Traced outlines are `TRACED` in `plan.ts`; only the map uses them, the scenes still use `blocks`. The map keeps its angle (walkway left to right), Sean's choice |
| Map teleport | Pick any place on the C map and jump there | Stand-in while the campus is only partly walkable. Switch off with `TELEPORT` in `src/game/ui/map.ts` once it is all joined up on foot |

## What Exists
Twenty-nine connected areas. See `docs/campus-layout.md` for the plan they are built from and a diagram of how they join.

The first six, with people and story:

* **Side Gate** (`src/game/scenes/gate.ts`, art in `src/game/art/gate.ts` and `src/game/art/traffic.ts`; the scene id is still `gate`) - the gate by the Main Building that students come in by, seen from the street and drawn from a photo: the white gatehouse with the seal, HOLY ANGEL UNIVERSITY in black letters and the glass roof, the iron fence, the barricades at the kerb, and cars, jeepneys and tricycles going by between you and the camera. A red pickup is parked up on the sidewalk by a NO PARKING sign. **The checkpoint is under the gatehouse roof**: two bag tables and two ID turnstiles. NPCs: Enforcer Dante (ACTDO), Mikko Panergo (the pickup's owner, named for our teammate at Sean's asking), Kuya Nonoy and Ate Joy (guards), Manong Taho; Ella is here only for the arrival cutscene. Cutscenes: `gateArrival` (you come up to the pickup and complain to the enforcer, the owner runs up saying "sandali lang po" and gets his ticket anyway, then you walk in and get your bag checked), then pressing E at the reader to tap your ID (the first tap fails because it's still in its plastic case). **Tapping in walks you through the gate, away from the camera, and up the walkway onto the flag plaza (Side Gate Entryway).** The turnstiles are as far as you can walk in this scene. On the campus map the scene sits at the side gate on Holy Angel Avenue (`sideGate` in `plan.ts`).
* **Side Gate Entryway** (`src/game/scenes/entry.ts`, art in `src/game/art/entry.ts`, from the photos in `assets/images/sidegate entryway/`) - the round flag plaza at the end of the walk in from the side gate, seen looking back down the walkway to the gate (LAUS DEO SEMPER 1933 on its inner face) with Holy Rosary Parish beyond: the eight-point star in the paving, the granite pedestal and flagpole with the Philippine flag, the chained yellow and black posts, the EVACUATION SITE 5 sign, palms tied round with white rope. Three flights of steps go down from it: left to the front of the Main Building, middle to the parking lane and STL, right to the SFJ fountain and the Epiphany. Walking in from the gate and out to it are cutscenes up and down the walkway. NPCs: Ella (the freshman from the gate line), Ate Weng (guard, explains the three stairs).
* **Epiphany of Angels** (`src/game/scenes/park.ts`) - the road in from the main gate: four stone angels on each side, the covered shed, the seal in the pavers, the Memorare stone, the road stops at a stand of trees, and past them is the round patterned plaza with the pool of jets in the middle, in front of the steps of the San Francisco de Javier Building, all drawn from photos (`src/game/art/sfj.ts`). NPCs: Kath, Mang Bong, Enzo. Leads on to the front of the Main Building, and up the steps to the flag plaza.
* **Plaza** (`src/game/scenes/plaza.ts`) - the front of the Main Building: the rotunda with the Holy Guardian Angel statue in its brick fountain basin (from a photo), the DJN Building, the bronze guardian angel on its lawn beside the building, and St. Barachiel Gate at the right-hand end, which is for cars only. The steps up to the flag plaza and the side gate are in front of the DJN's west wing. NPCs: Kuya Ramil (guard), Mang Dado (tricycle), Trisha, Jopet. The parking lane, the chapel walkway and the Epiphany all leave from the rotunda.
* **Lobby** (`src/game/scenes/lobby.ts`) - bust of Juan D. Nepomuceno, bulletin board, Center for Kapampangan Studies door. NPC: Ate Liza.
* **Courtyard** (`src/game/scenes/courtyard.ts`) - drawn from two photos: the old theatre front with LAUS DEO SEMPER between 1933 and 1953 under its garlands, the stage with curved terrazzo steps, a staircase each side up to the second-floor corridor, the steel and glass roof and the hanging vines. NPCs: Bea, Migs, Mingming the cat. Its gate comes out in the student center.

The seven campus streets, outsides only, no people yet:

* **Chapel walkway, five lanes** (`walklanes.ts` and `walkway.ts`, art in `art/walks.ts`, story in `story/walks.ts`). From the DJN outwards: the **student center** (`stuc`: Cafe Juan, the BDO ATM, tables, the courtyard gate), **sidewalk 1** (`djnsw1`, covered walk of terracotta pillars), **sidewalk 2** (`djnsw2`, hex pavers, banner lamps), the road, then on the PGN side **sidewalk 2** (`walkway`, the old id) and **sidewalk 1** (`pgnsw1`). The Main Building side looks south-east and ends at MGN; the PGN side looks north-west and ends at the PGN tower. You change lanes only at real openings: gaps in the student center planter, breaks in the hedges, two road crossings. The near pillars of the covered walk pass in front of you. See `sessions/2026-10-15-walkway-lanes.md`.
* **Parking Lane** (`lane.ts`) - STL with the PGN tower over it; SFJ is behind the camera.
* **Back Road** (`halls.ts`) - warehouse, Yellow Food Court, St. Gabriel, St. Raphael and St. Michael Halls, then GGN drawn from photos (`art/ggn.ts`): its whole front, 53 m wide and taller than the screen. No way to the chapel lawn from its GGN end: that is round by APS.
* **APS** (`aps.ts`, art in `art/aps.ts` and `art/canteen.ts`) - drawn from the walk photos in the order you pass it: the back of PGN, the long louvred wing, the canopy, the curved-balcony block, the stair tower and the canteen block, with the umbrella patio in front. Three scenes lead off it: the lobby under the canopy (`apslobby.ts`), the canteen (`canteen.ts`) and its back hallway (`canteenback.ts`), which is the way through to Sacred Heart.
* **Chapel lawn** (`lawn.ts`) - the Chapel of the Holy Guardian Angel behind an oval parking island (cars nosed in, `carEnd` in `art/street.ts`) with the stamped-concrete road looping round it. Its four white rings are discs round a drum so they wrap round the back; through the flat glass front you see the pews and the altar, and a lower white body with tall windows carries on behind it (`chapelRear`). Layered trees (`layeredTree` in `art/props.ts`) and bamboo close in on both sides in grass, a dark treeline behind. The shady corner with the picnic sheds, and the formation center behind. The junction the campus turns on: its left-hand end leads only along APS to Sacred Heart (no way to the back road), its right-hand end to MGN.
* **MGN** (`mgn.ts`, art `drawMGN` in `art/sjh.ts`) - the Mamerto G. Nepomuceno Building, its own stop between the chapel lawn and SJH: going round from the chapel it is the chapel, MGN, then SJH. White open corridors over an open ground floor, the service block with its roof tank at one end, the box-window wing and open stair at the other.
* **St. Joseph Hall** (`sjh.ts`) - SJH drawn from photos (`art/sjh.ts`): the silver and cream tower over the entrance, the teal-paneled wings, terracotta ends; the statue of Mary on her grass island at the right-hand end; past it a side road to a high wall, and the narrow end of MGN. Its far end leads to MGN. The corner of the gym on the left; the School of Computing sign is here.
* **Gym lane** (`gym.ts`) - Covered Court, then the front of the Immaculate Heart Gymnasium drawn from photos (`art/ihgym.ts`): HOLY ANGEL UNIVERSITY on the fascia, the left door up steps under a grey box canopy, the right door under the seal and GYM sign, cars, green tents and tyres along it, and the dark annex with the seal painted big on it. The lane between the covered court and the gym goes round to the side entrance.
* **Covered Court** (`ccourt.ts`, art in `art/ccourt.ts`, story in `story/ccourt.ts`) - in from the gym lane (its front, the gable with the fan of glass, is drawn on the gym lane) or from the lane by the IH Gym's side entrance. You walk its length looking at the steel bleachers on the gym side, the IH Gym's gable end beyond: the maroon basketball court with the winged seal, the red volleyball court and the badminton court beyond it, and the yellow AERO LABORATORY gate at the far end. NPCs: Dennis, Joanna, Kiko.
* **Aero Laboratory** (`aerolab.ts`) - through the small door in the gate: the hangar with ANGEL-1, an older trainer with a dark red wing, two jet engines in yellow frames. NPCs: Lance, Engr. Dizon.
* **IH Gym** (six scenes, art in `art/ihgymin.ts`, story in `story/ihgym.ts`) - the side entrance on the gable end (`gymside.ts`); the lobby inside it, looking down the court through the gates (`gymlobby.ts`); the corridor in from the front's left door, with the equipment room and the stairs up (`gymcorridor.ts`); the court with the far bleachers, the striped wall and the sound panels (`gymhall.ts`); the stage with WELCOME ANGELITES (`gymstage.ts`, exports `STAGE` for events); the second-floor walkway in front of the bleachers (`gymupper.ts`). NPCs: Rica, Paolo, Migo, Jomar, Coach Gab, Bianca. See `sessions/2026-10-14-ih-gym.md` for how they join.

Every building's door names it, gives its number on the 2022 campus map and the offices inside, and says it is not open yet.

Systems: time-of-day cycle, light map with lamps and window glow (plus, opt-in per scene, light baked at load with `lightBake` and wet-street reflections and lamp motes with `atmosphere`; only APS uses them so far), particles (fountain, leaves, fireflies, dust), speech-bubble dialogue with choices and a portrait of the speaker, faces and emotes, cutscenes with letterbox bars, phone with a nine-item checklist, campus map on the C key (pixel art, painted from the plan, with teleport) and a minimap in the top right, baon (allowance) money, rain that comes and goes with umbrellas, title screen, character picker and name entry, synthesised audio, autosave.

## Where Things Live
* `src/engine/` - generic engine parts. Knows nothing about HAU.
* `src/game/campus/` - the campus plan: where every building is (`plan.ts`) and how that becomes scenes (`streets.ts`). **Move things here, not in the scenes.**
* `src/game/art/` - all drawing code (buildings, props, characters, sky, palette). `buildings.ts` is the facade painter for everything that is not the DJN.
* `src/game/scenes/` - one file per location. `kit.ts` has what the street scenes share.
* `src/game/story/` - NPCs, dialogue, checklist. **Writers edit here.**
* `src/game/ui/` - bubbles, HUD, phone, title, character picker (`select.ts`).
* `src/game/game.ts` - ties it together: scene travel, flags, tasks, audio.
* `tools/check-links.mjs` - `npm run check:links` presses E on every hotspot and checks the scenes still join up.

See `src/README.md` for the URL shortcuts that jump to any scene, position and time of day while testing.

## How Story State Works
* Flags are plain strings in a set (`met_bea`, `saw_bust`, ...). A dialogue line can set one with `set: 'flag'`.
* `src/game/story/tasks.ts` lists the checklist; each task is ticked by a flag.
* An area can name a `visitFlag` that is set the first time the player walks in.
* Progress autosaves to `localStorage` (`project-hau-save-v1`). If you rename or remove flags, bump that key so old saves are ignored. The save also holds `character` (`boy` or `girl`), `name`, `pesos`, the last purchase and the weather; saves without them load as the boy with no name, ₱150 and dry weather, so the key was not bumped.
* The player's look: `src/game/art/player.ts` holds both looks and the chosen one (`baseLook()`). Areas and cutscenes reset to it, so never use a fixed look for the player. Dev shortcuts: `?char=girl&name=Mikko`.
* Title flow: Enter continues a save, or opens the picker (A/D, Enter), then the name box (type, Enter). N with a save opens the picker too and only wipes the save once you confirm; Esc backs out.
* **English:** add `en: '...'` next to `text: '...'` on a line or a choice (`labelEn` for a hotspot label, `subtitleEn` for an area). Never change the Tagalog to make room. `npm run check:translations` confirms the Tagalog is untouched and lists the lines with no English yet; lines that need a person to decide are in `docs/translation-review.md`. All of it is translated: every line of dialogue, every prompt, area subtitle, menu, the phone, the map and the checklist.
* An NPC's `talk(game)` returns the lines to say, so it can branch on `game.has('flag')`.
* **Faces:** a line can say how the speaker looks, `face: 'happy'` (neutral, happy, sad, angry, surprised, worried, shy, smug). It shows on the sprite, in the arms when standing still, and in the bubble's portrait (`art/portrait.ts`), and pops an emote unless the line picks its own with `emote` ('!', '?', '...', 'note', 'anger', 'sweat', 'heart', 'none'). Only the side gate lines are tagged so far.
* A cutscene is `game.play(steps)` from a hotspot, or an area's `intro(game, x)` that returns steps when you walk in. Steps: `walk`, `place`, `face`, `say`, `pause`, `sound`, `look` (swap what the player wears), `walkIn` / `walkOut` (into or out of a doorway, seen from behind or the front) and `run` (anything else). The game never saves in the middle of one.
* An area can have a `barrier`: an x the player can't cross leftwards until a flag is set.
* Main Gate flags: `passed_bag_check`, `id_fumble`, `scanned_id`, `met_joy`, `met_ella`.
* Entryway flags: `met_weng` (Ate Weng explained the stairs), `saw_flag` (looked at the flagpole). Neither is a checklist task yet.
* Walkway flags: `visited_stuc`, `saw_cafe_juan`.
* Covered Court flags: `visited_ccourt`, `saw_ccourt`, `visited_aero`, `saw_angel1`, `met_lance`.
* IH Gym flags: `entered_gym` (first time on the court), `saw_gym`, `saw_stage`, `saw_equipment`, `met_jomar`.
* **Money:** a line with `pesos: -20, item: 'Taho'` spends ₱20 when it is shown (positive gives money). `g.pesos()` says how much is left, so a talk function can offer a cheaper line when the player is short. `buy()` in `story/streets.ts` makes a menu choice that does both. New games start with ₱150 (`BAON` in `game.ts`).
* **Weather:** `g.raining()` is true while it rains, for lines like Manong Taho's and Mang Bong's. Rain is in `src/game/weather.ts`.
* `gave_piso` is set when you give Jopet a coin (his quest draft uses it).
* Campus flags: `visited_chapel` (walked onto the lawn), `saw_chapel` (looked at the chapel). Neither is a checklist task yet.

## Needs Checking by a Human
* **Dialogue:** written by a non-native speaker. Proofread all Taglish and especially the Kapampangan phrases ("Mayap a gatpanapun", "Dakal a salamat", and Ate Weng's "Mayap a abak" and "Mayap a bengi").
* **History facts** in the lobby dialogue (built 1940, founded 1933 with 78 students, used as barracks in the war) came from Wikipedia, the HAU history page and the Angeles City tourism site. Verify before showing this officially.
* **Interiors** are an interpretation from a few photos, not the real floor plan.
* **The campus plan.** Buildings come from OpenStreetMap, except where the aerial photo disagrees: on the map, buildings 1, 2, 5 to 10, 15 and 16 are traced off the photo (2026-10-14). The street scenes did not move with them, so the Back Road scene has the halls about 12 m from where the map shows them. Still a guess: which of halls 7 and 8 is St. Gabriel (OSM and the 2022 campus map disagree; the photo labels the whole courtyard building St. Gabriel). `docs/campus-layout.md` lists the rest.
* **What the buildings look like.** The DJN and its courtyard, the Epiphany, the rotunda statue and fountain, the walkway, St. Joseph Hall (`art/sjh.ts`), SFJ and its pool (`art/sfj.ts`), GGN (`art/ggn.ts`), the side gate entryway (`art/entry.ts`), the IH Gym outside and in (`art/ihgym.ts`, `art/ihgymin.ts`) and the gatehouse were drawn from photos. GGN's floors were counted off its photos (three under the canopy, eight over it) and its front is shown on the Back Road although it really faces the street beside it: check both. Floor counts on SJH and SFJ were counted off one photo each and squeezed to fit the screen, so check them. Every other building uses a generic facade with guessed colours and floor counts.
* **Door text** on every building lists offices from the 2022 campus map. Offices move; check them.
* **The entryway's left staircase** goes to the front of the Main Building: read off the photos and the aerial photo, not confirmed by Sean (he gave the right and middle ones).
* **The gate.** The gatehouse, fence and barricades are from the photo `HAU SIDE GATE DESIGN.jpg`; the tent, tables and turnstile are still guesses. Since 2026-10-14 it is placed as the side gate (the "Courtyard/Pedestrian Gate" on the gate-area diagram) on Holy Angel Avenue, which the entryway photos confirm; the notes below about which gate it is predate that. The scene is still called "Main Gate" on Sto. Rosario St. and the photo's file name says "side gate": **confirm which gate this is and which street it is on**, and whether the Epiphany's gate is a different one. Until then the gate scene opens on to the Main Building and also keeps a path to the Epiphany. The guard house at the plaza end still says "GATE 1".
* **Memorare text** in the park is a paraphrase of the marker. Check it against the real stone.
* **Archangel names** are not in the game; the plaques were unreadable in the photos.
* **Audio** has never been listened to critically. It may need rebalancing.
* **University permission** for using the HAU name and likeness has not been asked for yet.

## Planned Next
See `sessions/2026-10-12-minimap-teleport-and-plans.md` for the details.
* **Photo trip, Tuesday 2026-10-13.** The shot list is in that session file. Fix the maps from the photos afterwards, Main Gate first.
* **Characters easier to tell apart.** One signature feature each (hair, glasses, build, accessories), then talking and idle animations. Trisha, Bea, Kath and Ella currently look almost the same.
* **Close-up cutscenes.** Bubble portraits drawn by code from each `Look` exist now; full-screen close-ups do not. Hand-drawn art may replace both later.
* **Faces on the rest of the dialogue.** Only `story/gate.ts` (and Ella) are tagged.
* **Quest "Ang Ikaapat na Piso"** (Jopet), drafted in `docs/drafts/` on branch `quest-ikaapat-na-piso`. It needs a day system, close-ups, the library and the SOC org room.

## Not Done Yet
* **Interiors of every building except the DJN.** Waiting on reference photos of each one. Do not guess at them.
* **People on the seven new streets.** They are empty.
* The plaza and the main gate scenes are not to scale (see `docs/campus-layout.md`).
* The other gates on the gate-area diagram: Guardian Angel, St. Raphael and St. Uriel. (The pedestrian gate is the side gate.)
* No touch controls (it loads on a phone but you cannot move).
* Real sprite art and recorded audio. `assets/drafts/girl-test/` is a test of sprite sheets made from one AI-generated girl image (idle, front walk, talking with expressions). The game does not use it.
* The Godot 4 port.
* The photos in `assets/APS WALK FROM CHAPEL LAWN/`, `assets/SJH BUILDING/`, `assets/MGN BUILDING/` and `assets/CHAPEL/` are kept local, not committed: they show number plates and people. Ask Mikko for them.
* The reference images in `assets/images/` are committed as of 2026-10-12, at Sean's decision, so the team shares them. They are Google Earth, university and found-online material, references only: the game does not load them.
* The older `docs/`, `assets/` and `tools/` READMEs still describe the original top-down plan in places.
