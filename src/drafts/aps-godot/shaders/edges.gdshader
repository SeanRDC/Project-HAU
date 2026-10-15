// Screen-space pixel edges, drawn once over the 3D world.
// Silhouettes against farther surfaces get a soft dark line; convex creases
// (box corners, slab lips, sills) get a faint highlight. Multiplying keeps the
// lighting, fog and glow underneath intact.
shader_type spatial;
render_mode unshaded, blend_mul, depth_draw_never, depth_test_disabled, cull_disabled, fog_disabled, shadows_disabled;

uniform sampler2D depth_tex : hint_depth_texture, filter_nearest;
uniform sampler2D normal_tex : hint_normal_roughness_texture, filter_nearest;
uniform float strength = 1.0;
uniform float line_dark = 0.32;
uniform float crease_light = 0.16;
uniform float depth_gap = 0.45;

void vertex() {
	POSITION = vec4(VERTEX.xy, 1.0, 1.0);
}

float view_depth(vec2 uv, mat4 inv_projection) {
	float raw = texture(depth_tex, uv).r;
	vec4 view = inv_projection * vec4(uv * 2.0 - 1.0, raw, 1.0);
	return -view.z / view.w;
}

vec3 view_normal(vec2 uv) {
	return normalize(texture(normal_tex, uv).xyz * 2.0 - 1.0);
}

void fragment() {
	vec2 texel = 1.0 / VIEWPORT_SIZE;
	float raw = texture(depth_tex, SCREEN_UV).r;
	float factor = 1.0;
	// Reversed Z: 0 is the sky, which never gets lines.
	if (raw > 0.0 && strength > 0.0) {
		float depth = view_depth(SCREEN_UV, INV_PROJECTION_MATRIX);
		vec3 normal = view_normal(SCREEN_UV);
		vec2 offsets[4] = vec2[](vec2(0.0, -1.0), vec2(0.0, 1.0), vec2(-1.0, 0.0), vec2(1.0, 0.0));
		float silhouette = 0.0;
		float crease = 0.0;
		for (int i = 0; i < 4; i++) {
			vec2 uv = SCREEN_UV + offsets[i] * texel;
			float other = view_depth(uv, INV_PROJECTION_MATRIX);
			// Allow for surfaces seen at a grazing angle before calling it an edge.
			float slack = depth_gap + depth * 0.004;
			silhouette += clamp((depth - other - slack) * 2.0, 0.0, 1.0);
			vec3 n = view_normal(uv);
			float bend = 1.0 - dot(normal, n);
			// Only the nearer side of a crease is lit, so each crease lights one pixel.
			float nearer = step(depth, other + 0.02);
			crease += smoothstep(0.25, 0.6, bend) * nearer;
		}
		silhouette = clamp(silhouette, 0.0, 1.0);
		crease = clamp(crease, 0.0, 1.0) * (1.0 - silhouette);
		factor = mix(1.0, 1.0 - line_dark, silhouette * strength);
		factor *= 1.0 + crease_light * crease * strength;
	}
	ALBEDO = vec3(factor);
}
