// Two-tone cel shading for the cutscene characters (actor.gd): each part is exactly its
// palette's base colour where the light reaches it and its shadow colour where it does not
// (turned away, or in a cast shadow), like the portraits: no gradients. The light's colour
// and strength still tint both, so a character sits in the hour and the weather.
// The face is a pixel texture strip of expressions; `face` picks one.
shader_type spatial;
render_mode diffuse_lambert, specular_disabled;

uniform vec3 base_color : source_color = vec3(1.0);
uniform vec3 shade_color : source_color = vec3(0.7);
uniform bool textured = false;
uniform sampler2D faces : source_color, filter_nearest, hint_default_white;
uniform float face = 0.0;
uniform float face_count = 8.0;
// how far round from the light a surface still counts as lit
uniform float threshold = 0.12;

void fragment() {
	vec3 colour = base_color;
	if (textured) {
		colour = texture(faces, vec2((clamp(UV.x, 0.001, 0.999) + face) / face_count, UV.y)).rgb;
	}
	ALBEDO = colour;
	ROUGHNESS = 1.0;
	SPECULAR = 0.0;
}

void light() {
	float lit = step(threshold, dot(NORMAL, LIGHT));
	float reach = 1.0;
	if (LIGHT_IS_DIRECTIONAL) {
		lit *= step(0.5, ATTENUATION); // the sun's cast shadows
	} else {
		reach = ATTENUATION; // lamps fall off with distance
	}
	vec3 shade = shade_color / max(base_color, vec3(0.01));
	DIFFUSE_LIGHT += LIGHT_COLOR / PI * mix(shade, vec3(1.0), lit) * reach;
}
