shader_type spatial;
// A light shaft under a tree crown: a card laid along the sun's direction that only
// adds a little warm light, strongest in its middle, fading at its ends and edges.
render_mode blend_add, unshaded, cull_disabled, depth_draw_never, shadows_disabled, fog_disabled;

uniform vec4 color : source_color = vec4(1.0, 0.86, 0.6, 1.0);
uniform float strength = 0.08;

void fragment() {
	float across = 1.0 - abs(UV.x * 2.0 - 1.0);
	float along = smoothstep(0.0, 0.25, UV.y) * smoothstep(1.0, 0.55, UV.y);
	ALBEDO = color.rgb * strength * across * across * along;
}
