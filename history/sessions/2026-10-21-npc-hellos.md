# NPCs say hello

**Who:** Mikko, with Claude Code.

## What was asked

Make the NPCs more interactive, "like when walking they say hi". From the suggestions
Mikko picked: hello bubbles in passing, greetings that remember you, lines for the time
and the weather, and NPCs facing the student.

## Decisions

- **The hello rides on the wave** that was already there (within 3 m, once until the
  student goes 6 m away): `Npc.greeting` is set as it starts, and the cast shows a small
  paper bubble over its head (2.3 m up, above the "Kausapin si" prompt when that is up)
  that types out with a blip every fourth letter in the NPC's voice and fades over the
  last half second of 2.8 s. It never stops the student or the NPC's own behaviour; it
  goes when a talk with that NPC starts.
- **Lines** (`HELLOS`): each named NPC has "first" lines and "met" lines (after
  `met.<id>`, which every finished talk remembers); the prototypes use "default". In rain
  past 0.35, 65% are rain lines; otherwise 35% are for the hour (`npcs.hour`, set by the
  scene): morning before 11, noon to 14, afternoon, night from 18 to 6, some in
  Kapampangan (Mayap a abak, Mayap a gatpanapun, Mayap a bengi). Picked by a seeded rng.
- **Looking:** standing about (a post, or waiting between strolls), an NPC turns to the
  student from 6 m (`LOOK`), without stopping or waving; walking NPCs keep facing their way.

## What changed

- `npc.gd`: `LOOK`, `greeting`, the look while standing about.
- `npcs.gd`: `HELLOS`, `RAIN_HELLOS`, `TIME_HELLOS`, `HELLO_TIME`, `hour`, `hellos`,
  `hello_for()`, `_say_hello()`, `_drop_hello()`, `_update_hellos()`.
- `aps.gd`: `npcs.hour`; `npc_notices_and_waves` also needs Bea's hello; new check
  `npc_looks_and_says_hello` (Kuya Ben looks each way from 4.5 m without noticing).
- `README.md`, `docs/godot-art-style.md` (NPCs react).

## Checks

`toolsun-aps-godot.cmd --headless -- --test`: all true. `npm run check`, `npm run build`
pass. A morning capture at the start spot shows Kuya Ben waving with "Magandang araw po!".
