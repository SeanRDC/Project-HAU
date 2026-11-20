# The Epiphany of Angels and its gates (plan, 2026-11-21)

Sean asked (2026-11-21): build the Epiphany of Angels with its gates 1:1 and in detail, from
the photos in `assets/epiphany of angels/` (20261019_153043 to 153100) and the older references
(`assets/images/other references/`: "epiphany begin, facing the campus", "epiphany end going to
gate", "shot where the epiphany of angels walkway ends", "aerial diagram close to epiphany of
angels"). He is away; work on without asking and keep going after a usage-limit reset (an hourly
check-in prompt resumes it). Commit each step on its own under his name, no AI co-author line, on
branch `epiphany`.

His answers: **gates** = all three (the Sto. Rosario Gate at the street end, the black swing gate
at the east end beside the covered walk, the Guardian Angel car gate on Holy Angel Avenue with
the fence); **scope** = the Epiphany only (its road, lawns, both covered walks, the gates and the
short road that joins it to the side gate); Rotonda 2, SFJ and St. Martha stay reserved plots;
**no cars**; nothing past the fence.

## Layout (Godot metres, axis-aligned like SFJ's surveyed outline)

- Road axis z 86, from the Sto. Rosario fence (x -261) to the north-south road (x -213.5).
- Road half width 3.5 (dark octagon pavers, a 1 m band of white diamonds each side); curb walks
  3.5..5.7 out (raised, light slabs); lawns 5.7..9.0 out with the angels (four a side, x -254.5,
  -244, -233.5, -223) and stone benches between; the seal in the road near the west end.
- North: garden z 72..77, the covered walk ("covered shed") z 66.5..71 with a terracotta-roofed
  pavilion at its east end (x -219..-215).
- South: lawn with trees z 95..99.6 (fallen trunk, Memorare stone, birdbath), path z 97.4..100,
  the Main Gate covered walk z 100..103.5, the fence on Holy Angel Avenue at z 104.
- North-south road x -213.5..-207 from the fence (z 104) to z 74.5; the hatched crossing at
  z ~100; four steps down from the side gate colonnade's west pavilion (lx -17.2..-19.6) to it;
  the Guardian Angel car gate from (-213.5, 104) to the side gate fence's west pier (-207.6, 102.3);
  the black swing gate at the covered walk's east end.
- Sto. Rosario Gate at x -261: two tall carved piers with three-lamp lanterns, the iron double
  gate (closed), smaller piers and fence over the curb walks, the fence on to z 62 and z 104,
  flags, the dark LED board on its frame.

## Tasks

- [ ] 1. Plan: built plots (epiphany, mainGate, coveredWalk outlines to the build, BUILT), export, west bound to -262.
- [ ] 2. `areas/epiphany.gd`: road, pavers, diamonds, seal, curb walks, kerbs, lawns; walkable/blocked/floor; wired into world.gd.
- [ ] 3. The eight angels on their pedestals, benches, lamps, urns.
- [ ] 4. The Sto. Rosario Gate and the west fence.
- [ ] 5. The south: Main Gate covered walk, fence, swing gate, car gate, north-south road, crossing, steps.
- [ ] 6. The north covered walk and pavilion, the garden.
- [ ] 7. Trees, fallen trunk, Memorare stone, birdbath, box, signs, planting.
- [ ] 8. Camera (north view with the south cut, west gate view, covered walks), fade groups, fast travel, checks.
- [ ] 9. Captures reviewed, `docs/godot-art-style.md`, README, session file, `history/CONTEXT.md`; all checks, `npm run check`, `npm run build`.
