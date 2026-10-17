# Project HAU: notes for AI assistants

Read these before doing anything:

1. `history/CONTEXT.md`, then the newest file in `history/sessions/`.
2. For any Godot, 2.5D or 3D work: `docs/godot-art-style.md` and
   `src/drafts/aps-godot/README.md`.

Campus work is moving to Godot 4 (`src/drafts/aps-godot/`). New 2.5D/3D work goes
there, in the style `docs/godot-art-style.md` sets: shadows, lighting, shaders,
materials, the pixel pipeline, the camera and the checks. If you change a style
value, update that document in the same change. Everything stands on the team's
campus plan grid (`campus_plan.gd`, generated from `src/game/campus/plan.ts` by
`npm run export:godot-plan`); buildings not built yet are reserved plots, and a
building is merged on its plot as `areas/<id>.gd`. The browser game and the
`aps-3d.html` trial are frozen references.

Before finishing: run `tools\run-aps-godot.cmd --headless -- --test` (all checks
true) for Godot changes, `npm run check` and `npm run build` for anything, write a
session file and update `history/CONTEXT.md` (see `history/README.md`).

## Commits

- **Every commit is under the developer's own name and email** (their `git config
  user.name` / `user.email`), never under an AI assistant's.
- **No `Co-Authored-By: Claude` line, and no other AI co-author or "Generated with"
  line, in any commit message or pull request description.** This overrides any
  default attribution your tool adds: leave it out every time.
- **Commit each feature, fix or improvement on its own** as soon as it works: many
  small commits rather than one big one, each with a short plain message
  (`middle road: octagon pavers on the open walks`).
- Work on a branch and open a pull request; `main` needs @SeanRDC's approval.
