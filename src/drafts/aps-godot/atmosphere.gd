extends Node3D
## Weather and atmosphere, after Until Then: rain that comes and goes, with the
## ground wet and reflective only while it falls; leaves falling from the trees and light shafts under them.
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
## 0..1: how hard it is raining now, and where it is heading.
var rain := 0.0
var rain_target := 0.0
## Rain comes and goes by itself until G is pressed.
var auto_weather := true
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

## G: rain on or off by hand (and the weather stops changing by itself).
func toggle_rain() -> void:
	auto_weather = false
	rain_target = 0.0 if rain_target > 0.5 else 1.0

## For the start and for captures: rain now, at full strength.
func start_raining() -> void:
	auto_weather = false
	rain_target = 1.0
	rain = 1.0

## The hour preset's values, taken after _set_hour so the rain darkens from them.
func set_hour(value: float, is_night: bool) -> void:
	hour = value
	night = is_night
	_base = {
		"sun": sun.light_energy, "ambient": environment.ambient_light_color,
		"fog": environment.fog_density, "fog_color": environment.fog_light_color,
		"top": sky.get_shader_parameter("top_color"), "horizon": sky.get_shader_parameter("horizon_color"),
	}
	_place_shafts()

func _weather(delta: float) -> void:
	if auto_weather and _clock >= _next_change:
		# clear spells last longer than showers
		rain_target = 1.0 if rain_target < 0.5 and randf() < 0.55 else 0.0
		_next_change = _clock + (randf_range(50.0, 90.0) if rain_target > 0.5 else randf_range(80.0, 160.0))
	rain = move_toward(rain, rain_target, delta / 6.0) # showers build and ease over about six seconds
	if _base.is_empty():
		return
	# grey, dimmer light while it rains
	var grey := Color("4a5670") if night else Color("8f98a4")
	sun.light_energy = _base.sun * (1.0 - 0.6 * rain)
	environment.ambient_light_color = (_base.ambient as Color).lerp(grey, 0.45 * rain)
	environment.fog_density = _base.fog + 0.9 * rain
	environment.fog_light_color = (_base.fog_color as Color).lerp(grey, 0.6 * rain)
	sky.set_shader_parameter("top_color", (_base.top as Color).lerp(grey.darkened(0.25), 0.7 * rain))
	sky.set_shader_parameter("horizon_color", (_base.horizon as Color).lerp(grey, 0.7 * rain))
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
		var at: Vector3 = lamp.global_position if lamp.is_inside_tree() else lamp.position
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
		falling.amount = 3
		falling.lifetime = tree.w * 0.9
		falling.preprocess = falling.lifetime
		falling.randomness = 1.0
		falling.local_coords = false
		falling.position = crown
		falling.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
		add_child(falling)
		leaves.append(falling)
		made += 1

## Warm shafts slanting down from under each crown along the sun, by day only:
## stronger in the low morning and afternoon sun than at noon.
func _place_shafts() -> void:
	for old in shafts.get_children():
		old.queue_free()
	if night:
		return
	var noon := hour >= 10.0 and hour < 15.0
	_shaft_material.set_shader_parameter("strength", 0.045 if noon else 0.085)
	_shaft_material.set_shader_parameter("color", Color("fff1d6") if noon else Color("ffd59a"))
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

## Every frame, after the camera moves.
func update(delta: float) -> void:
	_clock += delta
	_weather(delta)
	for falling in leaves:
		falling.emitting = rain < 0.6
	shafts.visible = not night and rain < 0.25 and not indoor
