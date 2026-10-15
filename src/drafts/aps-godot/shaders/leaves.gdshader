// Pixel foliage cards: alpha-cut leaves that sway gently, cast matching
// shadows and let low sun glow through from behind.
shader_type spatial;
render_mode cull_disabled, diffuse_lambert, specular_disabled;

uniform sampler2D leaves : source_color, filter_nearest_mipmap, repeat_disable;
uniform float sway = 0.045;
uniform float phase = 0.0;

void vertex() {
	vec3 world = (MODEL_MATRIX * vec4(VERTEX, 1.0)).xyz;
	float reach = 1.0 - UV.y;
	float t = TIME * 1.1 + phase + world.x * 0.31 + world.z * 0.17;
	VERTEX.x += sin(t) * sway * reach;
	VERTEX.y += cos(t * 0.73) * sway * 0.35 * reach;
}

void fragment() {
	vec4 leaf = texture(leaves, UV);
	ALBEDO = leaf.rgb;
	ALPHA = leaf.a;
	ALPHA_SCISSOR_THRESHOLD = 0.4;
	if (!FRONT_FACING) {
		NORMAL = -NORMAL;
	}
	BACKLIGHT = leaf.rgb * 0.45;
}
