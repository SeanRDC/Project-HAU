shader_type canvas_item;
// The opening's panels (opening.gd). A campus photo standing in for a drawn panel becomes
// pen and ink: its edges are ink lines, deep shadow is solid black, shadow is diagonal
// hatching, mid-tones are screentone dots and the rest is paper. ink = 0 shows a drawn
// panel as it is, only greyed and laid onto the paper.

uniform float ink : hint_range(0.0, 1.0) = 1.0;
uniform vec4 paper : source_color = vec4(0.957, 0.945, 0.918, 1.0);
uniform vec4 pen : source_color = vec4(0.11, 0.106, 0.098, 1.0);
// screentone and hatching spacing, in screen pixels (fixed on screen as real tone is on paper)
uniform float tone = 4.0;

float lum(vec3 c) { return dot(c, vec3(0.299, 0.587, 0.114)); }

float at(sampler2D tex, vec2 uv) { return lum(texture(tex, uv).rgb); }

void fragment() {
	vec2 p = TEXTURE_PIXEL_SIZE * 1.5;
	float tl = at(TEXTURE, UV + vec2(-p.x, -p.y));
	float t = at(TEXTURE, UV + vec2(0.0, -p.y));
	float tr = at(TEXTURE, UV + vec2(p.x, -p.y));
	float l = at(TEXTURE, UV + vec2(-p.x, 0.0));
	float r = at(TEXTURE, UV + vec2(p.x, 0.0));
	float bl = at(TEXTURE, UV + vec2(-p.x, p.y));
	float b = at(TEXTURE, UV + vec2(0.0, p.y));
	float br = at(TEXTURE, UV + vec2(p.x, p.y));
	float gx = (tr + 2.0 * r + br) - (tl + 2.0 * l + bl);
	float gy = (bl + 2.0 * b + br) - (tl + 2.0 * t + tr);
	float edge = smoothstep(0.3, 0.62, length(vec2(gx, gy)));

	float light = at(TEXTURE, UV);
	// phone photos are flat and bright: stretch them so paper and shadow both show
	float dark = 1.0 - smoothstep(0.04, 0.72, light);
	vec2 cell = fract(FRAGCOORD.xy / tone) - 0.5;
	float dots = step(0.4, dark) * step(length(cell), sqrt(clamp((dark - 0.4) * 1.5, 0.0, 1.0)) * 0.55);
	float hatch = step(0.74, dark) * step(fract((FRAGCOORD.x + FRAGCOORD.y) / (tone * 0.75)), 0.42);
	float black = step(0.94, dark);
	float mark = max(max(edge, black), max(dots, hatch));
	vec3 inked = mix(paper.rgb, pen.rgb, mark);

	vec3 drawn = paper.rgb * mix(0.12, 1.0, light);
	COLOR = vec4(mix(drawn, inked, ink), COLOR.a);
}
