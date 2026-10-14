# 2026-10-15: the chapel lawn's ends and its back row of trees

**Who:** Mikko (H1enZ).

## What was asked
Follow-ups after the SJH, MGN and chapel session (PR #15), from screenshots: the leaves behind the chapel had no trees under them, then looked cut in half and pasted in; cut the chapel lawn's left end at the first tree with the APS sign to the right of it; then remove the BACK ROAD / GGN way there, leaving only APS / SACRED HEART.

## Decisions
* **No direct way between the back road and the chapel lawn.** The lawn's left end has only the way along APS to Sacred Heart. Every way in must have a way back (`npm run check:links`), so the back road's CHAPEL / PGN exit at the GGN corner was taken out too. From the back road you reach the chapel through APS.
* **The lawn scene starts at the first tree of the shady corner**: `lead` cut from 60 to 10, so the end of APS is out of sight.

## What changed
* `art/props.ts`: `treeline` redone so it blends in: muted, slightly blue greens; crowns overlapping into one canopy with leafy edges; trees shorter towards both ends of the row; a slim trunk under every crown; low undergrowth along their foot.
* `scenes/lawn.ts`: the treeline stands on the ground behind the parking and starts behind the grove trees; the BACK ROAD / GGN sign and way removed; the APS / SACRED HEART sign moved right of the first tree.
* `scenes/halls.ts`, `story/streets.ts`: the back road's way to the chapel lawn removed, and the lawn's way to the back road.
* `campus/streets.ts`: the lawn street's `lead` is 10.

## Checked
* `npm run check`, `npm run build` and `npm run check:links` pass.

## Needs checking
* Whether there really is no way from the GGN corner to the chapel on foot. If there is, it can come back as a way that ends by the APS sign.
