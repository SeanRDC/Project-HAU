shader_type spatial;
// The section fill: drawn as a material's next pass, only the back faces, flat in the cutaway
// band's colour (display.gdshader cut_color). Seen from outside a closed block they stand behind
// its front faces and never show; when the cutaway's near plane slices through the block they are
// all that is left of it, so the cut part reads as a solid dark section, not a hollow shell.
render_mode unshaded, cull_front, fog_disabled, shadows_disabled;

uniform vec3 colour : source_color = vec3(0.075, 0.068, 0.062);

void fragment() {
	ALBEDO = colour;
}
