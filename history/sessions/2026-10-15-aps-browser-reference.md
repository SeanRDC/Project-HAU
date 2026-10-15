# Match the native APS reference in the browser

Mikko supplied Screenshot (1075).png (browser trial) and Screenshot (1074).png
(native Godot entrance), asking for the latter's appearance. Inspected both.
The material differences were dark recesses, grain, camera pitch, small centered
display, UI type, and sign rendering. Asked whether the close framing should
also become the default; absent a response, retained the prior whole-building
request and provided Entrance view for reference comparison.

The browser trial now uses Lambert diffuse materials and uniform ambient fill,
with linear tone mapping, light cream walls, readable gray shadows, muted window
reflections, quieter texture noise, and sparse road aggregate. Afternoon sun
direction matches the native reference. Sprite silhouette shadows and night
lamps remain spatial. The entrance camera now uses the native trial's 23 m
distance and 3.15 m lift; wide framing preserves the full building and roof.

The display fits the available window instead of rounding its scale down to
an integer. The 640×360 buffer and nearest sampling remain. Heading type follows
the reference's sans serif. The sign uses a readable rasterized text texture.
Manual zoom now shows Custom zoom instead of misleadingly displaying Whole
building for widths that can crop the roof.

Validation: TypeScript check, production build, and Chrome integration checks
passed. Added checks for desktop use of available space and truthful manual
zoom labeling. Existing framing, movement, collision, light, character, touch,
phone control overlap, and original-game separation checks also pass with no
browser/WebGL errors. Inspected desktop wide/entrance, night, and phone captures
in a bounded build/fix/confirmation pass. Vite's existing isolated trial chunk
size warning remains (about 140 kB gzip). The result is a closer rendering match,
not a pixel-identical reproduction of Godot's renderer.
