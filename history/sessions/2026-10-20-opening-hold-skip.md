# Hold Space to skip the opening

**Who:** Jorel, with Claude Code.

## What was asked

A well-crafted Space-to-skip for the manga opening that plays on launch.

## Decisions

- **Hold, not tap.** Space is held for 0.9 s (`HOLD` in `opening.gd`) to skip; a tap
  still moves on like any key, so nobody throws the opening away by accident. Letting
  go early drains the bar back at twice the speed. Esc still skips at once.
- **The hint is part of the page:** "HOLD SPACE TO SKIP" in the lettering font, small
  in the bottom-right margin under the panels, half-faded; it darkens while held and a
  thin pen line under it fills. Once skipping, it fades out with the page.
- Skipping goes through the title card's fade, as Esc did, so the game is not cut to.

## What changed

- `opening.gd`: `_input()` handles Space (tap on release, hold tracked), `_process()`
  fills the bar and skips, `_skip_hint()` builds the hint. `opening/README.md`.

## Checks

`--test`: all true. A scratch run fed real Space events: a tap did not skip; a hold
skipped after 0.91 s and the game unpaused. `npm run check` and `npm run build` pass.
