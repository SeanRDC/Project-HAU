// Orthographic cameras look along a single direction, so a normal sky would
// paint one flat colour. This sky grades over the screen instead, with pixel stars
// at night. Lighting probes use the direction-based gradient.
//
// The night sky: stars in a few sizes, brightnesses and tints (the brightest with a
// small pixel cross), some twinkling slowly, a faint Milky Way band with more tiny
// stars in it, and the moon with a soft glow where the night light comes from. In the
// F2 free cam (perspective, `free_look`) all of it is laid out by direction, so it stays
// put in the sky as the camera turns; in the game's orthographic views it is laid out
// over the screen. Rain clouds (`overcast`) hide it.
shader_type sky;

uniform vec3 top_color : source_color = vec3(0.36, 0.54, 0.69);
uniform vec3 horizon_color : source_color = vec3(0.93, 0.83, 0.68);
uniform vec3 ground_color : source_color = vec3(0.40, 0.45, 0.41);
uniform float stars = 0.0;
uniform float overcast = 0.0;
uniform bool free_look = false;
// Towards the moon: the night light's direction (set with the sun, so it matches the shadows).
uniform vec3 moon_dir = vec3(-0.45, 0.55, -0.7);

// Free cam: star cells per cube face (about one or two render pixels each).
const float GRID = 512.0;
// The moon's angular radius (radians); it is drawn larger than the real one, to read.
const float MOON = 0.035;

// Hashes without sin(): sin() of the large cell numbers loses precision on the GPU and
// lines the stars up in streaks.
float hash(vec2 p) {
	vec3 q = fract(vec3(p.xyx) * 0.1031);
	q += dot(q, q.yzx + 33.33);
	return fract((q.x + q.y) * q.z);
}

float hash3(vec3 p) {
	p = fract(p * 0.1031);
	p += dot(p, p.zyx + 31.32);
	return fract((p.x + p.y) * p.z);
}

// Smooth value noise in 3D, for the Milky Way's haze and the moon's dark patches.
float noise(vec3 p) {
	vec3 i = floor(p);
	vec3 f = fract(p);
	f = f * f * (3.0 - 2.0 * f);
	return mix(mix(mix(hash3(i), hash3(i + vec3(1, 0, 0)), f.x), mix(hash3(i + vec3(0, 1, 0)), hash3(i + vec3(1, 1, 0)), f.x), f.y),
		mix(mix(hash3(i + vec3(0, 0, 1)), hash3(i + vec3(1, 0, 1)), f.x), mix(hash3(i + vec3(0, 1, 1)), hash3(i + vec3(1, 1, 1)), f.x), f.y), f.z);
}

float clouds(vec3 p) {
	return noise(p) * 0.55 + noise(p * 2.1) * 0.3 + noise(p * 4.3) * 0.15;
}

bool bright_star(vec2 cell) {
	return hash(cell) > 0.9993;
}

// The light of the star in a cell (or of the arm of a bright neighbour's cross);
// `density` is how far into the Milky Way the cell lies (0..1).
vec3 star(vec2 cell, float density) {
	float h = hash(cell);
	if (h < 0.99 - 0.035 * density) {
		bool arm = bright_star(cell + vec2(1.0, 0.0)) || bright_star(cell - vec2(1.0, 0.0))
			|| bright_star(cell + vec2(0.0, 1.0)) || bright_star(cell - vec2(0.0, 1.0));
		return arm ? vec3(0.8, 0.86, 1.0) * 0.32 : vec3(0.0);
	}
	float level = mix(0.16, 0.75, pow(hash(cell + 5.7), 3.0)) + (bright_star(cell) ? 0.7 : 0.0);
	if (hash(cell + 11.3) > 0.55) {
		// a slow twinkle, each star at its own pace
		level *= 0.62 + 0.38 * sin(TIME * (0.9 + 1.8 * hash(cell + 13.1)) + 6.283 * hash(cell + 17.7));
	}
	float tint = hash(cell + 9.2);
	vec3 colour = tint < 0.18 ? vec3(1.0, 0.85, 0.68) : (tint < 0.42 ? vec3(0.72, 0.83, 1.0) : vec3(0.93, 0.95, 1.0));
	return colour * level;
}

// The moon on a unit disk `p` (its middle 0, its rim 1): pale, with soft dark patches
// and a darker limb.
vec3 moon_face(vec2 p) {
	float patches = smoothstep(0.45, 0.7, clouds(vec3(p * 2.6, 3.7)));
	float limb = 1.0 - 0.28 * dot(p, p);
	return vec3(0.95, 0.94, 0.88) * limb * (1.0 - 0.3 * patches);
}

// The cell a direction falls in, on a cube round the camera (so the stars stay put).
vec2 sky_cell(vec3 dir) {
	vec3 a = abs(dir);
	vec2 uv;
	float face;
	if (a.x >= a.y && a.x >= a.z) {
		uv = dir.zy / a.x;
		face = dir.x > 0.0 ? 0.0 : 1.0;
	} else if (a.y >= a.z) {
		uv = dir.xz / a.y;
		face = dir.y > 0.0 ? 2.0 : 3.0;
	} else {
		uv = dir.xy / a.z;
		face = dir.z > 0.0 ? 4.0 : 5.0;
	}
	return floor(uv * GRID) + vec2(face * 2000.0, 0.0);
}

// Free cam: the night sky along a direction.
vec3 night_by_direction(vec3 dir) {
	vec3 light = vec3(0.0);
	float up = smoothstep(0.0, 0.25, dir.y);
	// The Milky Way: a hazy band round a great circle, patchy, with more stars in it.
	float across = dot(dir, normalize(vec3(0.35, 0.45, -0.82)));
	float band = exp(-across * across * 26.0);
	float haze = band * smoothstep(0.35, 0.8, clouds(dir * 5.0));
	light += vec3(0.5, 0.56, 0.78) * 0.09 * haze;
	// The moon and its glow; the stars thin out near it.
	vec3 towards = normalize(moon_dir);
	float facing = dot(dir, towards);
	float off = acos(clamp(facing, -1.0, 1.0));
	float near_moon = smoothstep(MOON * 1.2, MOON * 4.0, off);
	light += star(sky_cell(dir), band) * near_moon;
	light += vec3(0.62, 0.7, 0.9) * (0.22 * exp(-off * 18.0) + 0.18 * exp(-off * 60.0));
	if (off < MOON) {
		vec3 side = normalize(cross(towards, vec3(0.0, 1.0, 0.0)));
		vec3 rise = cross(side, towards);
		vec2 p = vec2(dot(dir, side), dot(dir, rise)) / MOON;
		return moon_face(p) * up;
	}
	return light * up;
}

// The game's orthographic views: the night sky over the screen (`height` 0 at the bottom).
vec3 night_on_screen(vec2 pixel, vec2 size, float height) {
	vec3 light = vec3(0.0);
	float x = pixel.x / size.x;
	// The Milky Way: a hazy band across the screen from low left to high right.
	float across = height - (0.3 + 0.55 * x);
	float band = exp(-across * across * 60.0);
	light += vec3(0.5, 0.56, 0.78) * 0.08 * band * smoothstep(0.35, 0.8, clouds(vec3(pixel / 70.0, 1.3)));
	// The moon, high on the right, a fixed size in render pixels.
	vec2 centre = vec2(0.8, 0.18) * size;
	float radius = max(6.0, size.y * 0.035);
	float off = distance(pixel, centre) / radius;
	light += star(floor(pixel / 2.0), band) * smoothstep(1.3, 4.0, off);
	light += vec3(0.62, 0.7, 0.9) * (0.22 * exp(-off * 0.7) + 0.16 * exp(-off * 2.2));
	if (off < 1.0) {
		return moon_face((pixel - centre) / radius * vec2(1.0, -1.0));
	}
	return light * smoothstep(0.3, 0.75, height);
}

void sky() {
	float clear = stars * (1.0 - overcast);
	if (AT_CUBEMAP_PASS) {
		float up = EYEDIR.y;
		COLOR = up > 0.0 ? mix(horizon_color, top_color, smoothstep(0.0, 0.8, up)) : mix(horizon_color, ground_color, smoothstep(0.0, 0.3, -up));
	} else if (free_look) {
		float up = EYEDIR.y;
		vec3 color = up > 0.0 ? mix(horizon_color, top_color, smoothstep(0.0, 0.8, up)) : mix(horizon_color, ground_color, smoothstep(0.0, 0.3, -up));
		if (clear > 0.0) {
			color += night_by_direction(EYEDIR) * clear;
		}
		COLOR = color;
	} else {
		float height = 1.0 - SCREEN_UV.y;
		vec3 color = mix(horizon_color, top_color, smoothstep(0.05, 0.95, height));
		if (clear > 0.0) {
			color += night_on_screen(FRAGCOORD.xy, FRAGCOORD.xy / max(SCREEN_UV, vec2(0.0001)), height) * clear;
		}
		COLOR = color;
	}
}
