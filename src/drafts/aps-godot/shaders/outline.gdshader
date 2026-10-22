// The cutscene characters' black line (actor.gd): the model again, inside out, pushed out
// along its normals by a fixed number of screen pixels, so the outline is one render pixel
// at any zoom, round the silhouette and wherever a lock of hair or an arm stands in front of
// something further back. It is set back from the camera by depth_gap, so parts touching (one
// lock of hair on the next) do not draw a line between them; only real steps in depth do.
shader_type spatial;
render_mode unshaded, cull_front, shadows_disabled, fog_disabled;

uniform float width_px = 1.0;
uniform float depth_gap = 0.035;
uniform vec3 color : source_color = vec3(0.0);

void vertex() {
	vec4 view = MODELVIEW_MATRIX * vec4(VERTEX, 1.0);
	view.z -= depth_gap;
	vec4 clip = PROJECTION_MATRIX * view;
	vec3 normal = normalize((MODELVIEW_MATRIX * vec4(NORMAL, 0.0)).xyz);
	vec2 push = (PROJECTION_MATRIX * vec4(normal, 0.0)).xy;
	if (length(push) > 0.0001) {
		clip.xy += normalize(push) * width_px * 2.0 / VIEWPORT_SIZE * clip.w;
	}
	POSITION = clip;
}

void fragment() {
	ALBEDO = color;
}
