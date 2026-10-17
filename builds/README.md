# Builds

Nothing in this folder is committed except this README (see the root `.gitignore`). It is where local tools and outputs go:

| Folder | What |
| --- | --- |
| `godot-tools/4.7.2/` | The portable Godot 4.7.2 editor, if you keep it here. `tools\run-aps-godot.cmd` looks here first; otherwise set `GODOT` or have `godot` in PATH |
| `aps-godot-review/port/` | Review shots of the Godot game from `sh tools/capture-aps-godot.sh` |
| `web/` | The browser prototype's build from `npm run build`. Open it with `npm run preview`, or upload it to any static host |
| `aps-browser-review/` | Shots of the frozen Three.js APS trial from `npm run check:aps-browser -- --capture` |

The Godot game has no export presets yet (`export_presets.cfg` is ignored). Until it does, play it from the editor or with `tools\run-aps-godot.cmd`.
