extends Node3D
## Weather and atmosphere, after Until Then: the weather (clear, overcast, rain, a
## thunderstorm, a windy day) comes and goes, G steps through it; the ground is wet and
## reflective only while it rains; leaves fall from the trees (and blow about in the wind),
## light shafts slant under them, dust drifts in the low sun, and mist lies on the lawns at
## dawn.
## See "Weather and atmosphere" in docs/godot-art-style.md.

## Ground materials that get wet. Floors under a roof ("tile", "floor") stay dry.
const WET_KINDS := ["road", "stone", "brick", "pavers", "concrete", "slate"]
const World := preload("res://world.gd")

var world
var camera: Camera3D
var sun: DirectionalLight3D
var environment: Environment
var sky: ShaderMaterial
## Where the student is, and how wide the view is (metres), set every frame.
var focus := Vector3.ZERO
var view_width := 56.0
var indoor := false
var night := false
var hour := 16.5
## The weathers G steps through, and what each sets: rain, gloom (an overcast sky's flat
## grey light), fog, wind, and thunder and lightning.
const WEATHERS := ["clear", "overcast", "rain", "storm", "windy"]
const WEATHER := {
	"clear": {"rain": 0.0, "gloom": 0.0, "fog": 0.0, "wind": 0.0, "storm": false},
	"overcast": {"rain": 0.0, "gloom": 0.75, "fog": 0.0, "wind": 0.2, "storm": false},
	"rain": {"rain": 1.0, "gloom": 1.0, "fog": 0.0, "wind": 0.3, "storm": false},
	"storm": {"rain": 1.0, "gloom": 1.0, "fog": 0.0, "wind": 0.8, "storm": true},
	"windy": {"rain": 0.0, "gloom": 0.15, "fog": 0.0, "wind": 1.0, "storm": false},
}
## How often each comes up by itself (clear and overcast spells most).
const WEATHER_ODDS := {"clear": 4.0, "overcast": 2.0, "rain": 2.0, "storm": 0.7, "windy": 1.2}
var weather := "clear"
## 0..1 now, easing towards the weather's: how hard it is raining, gloom, fog, wind.
var rain := 0.0
var rain_target := 0.0
var gloom := 0.0
var fog := 0.0
var wind := 0.0
## Lightning strikes so far (for the checks), and the flash now (0..1).
var strikes := 0
var flash := 0.0
## The weather changes by itself until G is pressed.
var auto_weather := true
## Set by the scene: the time preset's dawn mist, light shafts and shaft colour.
var mist := 0.0
var sound: Node
var dust := GPUParticles3D.new()
var _next_strike := 6.0
var _thunder_at := -1.0
var _second_flash := -1.0
var rain_fx := GPUParticles3D.new()
var splash_fx := GPUParticles3D.new()
var leaves: Array[GPUParticles3D] = []
var shafts := Node3D.new()
## Puddles that mirror the sky while it is wet, and the lamps' long reflections at night.
var puddles: Array[Decal] = []
var glints: Array[MeshInstance3D] = []
var _glint_base: Array[Vector3] = [] # where each lamp meets the ground
var _glint_material := ShaderMaterial.new()
var _shaft_material := ShaderMaterial.new()
var _clock := 0.0
var _next_change := 75.0
var _dry := {} # material -> [albedo, roughness]
var _base := {} # the hour preset's values, before the rain

func build() -> void:
	name = "Atmosphere"
	_build_rain()
	_build_leaves()
	_build_puddles()
	_build_dust()
	shafts.name = "LightShafts"
	add_child(shafts)
	_shaft_material.shader = preload("res://shaders/shaft.gdshader")

# --- Rain ---------------------------------------------------------------------

func _build_rain() -> void:
	var drop := QuadMesh.new()
	drop.size = Vector2(0.03, 0.55)
	var streak := StandardMaterial3D.new()
	streak.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	streak.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	streak.albedo_color = Color(0.8, 0.86, 0.95, 0.24)
	streak.billboard_mode = BaseMaterial3D.BILLBOARD_FIXED_Y
	streak.billboard_keep_scale = true
	drop.material = streak
	var fall := ParticleProcessMaterial.new()
	fall.emission_shape = ParticleProcessMaterial.EMISSION_SHAPE_BOX
	fall.direction = Vector3(0.08, -1, 0)
	fall.spread = 2.0
	fall.initial_velocity_min = 16.0
	fall.initial_velocity_max = 20.0
	fall.gravity = Vector3(0, -6, 0)
	rain_fx.name = "Rain"
	rain_fx.process_material = fall
	rain_fx.draw_pass_1 = drop
	rain_fx.amount = 4000
	rain_fx.lifetime = 1.0
	rain_fx.local_coords = false
	rain_fx.visibility_aabb = AABB(Vector3(-90, -30, -60), Vector3(180, 60, 120))
	rain_fx.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
	rain_fx.emitting = false
	add_child(rain_fx)
	var ring := QuadMesh.new()
	ring.size = Vector2(0.1, 0.035)
	var splash := streak.duplicate() as StandardMaterial3D
	splash.albedo_color = Color(0.85, 0.9, 0.97, 0.28)
	splash.billboard_mode = BaseMaterial3D.BILLBOARD_ENABLED
	ring.material = splash
	var hop := ParticleProcessMaterial.new()
	hop.emission_shape = ParticleProcessMaterial.EMISSION_SHAPE_BOX
	hop.direction = Vector3(0, 1, 0)
	hop.spread = 50.0
	hop.initial_velocity_min = 0.4
	hop.initial_velocity_max = 0.9
	hop.gravity = Vector3(0, -6, 0)
	hop.scale_min = 0.6
	hop.scale_max = 1.2
	splash_fx.name = "Splashes"
	splash_fx.process_material = hop
	splash_fx.draw_pass_1 = ring
	splash_fx.amount = 320
	splash_fx.lifetime = 0.2
	splash_fx.local_coords = false
	splash_fx.visibility_aabb = rain_fx.visibility_aabb
	splash_fx.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
	splash_fx.emitting = false
	add_child(splash_fx)

## The global shader value the foliage sways by; added once, before anything is built.
static var _wind_added := false
static func add_wind() -> void:
	if not _wind_added:
		_wind_added = true
		RenderingServer.global_shader_parameter_add("wind", RenderingServer.GLOBAL_VAR_TYPE_FLOAT, 1.0)

## G: the next weather, by hand (and the weather stops changing by itself).
func toggle_rain() -> void:
	auto_weather = false
	set_weather(WEATHERS[(WEATHERS.find(weather) + 1) % WEATHERS.size()])

func set_weather(name_: String, at_once := false) -> void:
	weather = name_
	rain_target = WEATHER[name_].rain
	_next_strike = _clock + randf_range(2.0, 5.0)
	if at_once:
		rain = rain_target
		gloom = WEATHER[name_].gloom
		fog = WEATHER[name_].fog
		wind = WEATHER[name_].wind

## For the start and for captures: rain now, at full strength.
func start_raining() -> void:
	auto_weather = false
	set_weather("rain", true)

## A random weather by the odds, not the one now.
func _pick_weather() -> String:
	var total := 0.0
	for w in WEATHER_ODDS:
		total += 0.0 if w == weather else WEATHER_ODDS[w]
	var roll := randf() * total
	for w in WEATHER_ODDS:
		if w == weather:
			continue
		roll -= WEATHER_ODDS[w]
		if roll <= 0.0:
			return w
	return "clear"

## The hour preset's values, taken after _set_hour so the weather works from them.
func set_hour(value: float, is_night: bool, preset := {}) -> void:
	hour = value
	night = is_night
	mist = preset.get("mist", 0.0)
	_shaft_strength = preset.get("shafts", 0.085)
	_shaft_colour = Color(preset.get("shaft_colour", "ffd59a"))
	_base = {
		"sun": sun.light_energy, "ambient": environment.ambient_light_color,
		"fog": environment.fog_density, "fog_color": environment.fog_light_color,
		"top": sky.get_shader_parameter("top_color"), "horizon": sky.get_shader_parameter("horizon_color"),
		"ambient_energy": environment.ambient_light_energy, "contrast": environment.adjustment_contrast,
	}
	_place_shafts()

func _weather(delta: float) -> void:
	if auto_weather and _clock >= _next_change:
		set_weather(_pick_weather())
		_next_change = _clock + (randf_range(80.0, 160.0) if weather == "clear" else randf_range(50.0, 100.0))
	var want: Dictionary = WEATHER[weather]
	rain = move_toward(rain, rain_target, delta / 6.0) # showers build and ease over about six seconds
	gloom = move_toward(gloom, want.gloom, delta / 8.0)
	fog = move_toward(fog, want.fog, delta / 10.0)
	wind = move_toward(wind, want.wind, delta / 5.0)
	_lightning(delta, want.storm)
	RenderingServer.global_shader_parameter_set("wind", 1.0 + 2.6 * wind)
	if _base.is_empty():
		return
	# grey, flat light under cloud (overcast, rain, fog): the sun dims, the ambient fill
	# rises and goes grey so the shadows soften away
	var grey := Color("4a5670") if night else Color("8f98a4")
	var pale := Color("8a93a6") if night else Color("c9ced4")
	sun.light_energy = _base.sun * (1.0 - 0.8 * gloom) * (1.0 - 0.35 * fog)
	environment.ambient_light_color = (_base.ambient as Color).lerp(grey, 0.45 * gloom).lerp(pale, 0.3 * fog)
	environment.ambient_light_energy = _base.ambient_energy * (1.0 + 0.5 * gloom) + flash * 2.2
	environment.adjustment_contrast = _base.contrast - 0.06 * gloom
	# fog thickens the haze and pales it; the dawn mist and the fog also lie low on the ground
	environment.fog_density = _base.fog + 0.9 * rain + 1.6 * fog
	environment.fog_light_color = (_base.fog_color as Color).lerp(grey, 0.6 * gloom).lerp(pale, 0.7 * fog)
	# (the camera is orthographic, so distance fog is nearly even over the view; the fog's
	# body is height fog, thick at the ground and thinning upwards)
	var low := maxf(mist * 0.45, fog)
	environment.fog_height = lerpf(0.6, 1.4, fog)
	environment.fog_height_density = (0.32 * low) if not indoor else 0.0
	var top := (_base.top as Color).lerp(grey.darkened(0.25), 0.7 * gloom).lerp(pale, 0.5 * fog)
	var horizon := (_base.horizon as Color).lerp(grey, 0.7 * gloom).lerp(pale, 0.8 * fog)
	sky.set_shader_parameter("top_color", top.lerp(Color("e8ecff"), flash * 0.7))
	sky.set_shader_parameter("horizon_color", horizon.lerp(Color("f2f4ff"), flash * 0.7))
	sky.set_shader_parameter("overcast", maxf(gloom, fog)) # the clouds hide the stars and the moon
	_wet(rain)
	# the streaks and splashes follow the view; denser as the shower builds
	rain_fx.emitting = rain > 0.02
	splash_fx.emitting = rain > 0.2 and not indoor
	rain_fx.amount_ratio = rain
	splash_fx.amount_ratio = rain
	var fall := rain_fx.process_material as ParticleProcessMaterial
	fall.emission_box_extents = Vector3(view_width * 0.6 + 4.0, 1.0, 22.0)
	rain_fx.global_position = focus + Vector3(0, 14, 0)
	(splash_fx.process_material as ParticleProcessMaterial).emission_box_extents = Vector3(view_width * 0.6 + 2.0, 0.0, 10.0)
	splash_fx.global_position = Vector3(focus.x, focus.y + 0.03, focus.z)
	# puddles mirror the sky (deep blue at night) and the lamps stretch long glints over the wet ground
	var water := Color(0.3, 0.34, 0.48) if night else (_base.horizon as Color).lerp(Color(0.62, 0.7, 0.78), 0.6)
	var showing := clampf((rain - 0.25) / 0.5, 0.0, 1.0)
	for puddle in puddles:
		puddle.visible = showing > 0.0
		puddle.modulate = Color(water.r, water.g, water.b, 0.6 * showing)
	_glint_material.set_shader_parameter("strength", 0.8 * showing)
	var to_camera := camera.global_transform.basis.z
	var flat := Vector3(to_camera.x, 0, to_camera.z).normalized()
	var pitch := asin(clampf(to_camera.y, 0.02, 0.9))
	var reach := 9.0
	var tall := reach * tan(pitch)
	for i in glints.size():
		var glint := glints[i]
		glint.visible = night and showing > 0.0
		if glint.visible:
			var foot := _glint_base[i] + flat * reach
			glint.position = Vector3(foot.x, foot.y + tall * 0.5, foot.z)
			glint.scale = Vector3(1, tall, 1)
			glint.rotation = Vector3(0, atan2(flat.x, flat.z), 0)

## A thunderstorm: now and then lightning, a double flash that lights the whole campus for
## a moment, and the thunder a second or two later.
func _lightning(delta: float, storm: bool) -> void:
	flash = maxf(0.0, flash - delta * 5.0)
	if storm and _clock >= _next_strike:
		strikes += 1
		flash = 1.0
		_next_strike = _clock + randf_range(5.0, 14.0)
		_thunder_at = _clock + randf_range(0.6, 2.2)
		_second_flash = _clock + 0.14
	if _second_flash > 0.0 and _clock >= _second_flash:
		_second_flash = -1.0
		flash = maxf(flash, 0.75)
	if _thunder_at > 0.0 and _clock >= _thunder_at:
		_thunder_at = -1.0
		if sound != null:
			sound.thunder()

## The ground darkens and turns glossy while it is wet, and dries back to matte.
func _wet(amount: float) -> void:
	var materials: Dictionary = world._materials
	for key in materials:
		var kind: String = String(key).split(":")[0]
		if not WET_KINDS.has(kind):
			continue
		var made: StandardMaterial3D = materials[key]
		if not _dry.has(made):
			_dry[made] = [made.albedo_color, made.roughness]
		var dry: Array = _dry[made]
		made.albedo_color = (dry[0] as Color).darkened(0.3 * amount)
		made.roughness = lerpf(dry[1], 0.18, amount)
		made.specular_mode = BaseMaterial3D.SPECULAR_SCHLICK_GGX if amount > 0.03 else BaseMaterial3D.SPECULAR_DISABLED
		made.metallic_specular = 0.6 * amount

func _build_puddles() -> void:
	# a soft-edged ellipse, used for every puddle
	var image := Image.create(64, 32, false, Image.FORMAT_RGBA8)
	for y in 32:
		for x in 64:
			var d := Vector2((x - 31.5) / 31.5, (y - 15.5) / 15.5).length()
			image.set_pixel(x, y, Color(1, 1, 1, clampf((1.0 - d) * 3.0, 0.0, 1.0)))
	var pool := ImageTexture.create_from_image(image)
	var random := RandomNumberGenerator.new()
	random.seed = 31
	var tries := 0
	while puddles.size() < 120 and tries < 2400:
		tries += 1
		var x := random.randf_range(-60.0, 100.0)
		var z := random.randf_range(0.0, 114.0)
		if World.blocked(x, z):
			continue
		var floor := World.floor_height(x, z)
		if floor > 0.2:
			continue # floors under roofs stay dry
		var puddle := Decal.new()
		puddle.texture_albedo = pool
		puddle.size = Vector3(random.randf_range(1.0, 3.2), 0.5, random.randf_range(0.5, 1.4))
		puddle.position = Vector3(x, floor, z)
		puddle.rotation.y = random.randf_range(-0.4, 0.4)
		puddle.upper_fade = 0.3
		puddle.lower_fade = 0.3
		puddle.visible = false
		add_child(puddle)
		puddles.append(puddle)
	# Under each lamp, a long warm glint on the wet ground, as on a wet street at night.
	# A decal on the ground would be squashed flat by this low camera (and paint the
	# kerbs and rails in its box), so it is an upright card a few metres in front of
	# the lamp, as tall as that stretch of ground looks from the camera.
	_glint_material.shader = preload("res://shaders/shaft.gdshader")
	_glint_material.set_shader_parameter("color", Color("ffd08a"))
	_glint_material.set_shader_parameter("strength", 0.0)
	for lamp in world.lamps:
		# Only lampposts out in the rain: the omni lights (stalls, canopy strips, entrances)
		# sit under roofs over dry floors, and their glints floated as glowing ghosts.
		if not lamp is SpotLight3D:
			continue
		var at: Vector3 = lamp.global_position if lamp.is_inside_tree() else lamp.position
		if World.floor_height(at.x, at.z) > 0.2:
			continue
		var glint := MeshInstance3D.new()
		var card := QuadMesh.new()
		card.size = Vector2(0.55, 1.0)
		glint.mesh = card
		glint.material_override = _glint_material
		glint.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
		glint.visible = false
		add_child(glint)
		glints.append(glint)
		_glint_base.append(Vector3(at.x, World.floor_height(at.x, at.z), at.z))

## Ground materials that are wet now, for the checks.
func wet_count() -> int:
	var count := 0
	for made in _dry:
		if (made as StandardMaterial3D).specular_mode != BaseMaterial3D.SPECULAR_DISABLED:
			count += 1
	return count

# --- Light: falling leaves, shafts ------------------------------

func _build_leaves() -> void:
	var colours := [Color("6f8a4a"), Color("8f9a52"), Color("b0924a"), Color("9a6a3a")]
	var made := 0
	for tree: Vector4 in world.trees:
		var crown := Vector3(tree.x, tree.y + tree.w * 0.72, tree.z)
		var leaf := QuadMesh.new()
		leaf.size = Vector2(0.13, 0.08)
		var look := StandardMaterial3D.new()
		look.albedo_color = colours[made % colours.size()]
		look.billboard_mode = BaseMaterial3D.BILLBOARD_ENABLED
		look.billboard_keep_scale = true
		look.diffuse_mode = BaseMaterial3D.DIFFUSE_LAMBERT
		look.specular_mode = BaseMaterial3D.SPECULAR_DISABLED
		look.cull_mode = BaseMaterial3D.CULL_DISABLED
		leaf.material = look
		var drop := ParticleProcessMaterial.new()
		drop.emission_shape = ParticleProcessMaterial.EMISSION_SHAPE_BOX
		drop.emission_box_extents = Vector3(tree.w * 0.22, tree.w * 0.12, tree.w * 0.22)
		drop.direction = Vector3(0.4, -1, 0.2)
		drop.spread = 35.0
		drop.initial_velocity_min = 0.25
		drop.initial_velocity_max = 0.55
		drop.gravity = Vector3(0.15, -0.35, 0)
		drop.angular_velocity_min = -160.0
		drop.angular_velocity_max = 160.0
		var falling := GPUParticles3D.new()
		falling.name = "FallingLeaves"
		falling.process_material = drop
		falling.draw_pass_1 = leaf
		falling.amount = 8
		falling.lifetime = tree.w * 0.9
		falling.preprocess = falling.lifetime
		falling.randomness = 1.0
		falling.local_coords = false
		falling.position = crown
		falling.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
		add_child(falling)
		leaves.append(falling)
		made += 1

## Warm shafts slanting down from under each crown along the sun, by day only: stronger
## in the low sun than at noon, strongest at golden hour (the preset's strength and colour).
var _shaft_strength := 0.085
var _shaft_colour := Color("ffd59a")
func _place_shafts() -> void:
	for old in shafts.get_children():
		old.queue_free()
	if night or _shaft_strength <= 0.0:
		return
	_shaft_material.set_shader_parameter("strength", _shaft_strength)
	_shaft_material.set_shader_parameter("color", _shaft_colour)
	var down := -sun.global_transform.basis.z # the way the light travels
	var random := RandomNumberGenerator.new()
	random.seed = 7
	for tree: Vector4 in world.trees:
		var under := Vector3(tree.x, tree.y + tree.w * 0.55, tree.z)
		var length := (tree.w * 0.55) / maxf(0.25, -down.y)
		for i in 3:
			var start := under + Vector3(random.randf_range(-1.6, 1.6), random.randf_range(-0.4, 0.4), random.randf_range(-1.6, 1.6)) * tree.w * 0.18
			var card := MeshInstance3D.new()
			var quad := QuadMesh.new()
			quad.size = Vector2(random.randf_range(0.35, 0.7), length)
			card.mesh = quad
			card.material_override = _shaft_material
			card.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
			shafts.add_child(card)
			# the card's long side runs with the light; it faces the camera's side
			var middle := start + down * length * 0.5
			# turned about its own axis to face the camera, so it never shows edge-on
			var to_camera := camera.global_transform.basis.z
			var facing := (to_camera - down * to_camera.dot(down)).normalized()
			var side := (-down).cross(facing).normalized()
			card.global_transform = Transform3D(Basis(side, -down, facing), middle)

## Dust drifting in the low sun: tiny warm specks round the student, lit, slowly
## floating, only in the slanting light of a clear morning, afternoon or golden hour.
func _build_dust() -> void:
	var speck := QuadMesh.new()
	speck.size = Vector2(0.035, 0.035)
	var look := StandardMaterial3D.new()
	look.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	look.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	look.albedo_color = Color(1.0, 0.86, 0.6, 0.55)
	look.billboard_mode = BaseMaterial3D.BILLBOARD_ENABLED
	look.emission_enabled = true
	look.emission = Color(1.0, 0.8, 0.5)
	look.emission_energy_multiplier = 0.6
	speck.material = look
	var drift := ParticleProcessMaterial.new()
	drift.emission_shape = ParticleProcessMaterial.EMISSION_SHAPE_BOX
	drift.emission_box_extents = Vector3(9.0, 2.2, 5.0)
	drift.direction = Vector3(0.3, 0.2, 0.1)
	drift.spread = 180.0
	drift.initial_velocity_min = 0.02
	drift.initial_velocity_max = 0.12
	drift.gravity = Vector3(0.0, 0.01, 0.0)
	drift.turbulence_enabled = true
	drift.turbulence_noise_strength = 0.6
	drift.turbulence_noise_scale = 3.0
	dust.name = "Dust"
	dust.process_material = drift
	dust.draw_pass_1 = speck
	dust.amount = 220
	dust.lifetime = 9.0
	dust.preprocess = 9.0
	dust.local_coords = false
	dust.visibility_aabb = AABB(Vector3(-30, -10, -20), Vector3(60, 25, 40))
	dust.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
	dust.emitting = false
	add_child(dust)

## Every frame, after the camera moves.
func update(delta: float) -> void:
	_clock += delta
	_weather(delta)
	for falling in leaves:
		falling.emitting = rain < 0.6
		# in the wind more of them come down, and they blow sideways
		falling.amount_ratio = 0.35 + 0.65 * wind
		(falling.process_material as ParticleProcessMaterial).gravity = Vector3(0.15 + 2.4 * wind, -0.35 - 0.2 * wind, 0.4 * wind)
	shafts.visible = not night and rain < 0.25 and gloom < 0.4 and fog < 0.4 and not indoor
	var low_sun := _shaft_strength >= 0.08 and not night
	dust.emitting = low_sun and gloom < 0.3 and fog < 0.3 and rain < 0.05 and not indoor
	dust.global_position = focus + Vector3(0, 1.6, 0)
	dust.amount_ratio = clampf(_shaft_strength / 0.16, 0.3, 1.0)
