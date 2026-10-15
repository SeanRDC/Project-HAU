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
const Gym := preload("res://areas/gym.gd")
const Hallway := preload("res://areas/hallway.gd")
## Inside the hallway the view closes in to this width, framed on the corridor.
const HALL_WIDTH := 8.5
const HOURS: Array[float] = [8.0, 12.0, 16.5, 21.0]
const FRAMINGS := [[112.0, "APS + canteen"], [56.0, "Whole building"], [36.0, "Corridor"], [28.0, "Canteen"], [10.0, "Close-up"], [32.0, "Chapel"],
	[84.0, "IH Gym"], [44.0, "Gym side"]]
## Down to about the student and an arm's length around them.
const MIN_WIDTH := 5.0
## The plane the canteen view frames (the wing's open front), as z = 0 frames the APS front.
const CANTEEN_FACE_X := 33.0
## Where the canteen framing brings the student: the patio, in front of the steps.
const CANTEEN_SPOT := Vector2(31.0, 10.3)
## Where the chapel framing (key 6) brings the student: the plaza, by the HAU seal.
const CHAPEL_SPOT := Vector2(-34.0, 55.0)
## Where the gym framings bring the student: the apron in front, the lane by the side entrance.
const GYM_SPOT := Vector2(50.0, 95.8)
const GYM_SIDE_SPOT := Vector2(79.0, 60.8)
## The middle of the gym, which its wide framings centre on.
const GYM_MIDDLE := Vector2(78.5, 101.5)
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
## 1 faces the gym's front (east) from the east road and the apron; gable adds a
## further quarter turn to face its north gable from the lane.
var gym := 0.0
var gable := 0.0
## 0..1: how far the student is inside the APS hallway (the cutaway and glide).
var hall := 0.0
## The width actually shown: the chosen zoom, closed in to HALL_WIDTH inside.
var shown_width := 112.0
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

	var views := {"canteen": [CANTEEN_SPOT, 28.0], "gym": [GYM_SPOT, 84.0], "gym-side": [GYM_SIDE_SPOT, 44.0]}
	var start: Array = views.get(_args.get("view", ""), [Vector2(0.7, 5.3), 112.0])
	var spot: Vector2 = start[0]
	hour = float(_args.get("hour", "16.5"))
	if not HOURS.has(hour):
		hour = 16.5
	pixel_mode = _args.get("pixel", "auto") if PIXEL_MODES.has(_args.get("pixel", "auto")) else "auto"
	orbit = clampf(float(_args.get("angle", "0.12")), -0.25, 0.25)
	if _args.has("girl"):
		student.set_character("girl")
	student.place(float(_args.get("x", str(spot.x))), float(_args.get("z", str(spot.y))))
	_set_zoom(float(_args.get("zoom", str(start[1]))), true)
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
	shown_width = lerpf(width, minf(width, HALL_WIDTH), smoothstep(0.0, 1.0, hall))
	var window := Vector2(get_window().size)
	var aspect := window.x / maxf(window.y, 1.0)
	# The framing width is for a 16:9 frame: keep that whole frame on any window shape.
	if aspect >= 16.0 / 9.0:
		camera.keep_aspect = Camera3D.KEEP_HEIGHT
		camera.size = shown_width * 9.0 / 16.0
		view_metres = Vector2(camera.size * aspect, camera.size)
	else:
		camera.keep_aspect = Camera3D.KEEP_WIDTH
		camera.size = shown_width
		view_metres = Vector2(shown_width, shown_width / aspect)
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
	turn *= 1.0 - Hallway.hall_for(x, z)
	return turn * (1.0 - smoothstep(30.0, 34.0, z)) * (1.0 - smoothstep(42.6, 43.8, x))

## How far the camera should turn to face the chapel: on the lawn path past halfway,
## on the plaza and parking, and on the west road beside them.
## How far the camera should turn to face the gym's front: on the east road past the
## canteen's tip (where it looked north) and on the apron in front of the gym.
static func gym_for(x: float, z: float) -> float:
	return smoothstep(38.0, 46.0, z) * smoothstep(34.0, 38.0, x)

## The further turn to face the gym's north gable, once past its north-west corner into the lane.
static func gable_for(x: float, _z: float) -> float:
	return smoothstep(Gym.FRONT_X, Gym.FRONT_X + 4.0, x)

static func chapel_for(x: float, z: float) -> float:
	return smoothstep(24.0, 32.0, z) * (1.0 - smoothstep(-24.0, -18.0, x))

func _snap_follow() -> void:
	follow = Vector2(student.position.x - 0.15, student.position.z)
	leg = leg_for(student.position.x, student.position.z)
	chapel = chapel_for(student.position.x, student.position.z)
	gym = gym_for(student.position.x, student.position.z)
	gable = gable_for(student.position.x, student.position.z)
	hall = Hallway.hall_for(student.position.x, student.position.z)

## The camera's turn about the vertical: 0 looks north at APS, -90° east at the
## canteen or the chapel (their views never overlap: one is east of x 12, one west of -18).
func _yaw() -> float:
	return orbit - PI / 2.0 * (leg + chapel + gym + gable)

func _update_camera(delta: float) -> void:
	var was_hall := hall
	hall = lerpf(hall, Hallway.hall_for(student.position.x, student.position.z), 1.0 - exp(-delta * 3.5))
	if absf(hall - was_hall) > 0.0005 or absf(width - target_width) > 0.001:
		if absf(width - target_width) > 0.001:
			width = lerpf(width, target_width, 1.0 - exp(-delta * 10.0))
			if absf(width - target_width) < 0.02:
				width = target_width
		_resize()
	follow = follow.lerp(Vector2(student.position.x - 0.15, student.position.z), 1.0 - exp(-delta * 4.0))
	leg = lerpf(leg, leg_for(student.position.x, student.position.z), 1.0 - exp(-delta * 3.0))
	chapel = lerpf(chapel, chapel_for(student.position.x, student.position.z), 1.0 - exp(-delta * 3.0))
	gym = lerpf(gym, gym_for(student.position.x, student.position.z), 1.0 - exp(-delta * 3.0))
	gable = lerpf(gable, gable_for(student.position.x, student.position.z), 1.0 - exp(-delta * 3.0))
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
	# Facing the gym it frames the front (sliding in z), or from the lane the north
	# gable (sliding in x); close up it frames the student's own depth on the road.
	var gym_face := minf(lerpf(Gym.FRONT_X, follow.x, close), follow.x + 18.0)
	var gym_side := lerpf(lerpf(follow.y, clampf(follow.y, 88.0, 112.0), wide), GYM_MIDDLE.y, campus)
	var gable_x := roundf(lerpf(follow.x, GYM_MIDDLE.x, wide) / pixel) * pixel
	var gable_z := lerpf(Gym.NORTH + Gym.SHIFT, follow.y, close)
	gym_side = roundf(gym_side / pixel) * pixel
	var gym_focus := Vector3(gym_face, target_y, gym_side).lerp(Vector3(gable_x, target_y, gable_z), gable)
	var focus := Vector3(front, target_y, depth) * (1.0 - leg - chapel - gym)
	focus += Vector3(CANTEEN_FACE_X, target_y, side) * leg + Vector3(reach, target_y, aisle) * chapel + gym_focus * gym
	# Inside the hallway: glide in close and look a little down along the corridor.
	var inside := smoothstep(0.0, 1.0, hall)
	var corridor := Vector3(roundf(follow.x / pixel) * pixel, 1.35, -1.9)
	focus = focus.lerp(corridor, inside)
	distance = lerpf(distance, 20.0, inside)
	lift = lerpf(lift, 5.0, inside)
	var yaw := _yaw()
	camera.position = focus + Vector3(sin(yaw) * distance, lift, cos(yaw) * distance)
	camera.look_at(focus)
	# The cutaway: the near plane sweeps in from the camera to just behind the front
	# piers, so the road, the lawn and the piers fall away and the corridor stays.
	var forward := -camera.global_basis.z
	var cut_depth := (Vector3(focus.x, focus.y, Hallway.CUT_Z) - camera.position).dot(forward)
	camera.near = maxf(0.1, cut_depth * inside)
	var grade := display.material as ShaderMaterial
	grade.set_shader_parameter("cut", inside)
	if inside > 0.0:
		var size := Vector2(viewport.size)
		grade.set_shader_parameter("cut_top", camera.unproject_position(Vector3(focus.x, Hallway.CEILING, -1.5)).y / size.y)
		grade.set_shader_parameter("cut_bottom", camera.unproject_position(Vector3(focus.x, 0.0, Hallway.CUT_Z)).y / size.y)
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
	title.text = "APS, the chapel and the IH Gym"
	title.add_theme_font_size_override("font_size", 22)
	title.add_theme_color_override("font_color", Color("fff1d8"))
	title.add_theme_color_override("font_shadow_color", Color("272d39"))
	title.add_theme_constant_override("shadow_offset_y", 2)
	stack.add_child(title)
	var controls := Label.new()
	controls.text = "A/D  Walk    W/S  Depth    Shift  Run    T  Time    C  Character    M  Mute\n" + \
		"Wheel or +/-  Zoom    1-8  Framings    Q/E  Angle    P  Pixels\n" + \
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
	elif value == 84.0:
		student.place(GYM_SPOT.x, GYM_SPOT.y)
		_snap_follow()
	elif value == 44.0:
		student.place(GYM_SIDE_SPOT.x, GYM_SIDE_SPOT.y)
		_snap_follow()
	elif value <= 56.0 and value > 10.0 and (leg > 0.5 or chapel > 0.5 or gym > 0.5):
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
		KEY_1, KEY_2, KEY_3, KEY_4, KEY_5, KEY_6, KEY_7, KEY_8:
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
	var turn := -PI / 2.0 * (leg + chapel + gym + gable)
	var right := Vector2(cos(turn), -sin(turn))
	var away := Vector2(-sin(turn), -cos(turn))
	student.move(right * direction.x - away * direction.y, _held([KEY_SHIFT]), delta, direction.x)
	sound.indoor = World.floor_height(student.position.x, student.position.z) >= 0.45 or hall > 0.5
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
		var canteen_hall := World.canteen_world(51, 0)
		checks.canteen_floor = is_equal_approx(World.floor_height(canteen_hall.x, canteen_hall.y), 0.45)
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
			var turn := -PI / 2.0 * (leg + chapel + gym + gable)
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
		# The IH Gym: built on its plot at its surveyed size, facing the east road, solid,
		# with its walk, steps, apron and lane, and framings that face the right way.
		var gym_node := scene.find_child("IHGym", false, false) as Node3D
		checks.gym_built = gym_node != null and gym_node.find_child("HOLY ANGEL UNIVERSITY", false, false) != null \
			and gym_node.find_child("GYM", false, false) != null and not Plots.shapes().has("gym")
		checks.gym_faces_road = gym_node != null and (gym_node.global_basis * Vector3.BACK).dot(Vector3.LEFT) > 0.99
		checks.gym_real_size = is_equal_approx(Gym.DEPTH, 41.0) and is_equal_approx(Gym.SOUTH - Gym.NORTH, 69.5)
		checks.gym_solid = World.blocked(78.0, 96.0) and World.blocked(58.3, 86.0) and World.blocked(98.7, 130.0)
		var left_door := Gym.LEFT_DOOR + Gym.SHIFT
		checks.gym_walk_and_steps = is_equal_approx(World.floor_height(56.0, 86.0), 0.15) \
			and is_equal_approx(World.floor_height(57.8, left_door), 0.75) and not World.blocked(57.8, left_door) \
			and is_equal_approx(World.floor_height(50.0, 86.0), -0.185) and not World.blocked(50.0, 86.0)
		var east_road := not World.blocked(GYM_SIDE_SPOT.x, GYM_SIDE_SPOT.y)
		for z in range(40, 100, 5):
			east_road = east_road and not World.blocked(40.5, z) and is_equal_approx(World.floor_height(40.5, z), -0.19)
		checks.east_road_and_lane_open = east_road
		_choose_framing(6)
		_set_zoom(84.0, true)
		_update_camera(1.0)
		checks.gym_front_visible = gym > 0.99 and gable < 0.01 and (-camera.global_basis.z).dot(Vector3.RIGHT) > 0.95 \
			and _all_visible([Gym.FRONT_X], [0.0, Gym.EAVE], [Gym.NORTH + Gym.SHIFT, Gym.SOUTH + Gym.SHIFT])
		_set_zoom(MIN_WIDTH, true)
		_update_camera(1.0)
		checks.gym_close_shows_student = _all_visible([student.position.x], [student.position.y, student.position.y + 1.83], [student.position.z])
		_choose_framing(7)
		_set_zoom(44.0, true)
		_update_camera(1.0)
		checks.gym_side_faces_gable = gable > 0.99 and (-camera.global_basis.z).dot(Vector3.BACK) > 0.95 \
			and _all_visible([Gym.FRONT_X, 99.0], [0.0, 12.0], [Gym.NORTH + Gym.SHIFT])
		# The hallway: walkable behind the piers, its stairs, piers, bust and map solid.
		checks.hallway_walkable = not World.blocked(-30.0, -2.0) and is_equal_approx(World.floor_height(-30.0, -2.0), 0.03)
		checks.hallway_props_block = World.blocked(-60.0, -2.4) and World.blocked(-24.0, -0.2) \
			and World.blocked(Hallway.BUST.x, Hallway.BUST.y) and World.blocked(Hallway.MAP.x, Hallway.MAP.y)
		# Walking in from the sidewalk: the camera glides in and cuts away the outside.
		student.place(-21.0, 1.6)
		_set_zoom(36.0, true)
		_snap_follow()
		for i in 120:
			student.move(Vector2(0, -1), false, 1.0 / 30.0, 0.0)
			_update_camera(1.0 / 30.0)
		var cut_plane := (Vector3(follow.x, 1.35, Hallway.CUT_Z) - camera.position).dot(-camera.global_basis.z)
		checks.walk_into_hallway = student.position.z < -1.5 and hall > 0.95 and shown_width < HALL_WIDTH + 0.2 \
			and camera.near > cut_plane - 0.5 and _all_visible([student.position.x], [0.2, 1.8], [student.position.z])
		for i in 120:
			student.move(Vector2(0, 1), false, 1.0 / 30.0, 0.0)
			_update_camera(1.0 / 30.0)
		checks.walk_out_of_hallway = hall < 0.05 and camera.near < 0.2 and absf(shown_width - 36.0) < 0.2
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
