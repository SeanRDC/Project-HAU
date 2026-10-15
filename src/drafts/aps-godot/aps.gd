extends Node
## APS in Godot: the full browser frontage (wing, canopy, tall block, stair
## tower, canteen) with spatial lighting and an adaptive pixel resolution that
## stays crisp from the entrance close-up out to the whole street.

const World := preload("res://world.gd")
const Student := preload("res://student.gd")
const Sound := preload("res://audio.gd")
const Chapel := preload("res://areas/chapel.gd")
const Roads := preload("res://roads.gd")
const CampusPlan := preload("res://campus_plan.gd")
const Plots := preload("res://areas/plots.gd")
const HOURS: Array[float] = [8.0, 12.0, 16.5, 21.0]
const FRAMINGS := [[112.0, "APS + canteen"], [56.0, "Whole building"], [36.0, "Corridor"], [28.0, "Canteen"], [10.0, "Close-up"], [32.0, "Chapel"]]
## Down to about the student and an arm's length around them.
const MIN_WIDTH := 5.0
## The plane the canteen view frames (the wing's open front), as z = 0 frames the APS front.
const CANTEEN_FACE_X := 33.0
## Where the canteen framing brings the student: the patio, in front of the steps.
const CANTEEN_SPOT := Vector2(31.0, 10.3)
## Where the chapel framing (key 6) brings the student: the plaza, by the HAU seal.
const CHAPEL_SPOT := Vector2(-34.0, 55.0)
const MAX_WIDTH := 140.0
## Sprite texels per metre (85 px over 1.83 m). Auto mode renders near this density.
const SPRITE_DENSITY := 46.4
const PIXEL_MODES := ["auto", "crisp", "pixel"]

var world := World.new()
var viewport := SubViewport.new()
var display := TextureRect.new()
var scene := Node3D.new()
var camera := Camera3D.new()
var sun := DirectionalLight3D.new()
var environment := Environment.new()
var sky_material := ShaderMaterial.new()
var edges := ShaderMaterial.new()
var student: Student
var sound: Sound
var help: Control
var time_label: Label
var view_label: Label

var hour := 16.5
var orbit := 0.12
var width := 112.0
var target_width := 112.0
var follow := Vector2.ZERO
## 0 frames the APS front from the road; 1 has turned to face the canteen across the patio.
var leg := 0.0
## 0..1: how far the camera has turned to face the chapel's glass front across its plaza.
var chapel := 0.0
var pixel_mode := "auto"
var pixel_scale := 0
var view_metres := Vector2(98, 55.125)
var _args := {}

func _ready() -> void:
	for argument in OS.get_cmdline_user_args():
		var parts := argument.trim_prefix("--").split("=", true, 1)
		_args[parts[0]] = parts[1] if parts.size() > 1 else "true"
	_build_display()
	_build_lighting()
	world.build(scene)
	student = Student.new()
	scene.add_child(student)
	sound = Sound.new()
	add_child(sound)
	student.stepped.connect(_on_step)
	_build_interface()

	var canteen_start: bool = _args.get("view", "") == "canteen"
	hour = float(_args.get("hour", "16.5"))
	if not HOURS.has(hour):
		hour = 16.5
	pixel_mode = _args.get("pixel", "auto") if PIXEL_MODES.has(_args.get("pixel", "auto")) else "auto"
	orbit = clampf(float(_args.get("angle", "0.12")), -0.25, 0.25)
	if _args.has("girl"):
		student.set_character("girl")
	student.place(float(_args.get("x", str(CANTEEN_SPOT.x) if canteen_start else "0.7")),
		float(_args.get("z", str(CANTEEN_SPOT.y) if canteen_start else "5.3")))
	_set_zoom(float(_args.get("zoom", "28" if canteen_start else "112")), true)
	if _args.has("hide-help"):
		help.visible = false
	_snap_follow()
	_set_hour(hour)
	get_window().size_changed.connect(_resize)
	_resize()
	_update_camera(1.0)
	if _args.has("test") or _args.has("capture"):
		_verify_and_capture.call_deferred()

# --- Rendering setup --------------------------------------------------------

func _build_display() -> void:
	viewport.name = "PixelWorld"
	viewport.own_world_3d = true
	viewport.render_target_update_mode = SubViewport.UPDATE_ALWAYS
	viewport.msaa_3d = Viewport.MSAA_4X
	viewport.use_debanding = true
	viewport.positional_shadow_atlas_size = 4096
	add_child(viewport)
	display.name = "PixelDisplay"
	display.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	display.texture = viewport.get_texture()
	display.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
	display.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	display.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_COVERED
	var grade := ShaderMaterial.new()
	grade.shader = preload("res://shaders/display.gdshader")
	display.material = grade
	add_child(display)
	scene.name = "APSStreet"
	viewport.add_child(scene)

func _build_lighting() -> void:
	sky_material.shader = preload("res://shaders/sky.gdshader")
	var sky := Sky.new()
	sky.sky_material = sky_material
	sky.radiance_size = Sky.RADIANCE_SIZE_64
	environment.background_mode = Environment.BG_SKY
	environment.sky = sky
	environment.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
	environment.reflected_light_source = Environment.REFLECTION_SOURCE_SKY
	environment.tonemap_mode = Environment.TONE_MAPPER_FILMIC
	environment.tonemap_white = 6.0
	environment.ssao_enabled = true
	environment.ssao_radius = 0.9
	environment.ssao_intensity = 1.6
	environment.ssao_power = 1.3
	environment.ssao_detail = 0.6
	environment.ssao_light_affect = 0.15
	environment.glow_enabled = true
	environment.glow_normalized = true
	environment.glow_blend_mode = Environment.GLOW_BLEND_MODE_SOFTLIGHT
	environment.glow_strength = 1.0
	environment.glow_bloom = 0.0
	environment.fog_enabled = true
	environment.fog_mode = Environment.FOG_MODE_DEPTH
	environment.fog_density = 0.6
	environment.fog_depth_curve = 1.4
	environment.fog_sky_affect = 0.0
	environment.adjustment_enabled = true
	environment.adjustment_contrast = 1.04
	environment.adjustment_saturation = 1.05
	var background := WorldEnvironment.new()
	background.environment = environment
	scene.add_child(background)

	sun.name = "Sun"
	sun.shadow_enabled = true
	sun.directional_shadow_mode = DirectionalLight3D.SHADOW_ORTHOGONAL
	sun.shadow_bias = 0.03
	sun.shadow_normal_bias = 0.6
	# Tight, fixed-size filtering: crisp pixel-art shadow edges without the screen-space
	# grain a wide kernel leaves (it crawls when the camera pans). Contact-hardening
	# (light_angular_distance) lost the GPU device at close canteen framings.
	sun.shadow_blur = 0.55
	sun.directional_shadow_fade_start = 1.0
	scene.add_child(sun)

	camera.name = "StreetCamera"
	camera.projection = Camera3D.PROJECTION_ORTHOGONAL
	camera.near = 0.1
	camera.far = 240.0
	scene.add_child(camera)
	camera.current = true
	var quad := QuadMesh.new()
	quad.size = Vector2(2, 2)
	edges.shader = preload("res://shaders/edges.gdshader")
	edges.render_priority = 127
	var overlay := MeshInstance3D.new()
	overlay.name = "PixelEdges"
	overlay.mesh = quad
	overlay.material_override = edges
	overlay.extra_cull_margin = 16384.0
	overlay.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
	camera.add_child(overlay)

## Picks the render scale. Close framings render near the sprite's own texel
## density so every pixel is a whole, even block; wide framings render at the
## window's full resolution so thin rails and frames survive.
func _choose_scale() -> int:
	var window := Vector2(get_window().size)
	if pixel_mode == "crisp":
		return 1
	if pixel_mode == "pixel":
		return maxi(1, roundi(window.y / 360.0))
	var ideal := window.y / view_metres.y / SPRITE_DENSITY
	# Hysteresis keeps the scale from flickering while zooming across a boundary.
	if pixel_scale > 0 and absf(ideal - pixel_scale) < 0.65:
		return pixel_scale
	return clampi(roundi(ideal), 1, 8)

func _resize() -> void:
	var window := Vector2(get_window().size)
	var aspect := window.x / maxf(window.y, 1.0)
	# The framing width is for a 16:9 frame: keep that whole frame on any window shape.
	if aspect >= 16.0 / 9.0:
		camera.keep_aspect = Camera3D.KEEP_HEIGHT
		camera.size = width * 9.0 / 16.0
		view_metres = Vector2(camera.size * aspect, camera.size)
	else:
		camera.keep_aspect = Camera3D.KEEP_WIDTH
		camera.size = width
		view_metres = Vector2(width, width / aspect)
	pixel_scale = _choose_scale()
	var size := Vector2i(ceili(window.x / pixel_scale), ceili(window.y / pixel_scale))
	if viewport.size != size:
		viewport.size = size
	# Outlines are one render pixel wide: full strength on chunky pixels, lighter at native resolution.
	edges.set_shader_parameter("strength", 1.0 if pixel_scale > 1 else 0.7)
	_update_labels()

# --- Camera ------------------------------------------------------------------

func _set_zoom(value: float, immediate := false) -> void:
	target_width = clampf(value, MIN_WIDTH, MAX_WIDTH)
	if immediate:
		width = target_width
		_resize()
	_update_labels()

## How far round the corner the camera should be for a spot: the APS front up to
## the tall block, the canteen view once on the patio or the road's leg past it.
## Past the canteen's tip, and on the strip beside it, it looks north again.
static func leg_for(x: float, z: float) -> float:
	var turn := clampf(smoothstep(16.0, 26.0, x) + smoothstep(4.0, 12.0, z) * smoothstep(12.0, 18.0, x), 0.0, 1.0)
	return turn * (1.0 - smoothstep(30.0, 34.0, z)) * (1.0 - smoothstep(42.6, 43.8, x))

## How far the camera should turn to face the chapel: on the lawn path past halfway,
## on the plaza and parking, and on the west road beside them.
static func chapel_for(x: float, z: float) -> float:
	return smoothstep(24.0, 32.0, z) * (1.0 - smoothstep(-24.0, -18.0, x))

func _snap_follow() -> void:
	follow = Vector2(student.position.x - 0.15, student.position.z)
	leg = leg_for(student.position.x, student.position.z)
	chapel = chapel_for(student.position.x, student.position.z)

## The camera's turn about the vertical: 0 looks north at APS, -90° east at the
## canteen or the chapel (their views never overlap: one is east of x 12, one west of -18).
func _yaw() -> float:
	return orbit - PI / 2.0 * (leg + chapel)

func _update_camera(delta: float) -> void:
	if absf(width - target_width) > 0.001:
		width = lerpf(width, target_width, 1.0 - exp(-delta * 10.0))
		if absf(width - target_width) < 0.02:
			width = target_width
		_resize()
	follow = follow.lerp(Vector2(student.position.x - 0.15, student.position.z), 1.0 - exp(-delta * 4.0))
	leg = lerpf(leg, leg_for(student.position.x, student.position.z), 1.0 - exp(-delta * 3.0))
	chapel = lerpf(chapel, chapel_for(student.position.x, student.position.z), 1.0 - exp(-delta * 3.0))
	var wide := clampf((width - 22.0) / 34.0, 0.0, 1.0)
	var campus := clampf((width - 56.0) / 42.0, 0.0, 1.0)
	var close := clampf((22.0 - width) / 14.0, 0.0, 1.0)
	# Along the APS front the camera slides in x; along the canteen and the chapel in z.
	# Each view frames its building's face, or stays ahead of a student who walks
	# away from it (down the lawn path, along the strip, onto the west road).
	var front := lerpf(lerpf(follow.x, 5.5 + follow.x * 0.1, wide), -8.0, campus)
	var side := lerpf(lerpf(follow.y, 12.6, wide), 12.0, campus)
	var aisle := lerpf(lerpf(follow.y, 59.5, wide), 59.5, campus)
	var depth := maxf(0.0, follow.y - 5.3)
	var reach := minf(Chapel.FACE_X, follow.x + 6.0)
	# Move in whole render pixels so facade and shadow edges do not crawl.
	var pixel := view_metres.x / float(viewport.size.x) / cos(orbit)
	front = roundf(front / pixel) * pixel
	side = roundf(side / pixel) * pixel
	aisle = roundf(aisle / pixel) * pixel
	var target_y := lerpf(lerpf(lerpf(3.65, 8.4, wide), 10.0, campus), 1.05, close)
	var distance := lerpf(lerpf(23.0, 60.0, wide), 90.0, campus)
	var lift := lerpf(lerpf(3.15, width * 0.24, wide), 1.4, close)
	var focus := Vector3(front, target_y, depth) * (1.0 - leg - chapel)
	focus += Vector3(CANTEEN_FACE_X, target_y, side) * leg + Vector3(reach, target_y, aisle) * chapel
	var yaw := _yaw()
	camera.position = focus + Vector3(sin(yaw) * distance, lift, cos(yaw) * distance)
	camera.look_at(focus)
	# Shadow and fog ranges follow the camera so the wide views stay sharp and unhazed.
	sun.directional_shadow_max_distance = distance + 45.0
	environment.fog_depth_begin = distance + 14.0
	environment.fog_depth_end = distance + 170.0
	student.face(camera)

# --- Time of day ---------------------------------------------------------------

func _set_hour(value: float) -> void:
	hour = value
	var night := hour >= 19.0 or hour < 6.0
	var noon := hour >= 10.0 and hour < 15.0
	var morning := hour < 10.0 and not night
	var target := Vector3(22, 7, 0)
	var offset := Vector3(55 if night or morning else -55, 58 if night else (95 if noon else 44), 18 if noon else 60)
	sun.look_at_from_position(target + offset, target)
	sun.light_color = Color("a7bee5") if night else (Color("fff4de") if noon else Color("ffce96"))
	sun.light_energy = 0.2 if night else (1.0 if noon else 1.08)
	environment.ambient_light_color = Color("6f86c2") if night else (Color("bcc3c8") if noon else Color("b8bec6"))
	environment.ambient_light_energy = 0.3 if night else 0.42
	environment.glow_intensity = 0.9 if night else 0.25
	environment.glow_hdr_threshold = 0.85 if night else 1.6
	var top := Color("101c39") if night else Color("5d8aaf")
	var horizon := Color("364566") if night else (Color("c7d9dc") if noon else Color("edd3ae"))
	sky_material.set_shader_parameter("top_color", top)
	sky_material.set_shader_parameter("horizon_color", horizon)
	sky_material.set_shader_parameter("ground_color", Color("2a3040") if night else Color("8a8a7c"))
	sky_material.set_shader_parameter("stars", 1.0 if night else 0.0)
	environment.fog_light_color = horizon
	var grade := display.material as ShaderMaterial
	grade.set_shader_parameter("light_tint", Color("e6eeff") if night else Color("fff6e4"))
	grade.set_shader_parameter("shade_tint", Color("c9d6ff") if night else Color("eceef4"))
	world.set_night(night)
	if sound:
		sound.night = night
	if time_label:
		time_label.text = "Night · 9:00 PM" if night else ("Noon · 12:00 PM" if noon else ("Morning · 8:00 AM" if morning else "Afternoon · 4:30 PM"))

# --- Interface -----------------------------------------------------------------

func _badge(text: String, preset: int) -> Label:
	var label := Label.new()
	label.text = text
	label.set_anchors_and_offsets_preset(preset)
	label.add_theme_font_size_override("font_size", 16)
	label.add_theme_color_override("font_color", Color("fff1d8"))
	label.add_theme_color_override("font_shadow_color", Color("263548"))
	label.add_theme_constant_override("shadow_offset_y", 2)
	var box := StyleBoxFlat.new()
	box.bg_color = Color(0.05, 0.08, 0.11, 0.72)
	box.set_content_margin_all(8)
	box.content_margin_left = 12
	box.content_margin_right = 12
	box.set_corner_radius_all(4)
	label.add_theme_stylebox_override("normal", box)
	label.grow_horizontal = Control.GROW_DIRECTION_BEGIN
	return label

func _build_interface() -> void:
	var ui := CanvasLayer.new()
	add_child(ui)
	help = PanelContainer.new()
	help.position = Vector2(24, 20)
	var panel := StyleBoxFlat.new()
	panel.bg_color = Color(0.05, 0.08, 0.11, 0.74)
	panel.set_content_margin_all(12)
	panel.content_margin_left = 16
	panel.content_margin_right = 16
	panel.set_corner_radius_all(4)
	help.add_theme_stylebox_override("panel", panel)
	ui.add_child(help)
	var stack := VBoxContainer.new()
	stack.add_theme_constant_override("separation", 8)
	help.add_child(stack)
	var title := Label.new()
	title.text = "Archbishop Pedro Santos Building"
	title.add_theme_font_size_override("font_size", 22)
	title.add_theme_color_override("font_color", Color("fff1d8"))
	title.add_theme_color_override("font_shadow_color", Color("272d39"))
	title.add_theme_constant_override("shadow_offset_y", 2)
	stack.add_child(title)
	var controls := Label.new()
	controls.text = "A/D  Walk    W/S  Depth    Shift  Run    T  Time    C  Character    M  Mute\n" + \
		"Wheel or +/-  Zoom    1-6  Framings    Q/E  Angle    P  Pixels\n" + \
		"R  Reset    F11  Fullscreen    Tab  Hide controls    Esc  Close"
	controls.add_theme_font_size_override("font_size", 14)
	controls.add_theme_color_override("font_color", Color("e7e2d6"))
	stack.add_child(controls)
	var corner := VBoxContainer.new()
	corner.set_anchors_and_offsets_preset(Control.PRESET_TOP_RIGHT)
	corner.offset_left = -320
	corner.offset_right = -24
	corner.offset_top = 20
	corner.alignment = BoxContainer.ALIGNMENT_BEGIN
	corner.add_theme_constant_override("separation", 6)
	ui.add_child(corner)
	time_label = _badge("", Control.PRESET_TOP_RIGHT)
	time_label.size_flags_horizontal = Control.SIZE_SHRINK_END
	corner.add_child(time_label)
	view_label = _badge("", Control.PRESET_TOP_RIGHT)
	view_label.size_flags_horizontal = Control.SIZE_SHRINK_END
	corner.add_child(view_label)

func _framing_name() -> String:
	for framing in FRAMINGS:
		if absf(target_width - float(framing[0])) < 0.01:
			return framing[1]
	return "Custom zoom"

func _update_labels() -> void:
	if view_label:
		var mode := {"auto": "Auto pixels", "crisp": "Crisp", "pixel": "Chunky pixels"}[pixel_mode] as String
		view_label.text = "%s · %s %d×%d" % [_framing_name(), mode, viewport.size.x, viewport.size.y]

# --- Input -------------------------------------------------------------------

func _choose_framing(index: int) -> void:
	var value: float = FRAMINGS[index][0]
	# Same jumps as the browser trial: the canteen view brings the student to the canteen.
	if value == 28.0:
		student.place(CANTEEN_SPOT.x, CANTEEN_SPOT.y)
		_snap_follow()
	elif value == 32.0:
		student.place(CHAPEL_SPOT.x, CHAPEL_SPOT.y)
		_snap_follow()
	elif value <= 56.0 and value > 10.0 and (leg > 0.5 or chapel > 0.5):
		student.place(0.7, 5.3)
		_snap_follow()
	_set_zoom(value)

func _reset() -> void:
	student.place(0.7, 5.3)
	orbit = 0.12
	_snap_follow()
	_set_hour(16.5)
	_set_zoom(112.0)

func _unhandled_input(event: InputEvent) -> void:
	if event is InputEventMouseButton and event.pressed:
		if event.button_index == MOUSE_BUTTON_WHEEL_UP:
			_set_zoom(target_width / 1.12)
		elif event.button_index == MOUSE_BUTTON_WHEEL_DOWN:
			_set_zoom(target_width * 1.12)
		return
	if not event is InputEventKey or not event.pressed or event.echo:
		return
	match event.physical_keycode:
		KEY_ESCAPE:
			get_tree().quit()
		KEY_T:
			_set_hour(HOURS[(HOURS.find(hour) + 1) % HOURS.size()])
			sound.select()
		KEY_C:
			student.set_character("girl" if student.who == "boy" else "boy")
			sound.select()
		KEY_M:
			sound.toggle_mute()
		KEY_P:
			pixel_mode = PIXEL_MODES[(PIXEL_MODES.find(pixel_mode) + 1) % PIXEL_MODES.size()]
			pixel_scale = 0
			_resize()
		KEY_TAB:
			help.visible = not help.visible
		KEY_R:
			_reset()
		KEY_EQUAL, KEY_KP_ADD:
			_set_zoom(target_width / 1.2)
		KEY_MINUS, KEY_KP_SUBTRACT:
			_set_zoom(target_width * 1.2)
		KEY_F11:
			var full := get_window().mode == Window.MODE_FULLSCREEN
			get_window().mode = Window.MODE_WINDOWED if full else Window.MODE_FULLSCREEN
		KEY_1, KEY_2, KEY_3, KEY_4, KEY_5, KEY_6:
			_choose_framing(event.physical_keycode - KEY_1)
			sound.select()

## Tiles, kerbs and the canteen floor click; the road and the patio thud.
func _on_step() -> void:
	sound.footstep(World.floor_height(student.position.x, student.position.z) > 0.0)

func _held(keys: Array) -> bool:
	for key in keys:
		if Input.is_physical_key_pressed(key):
			return true
	return false

func _process(delta: float) -> void:
	delta = minf(delta, 0.05)
	var direction := Vector2(float(_held([KEY_D, KEY_RIGHT])) - float(_held([KEY_A, KEY_LEFT])),
		float(_held([KEY_S, KEY_DOWN])) - float(_held([KEY_W, KEY_UP])))
	# Keys are relative to the camera, so D keeps walking screen-right round the corner.
	var turn := -PI / 2.0 * (leg + chapel)
	var right := Vector2(cos(turn), -sin(turn))
	var away := Vector2(-sin(turn), -cos(turn))
	student.move(right * direction.x - away * direction.y, _held([KEY_SHIFT]), delta, direction.x)
	sound.indoor = World.floor_height(student.position.x, student.position.z) >= 0.45
	orbit = clampf(orbit + (float(_held([KEY_E])) - float(_held([KEY_Q]))) * delta * 0.25, -0.25, 0.25)
	_update_camera(delta)

# --- Checks and captures ----------------------------------------------------------

func _all_visible(xs: Array, ys: Array, zs: Array) -> bool:
	for x in xs:
		for y in ys:
			for z in zs:
				var p := camera.unproject_position(Vector3(x, y, z))
				if p.x < 0 or p.y < 0 or p.x > viewport.size.x or p.y > viewport.size.y:
					return false
	return true

func _verify_and_capture() -> void:
	var checks := {}
	var wait := int(_args.get("frames", "20"))
	for i in wait:
		await get_tree().process_frame
	var walk_time := float(_args.get("walk", "0"))
	while walk_time > 0.0:
		student.move(Vector2(1, 0), false, 1.0 / 60.0)
		_update_camera(1.0 / 60.0)
		walk_time -= 1.0 / 60.0
		await get_tree().process_frame
	if _args.has("test"):
		checks.sprite_lit_alpha_cut = student.sprite.shaded and student.sprite.alpha_cut == SpriteBase3D.ALPHA_CUT_DISCARD
		checks.sprite_casts_shadow = student.sprite.cast_shadow != GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
		checks.sun_shadows = sun.shadow_enabled
		var wing := scene.find_child("CanteenWing", false, false) as Node3D
		checks.canteen_built = wing != null and wing.find_child("APS CANTEEN", false, false) != null
		checks.stall_signs = wing != null and wing.find_child("GRANNY JINGS", false, false) != null
		# The canteen's sign faces west, across the patio.
		checks.canteen_faces_patio = wing != null and (wing.global_basis * Vector3.BACK).dot(Vector3.LEFT) > 0.99
		checks.box_count = world.box_count > 1000
		checks.entrance_column_blocks = World.blocked(3.4, 3.05) and not World.blocked(0, 3.05)
		var pier := World.canteen_world(46.25, 1.45)
		checks.canteen_pier_blocks = World.blocked(pier.x, pier.y)
		var gap := World.canteen_world(51, 2.68)
		var rail := World.canteen_world(45, 2.68)
		checks.rail_gap_open = not World.blocked(gap.x, gap.y) and World.blocked(rail.x, rail.y)
		checks.stair_tower_solid = World.blocked(33.9, -1.0)
		var hall := World.canteen_world(51, 0)
		checks.canteen_floor = is_equal_approx(World.floor_height(hall.x, hall.y), 0.45)
		# Road in the bend, lawn inside it, patio outside it.
		checks.bend_is_road = is_equal_approx(World.floor_height(17.7, 11.3), -0.19) and not World.blocked(17.7, 11.3)
		checks.lawn_blocks = World.blocked(12.5, 18.0) and World.blocked(5.0, 14.0)
		checks.patio_walkable = not World.blocked(25.0, 2.0) and not World.blocked(30.6, 24.0)
		# The strip by the Covered Court: under the pergola is walkable; posts, sheds and poles are solid.
		checks.yard_walkable = not World.blocked(45.5, 14.2) and not World.blocked(45.5, 10.0)
		checks.yard_props_block = World.blocked(45.5, 3.3) and World.blocked(43.8, 12.0) and World.blocked(26.9, 18.4)
		# The corner garden is planted, not walkable; the road turning past it is.
		checks.left_garden_blocks = World.blocked(-58.0, 8.0) and not World.blocked(-52.0, 10.0)
		# The shared campus plan: every building, the closed road loop, reserved plots.
		checks.plan_loaded = CampusPlan.PLOTS.size() == 21 and CampusPlan.PLOTS["aps"]["built"]
		checks.road_loop_closed = Roads.points()[0].distance_to(Roads.points()[-1]) < 0.01
		checks.plots_reserved = Plots.occupied(72.6, 38.8) and Plots.occupied(76.8, -7.1) and not Plots.occupied(-8.7, 58.1)
		# The chapel is solid; its plaza, parking and the lawn path are walkable.
		checks.chapel_blocks = World.blocked(-8.7, 58.1) and World.blocked(-25.0, 59.5)
		var plaza_floor := World.floor_height(CHAPEL_SPOT.x, CHAPEL_SPOT.y)
		checks.chapel_plaza_walkable = not World.blocked(CHAPEL_SPOT.x, CHAPEL_SPOT.y) and is_equal_approx(plaza_floor, -0.04)
		checks.lawn_path_walkable = not World.blocked(-36.0, 24.0) and World.blocked(-30.0, 24.0)
		checks.grass_built = (scene.find_child("Grass", false, false) as MultiMeshInstance3D).multimesh.instance_count > 800
		var saved := student.position
		_set_hour(21.0)
		checks.night_lamps = world.lamps.all(func(l: Light3D) -> bool: return l.visible) and sun.light_energy < 0.3
		_set_hour(12.0)
		checks.noon_no_lamps = not world.lamps[0].visible
		_set_hour(hour if HOURS.has(hour) else 16.5)
		student.set_character("girl")
		student.move(Vector2(1, 0), false, 0.05)
		checks.girl_walk_sheet = student.animation == "girl:walk" and student.sprite.hframes == 6
		student.set_character("boy")
		student.place(0.7, 5.3)
		checks.ground_contact = absf(student.position.y - World.floor_height(0.7, 5.3) - 0.015) < 0.001
		student.place(3.4, 3.7)
		for i in 10:
			student.move(Vector2(0, -1), false, 0.05)
		checks.column_stops_walk = student.position.z > 3.53
		# Walk from the patio up the canteen steps through the rail gap (east, into the hall).
		student.place(CANTEEN_SPOT.x, CANTEEN_SPOT.y)
		for i in 60:
			student.move(Vector2(1, 0), false, 0.05)
		checks.walk_into_canteen = student.position.x > 35.0 and is_equal_approx(student.position.y, 0.465)
		var steps_before := sound.steps
		for i in 20:
			student.move(Vector2(-1, 0), false, 0.05)
		checks.footsteps_while_walking = sound.steps - steps_before >= 3
		checks.ambience_playing = sound.wind.playing and AudioServer.get_bus_index("Music") >= 0
		# Holding D from the APS front walks round the corner onto the patio.
		student.place(14.0, 2.5)
		_snap_follow()
		for i in 160:
			var turn := -PI / 2.0 * (leg + chapel)
			student.move(Vector2(cos(turn), -sin(turn)), true, 1.0 / 30.0, 1.0)
			_update_camera(1.0 / 30.0)
		checks.walk_round_corner = leg > 0.9 and student.position.z > 8.0
		# From the APS road down the lawn path to the chapel plaza: the camera turns to face it.
		student.place(-36.0, 6.0)
		_snap_follow()
		for i in 300:
			student.move(Vector2(0, 1), true, 1.0 / 30.0, 0.0)
			_update_camera(1.0 / 30.0)
		checks.walk_to_chapel = student.position.z > 40.0 and chapel > 0.9 and (-camera.global_basis.z).dot(Vector3.RIGHT) > 0.9
		student.position = saved
		_set_zoom(112.0, true)
		_snap_follow()
		_update_camera(1.0)
		checks.wide_shows_l = _all_visible([-62.5, 43.3], [0.0, 13.4], [-3.4, 0.3]) and _all_visible([33.0, 43.3], [0.0, 18.4], [24.9])
		student.place(0.7, 5.3)
		_set_zoom(56.0, true)
		_snap_follow()
		_update_camera(1.0)
		checks.whole_building_visible = _all_visible([-18.3, 31.3], [0.0, 21.5], [-4.2, 4.2])
		student.place(CANTEEN_SPOT.x, CANTEEN_SPOT.y)
		_set_zoom(28.0, true)
		_snap_follow()
		_update_camera(1.0)
		checks.canteen_view_faces_stalls = leg > 0.99 and (-camera.global_basis.z).dot(Vector3.RIGHT) > 0.95
		student.place(CHAPEL_SPOT.x, CHAPEL_SPOT.y)
		_set_zoom(32.0, true)
		_snap_follow()
		_update_camera(1.0)
		var facing_front := (-camera.global_basis.z).dot(Vector3.RIGHT) > 0.95
		checks.chapel_view_faces_front = chapel > 0.99 and facing_front and _all_visible([Chapel.NOSE.x], [0.9, 9.0], [Chapel.NOSE.y])
		student.place(CANTEEN_SPOT.x, CANTEEN_SPOT.y)
		_snap_follow()
		_set_zoom(MIN_WIDTH, true)
		_update_camera(1.0)
		checks.close_zoom_shows_student = _all_visible([student.position.x], [student.position.y, student.position.y + 1.83], [student.position.z])
		student.position = saved
		_snap_follow()
		_set_zoom(float(_args.get("zoom", "112")), true)
		_update_camera(1.0)
	var okay := not checks.values().has(false)
	print(JSON.stringify({"scene": "APS 2.5D", "checks": checks, "checks_pass": okay, "boxes": world.box_count,
		"nodes": scene.get_child_count(), "viewport": [viewport.size.x, viewport.size.y], "pixel_scale": pixel_scale,
		"renderer": RenderingServer.get_current_rendering_method()}))
	if _args.has("capture"):
		await RenderingServer.frame_post_draw
		var path: String = _args["capture"]
		var image := viewport.get_texture().get_image() if _args.has("raw") else get_viewport().get_texture().get_image()
		var result := image.save_png(path)
		print("Capture: ", path, " result=", result)
		okay = okay and result == OK
	get_tree().quit(0 if okay else 1)
