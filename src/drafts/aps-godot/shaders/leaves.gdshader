// Pixel foliage cards: alpha-cut leaves and grass that sway gently, cast
// matching shadows and let low sun glow through from behind. Cards are lit as
// if they were part of a round volume around `center`, so a crown of crossed
// leaf clusters shades like a 3D canopy from every camera angle (lit on the sun
// side, darker underneath) instead of like flat cut-outs.
shader_type spatial;
render_mode cull_disabled, diffuse_lambert, specular_disabled;

uniform sampler2D leaves : source_color, filter_nearest_mipmap, repeat_disable;
uniform float sway = 0.045;
uniform float phase = 0.0;
// The volume's middle. Grass puts it far below, so its normals point up like the lawn.
uniform vec3 center = vec3(0.0, -1000.0, 0.0);
uniform float roundness = 0.75;
// The wind (atmosphere.gd): 1 on a still day, up to about 3.6 on a windy one.
global uniform float wind;

// World position per pixel: the round normal must be worked out per pixel, or
// crossing cards interpolate different normals and meet with a visible seam.
varying vec3 world_position;

void vertex() {
	vec3 world = (MODEL_MATRIX * vec4(VERTEX, 1.0)).xyz;
	float reach = 1.0 - UV.y;
	float gust = max(wind, 1.0);
	float t = TIME * (1.1 + 0.5 * (gust - 1.0)) + phase + world.x * 0.31 + world.z * 0.17;
	VERTEX.x += (sin(t) + 0.6 * (gust - 1.0)) * sway * gust * reach;
	VERTEX.y += cos(t * 0.73) * sway * 0.35 * reach;
	world_position = (MODEL_MATRIX * vec4(VERTEX, 1.0)).xyz;
}

void fragment() {
	vec4 leaf = texture(leaves, UV);
	ALBEDO = leaf.rgb;
	vec3 card = FRONT_FACING ? NORMAL : -NORMAL;
	// A card seen edge-on would draw as a thin straight line of leaves through the
	// crown; the crossed cards around it already fill that view, so it fades out.
	ALPHA = leaf.a * smoothstep(0.1, 0.3, abs(dot(card, VIEW)));
	ALPHA_SCISSOR_THRESHOLD = 0.4;
	vec3 round_normal = (VIEW_MATRIX * vec4(normalize(world_position - center), 0.0)).xyz;
	NORMAL = normalize(mix(card, round_normal, roundness));
	BACKLIGHT = leaf.rgb * 0.45;
}
