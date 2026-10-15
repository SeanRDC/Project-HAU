# APS Godot 2.5D trial

## Request and direction

Mikko, with Codex. After reviewing the scope of the Canvas lighting pass, Mikko
asked to try an APS 2.5D prototype and whether Godot was required. Godot is not a
requirement for the visual style; it was selected for this isolated trial because
the project's planned engine migration already targets it. Browser Three.js was
offered as an alternative; the stated default was the Godot trial.

## Changes

- `src/drafts/aps-godot/`: standalone Godot project with the APS entrance and
  part of the corridor facade built from 3D meshes. Recessed windows, balcony
  slabs, a projecting canopy, stone columns, tiled forecourt, trees and lanterns.
- Reuses copies of the existing boy/girl idle and walk sheets. Sprites use
  shaded alpha-cut rendering and cast silhouettes into actual 3D shadows.
- Deterministic procedural pixel materials; a 640x360 world enlarged with
  nearest-neighbor sampling; native-resolution help and time display.
- A/D walking, W/S depth, Shift running, T time presets, C character switch,
  Q/E camera angle, R reset, Tab instructions, Escape close.
- Four column blockers and surface-height adjustment. This is a graphics trial,
  not a full physics/gameplay implementation.
- `tools/run-aps-godot.cmd`: Windows launcher supporting the local portable
  editor, a GODOT executable path, or godot in PATH.

## Local engine

Downloaded the official portable Godot 4.7.2 Windows build into ignored
`builds/godot-tools/4.7.2/`. No global install, binary commit or system setting
change. Forward+ was verified on the AMD Radeon RX 5600 XT via Vulkan 1.4.315.
The optional Compatibility fallback has reduced visual features.

## Validation

- Imported assets with the headless editor; corrected a reflection-source enum.
- Headless scene checks pass: scene construction, shaded/alpha-cut student,
  sun shadows, time and lamp presets, sheet switching, column bounds, ground
  contact, simulated walking and movement stopped by a column.
- Native GPU captures of morning, afternoon, night, and the girl under the
  canopy are in ignored `builds/aps-godot-review/`. Corrected initial overexposure
  and repositioned instructions so they do not cover the character.
- The browser game's `npm run check` still passes. Its assets, story, routes,
  rendering and saves were not changed by this separate prototype.

## Limits / next review

Approximate geometry proportions from local APS photos, not a surveyed model.
Procedural first-pass materials and existing sprites demonstrate the pipeline;
they do not reproduce Until Then's finished artwork. No quests, doors, full
prop collisions, rain, complete campus or engine migration. Review this native
scene before expanding its scope.
