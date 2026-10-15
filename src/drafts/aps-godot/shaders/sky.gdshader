// Orthographic cameras look along a single direction, so a normal sky would
// paint one flat colour. This sky grades over the screen instead, with a few
// fixed pixel stars at night. Lighting probes use the direction-based gradient.
shader_type sky;

uniform vec3 top_color : source_color = vec3(0.36, 0.54, 0.69);
uniform vec3 horizon_color : source_color = vec3(0.93, 0.83, 0.68);
uniform vec3 ground_color : source_color = vec3(0.40, 0.45, 0.41);
uniform float stars = 0.0;

float hash(vec2 p) {
	return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

void sky() {
	if (AT_CUBEMAP_PASS) {
		float up = EYEDIR.y;
		COLOR = up > 0.0 ? mix(horizon_color, top_color, smoothstep(0.0, 0.8, up)) : mix(horizon_color, ground_color, smoothstep(0.0, 0.3, -up));
	} else {
		float height = 1.0 - SCREEN_UV.y;
		vec3 color = mix(horizon_color, top_color, smoothstep(0.05, 0.95, height));
		vec2 cell = floor(FRAGCOORD.xy / 2.0);
		float star = step(0.9965, hash(cell)) * smoothstep(0.35, 0.8, height);
		color += vec3(0.75, 0.8, 0.95) * star * stars * (0.5 + 0.5 * hash(cell + 7.0));
		COLOR = color;
	}
}
