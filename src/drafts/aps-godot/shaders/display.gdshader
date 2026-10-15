// Final grade on the upscaled world: warm light, cool shade, a soft vignette.
shader_type canvas_item;

uniform float warmth = 0.06;
uniform float vignette = 0.22;
uniform vec3 shade_tint : source_color = vec3(0.86, 0.9, 1.0);
uniform vec3 light_tint : source_color = vec3(1.0, 0.97, 0.9);

void fragment() {
	vec3 color = COLOR.rgb;
	float luma = dot(color, vec3(0.299, 0.587, 0.114));
	vec3 tint = mix(shade_tint, light_tint, smoothstep(0.15, 0.8, luma));
	color = mix(color, color * tint, warmth * 4.0);
	vec2 centered = UV - 0.5;
	color *= 1.0 - vignette * smoothstep(0.35, 0.85, length(centered * vec2(1.0, 0.85)));
	COLOR.rgb = color;
}
