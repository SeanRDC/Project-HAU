# The friend character

**Who:** Mclaren (Aistwobig), with Claude Code.

## What was asked

A new character from the character references: the player's friend (the one the opening
remembers), with curtain hair parted in the middle and a black hoodie.

## Decisions

- **Drawn in pxl over the redesigned player boy** (`boy/pxl-new/boy.px.js`), not a
  PixelLab edit: no PixelLab key was set on this machine. Starting from the boy keeps the
  body, height (85 px), face and painterly style the same as the cast.
- **His look:** a black wolf cut (rounded choppy tufts on the crown, layers drawn as dark
  breaks lit on their upper side, curtain bangs from a middle parting, shaggy sides, long
  wispy layers down behind his neck); his own eyes, narrower and half-lidded under a heavy
  lash line, with level, softly arched brows (relaxed, not cross); a black hoodie with the
  hood bunched at the neck, drawstrings, a pocket seam, long sleeves with cuffs; the boy's
  pants and shoes; the backpack navy instead of maroon.
- **Idle like everyone's** (24 frames at 4/s: breathing, three blinks, a breeze in the back
  of his hair) and a talk portrait (32 x 32: mouth shut, open, blinking).
- **In the game as "Kaibigan"** in front of APS 104-105 beside gf and blonde, with a short
  talk: "Mayap a abak!" (the opening's greeting) and an invite to play at the gym, which he
  remembers. His walk, talk and wave fall back to his idle.

## What changed

- New `assets/drafts/characters/npcs/pxl/friend/` (`friend.px.js`, `friend-idle.px.js`,
  `build.ps1`, previews) and `src/drafts/aps-godot/sprites/npcs/friend/` (idle, portrait).
- `npcs.gd`: the friend in the cast.

## Left unfinished / known problems

- No name yet ("Kaibigan" for now), and no walk, talk or wave sheets: those want PixelLab
  redraws (`PIXELLAB_API_KEY`), then he can roam.
- The opening's close-up panels (`kaibigan.png`, `litrato.png`) should match this look.
