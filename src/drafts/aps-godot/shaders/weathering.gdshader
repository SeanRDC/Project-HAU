// Weathering, drawn as a second pass over the wall materials (world.gd WEATHERED): a
// grime band at the foot of every vertical face, in three hard steps like hand-placed
// pixel shading, and faint paint patches. Multiplied, so any wall colour keeps its hue.
shader_type spatial;
render_mode unshaded, blend_mul, depth_draw_never, cull_back, fog_disabled, shadows_disabled;

uniform float grime = 0.22;
uniform float grime_height = 1.15;
uniform float patches = 0.06;
// The occluder fade (world.gd set_occluder_fade): no grime on walls that are fading out.
global uniform vec3 occluder_eye;
global uniform vec2 occluder_fade;

varying vec3 world;
varying vec3 world_normal;

void vertex() {
	world = (MODEL_MATRIX * vec4(VERTEX, 1.0)).xyz;
	world_normal = normalize(mat3(MODEL_MATRIX) * NORMAL);
}

float hash(vec2 p) {
	return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
	vec2 i = floor(p);
	vec2 f = fract(p);
	f = f * f * (3.0 - 2.0 * f);
	return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}

void fragment() {
	float factor = 1.0;
	if (abs(world_normal.y) < 0.35 && distance(world, occluder_eye) > occluder_fade.y) {
		float along = abs(world_normal.x) > abs(world_normal.z) ? world.z : world.x;
		float height = grime_height * (0.6 + 0.8 * noise(vec2(along * 0.7, 3.1)));
		float band = clamp(1.0 - world.y / height, 0.0, 1.0);
		factor *= 1.0 - grime * ceil(band * 3.0) / 3.0;
		float blot = noise(vec2(along, world.y * 1.6) * 0.45);
		factor *= 1.0 - patches * step(0.62, blot);
	}
	ALBEDO = vec3(factor);
}
