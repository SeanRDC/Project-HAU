# Audio fixes

**Who:** Mikko, with Claude Code.

## What was asked

"I hear a wind or flap sound on audio, and it's like flickering. Fix the audio and tell me
suggestions on sounds."

## What was wrong

- The looping sounds (the students' murmur, the rain) were joined end to start with a
  linear crossfade. Between two unrelated stretches of noise that halves the power in
  the middle, so the level dipped each time the loop came round (every 7 s for the
  murmur, every 4 s for the rain): the flicker.
- The murmur was bursts of band-passed noise chopped into syllables, and the footsteps
  were 80 ms bursts of band-passed noise. Both read as wind and flapping, not voices and
  feet.

## What changed (audio.gd)

- `_seamless` crossfades with sine and cosine, which keeps the power even through the join.
- `_murmur`: seven voiced "speakers" (a buzz at a low or a higher pitch with a little
  intonation, shaped into soft syllables in phrases with breaths between, through two
  vowel formants), mixed and low-passed at 1.8 kHz as if across the lawn, 8 s loop.
  Measured over the loop in 0.25 s windows its level stays within about 2x with no dip
  at the join. It renders in about 0.9 s on the worker thread, as before.
- `_footstep`: a low thud of the heel (150 Hz on hard floors, 95 Hz on soft ones), a
  short scuff, and a crisp tick on tiles and steps.
- `_rain`: white noise thinned at the top (a soft low hiss), a 6 s loop.

## Checks

`--test`: all true (`campus_sounds`, `footsteps_while_walking`). `npm run check` and `npm run build` pass.
Not listened to here: Mikko to listen.

## Suggestions given

Wind in the trees for the "windy" weather, rain on the canopies and kiosk roofs, the
chapel bell at the hours, distant traffic past the gates, the canteen's clatter and
chatter, a ball bouncing at the Covered Court, room tone and a fan in corridors, cats
and birds tied to where they are, doors and turnstiles, a school bell between classes.
