# APS browser 2.5D trial

Mikko approved a browser-based spatial graphics experiment after reviewing the
native Godot option, then asked to zoom out so the entire building is visible
and its scale reads clearly. The browser preview is `/aps-3d.html`.

Implemented a separate Three.js entry under `src/drafts/aps-browser/`, with
spatial slabs, corridors, stone columns, canopy, tall block, foliage, procedural
pixel textures, and original boy/girl PNG sprites. Students receive light and
cast animated silhouette shadows. Morning/noon/afternoon/night presets control
sun, ambient light, emissive windows, and lamps. Movement has ground contact and
pillar collision. Repeated box geometry uses instances.

The orthographic camera starts at width 56, covering the frontage and roof.
Scroll, +/−, or the framing selector zoom in; Reset restores the wide view.
Portrait phone controls sit outside the rendered scene. Render resolution is
640×360, scaled to fit with nearest filtering. Keyboard and touch are supported.

Installed pinned Three.js 0.186.1 and types 0.186.0. Vite builds both the
original game and trial as separate entries; Three.js stays on the trial page.
No Godot installation is needed for the browser trial. This is approximate art
and geometry for review, with no story, save, or campus integration.

Validation: TypeScript check and production build; Chrome integration checks
for full frontage/roof bounds, rendering, movement, collision, character switch,
ground contact, lighting, reset, camera, phone layout, touch, no runtime/WebGL
errors, and original-game separation. Review captures are in ignored
`builds/aps-browser-review/`. Independent finish review identified portrait
control overlap; controls were moved outside the scene and a regression check
was added. See `tools/check-aps-browser.mjs` for repeatable verification.
The revised capture received a ship verdict. The built-page Chrome smoke check
also passed, including asset loading, controls, wide-view reset, no development
debug global, and no browser/WebGL errors. Vite reports the isolated Three.js
trial chunk over its default 500 kB warning threshold (about 141 kB gzip).
