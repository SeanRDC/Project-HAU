# Draft 3D models

Drafts of the 3D cutscene characters, made by the Blender scripts in `tools/blender/`.
Change the scripts and run them again rather than editing these by hand.

- `lance.blend`: the low-poly Lance (`tools/blender/lance.py`). The game loads its export,
  `src/drafts/aps-godot/models/lance.glb`, drawn as pixel art (`actor.gd`).
- `lance-hd.blend`: the same Lance smooth and cel-shaded, not pixel art
  (`tools/blender/lance_hd.py`). In Blender press Z, then Rendered, to see his colours.
- `lance_face_hd.png`: his smooth face texture.
- `angel_fountain.blend`: the sandstone group on the boulevard's angel fountain (the guardian
  angel, the girl, the boy, the book, their rock; `tools/blender/angel_fountain.py`, from metaballs
  and the close-ups in `assets/images/other references/`). The game loads its export,
  `src/drafts/aps-godot/models/angel_fountain.glb`, in `areas/middle_road.gd` (a trial: the
  first statue from Blender in the world).

See "Cutscene characters (3D)" in `docs/godot-art-style.md`.
