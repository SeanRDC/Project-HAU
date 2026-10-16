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
const GymInterior := preload("res://areas/gym_interior.gd")
const Npcs := preload("res://npcs.gd")
const Hallway := preload("res://areas/hallway.gd")
const Sjh := preload("res://areas/sjh.gd")
const Mgn := preload("res://areas/mgn.gd")
const MiddleRoad := preload("res://areas/middle_road.gd")
const DevTravel := preload("res://dev_travel.gd")
## Inside the hallway the view closes in to this width, framed on the corridor.
const HALL_WIDTH := 8.5
const HOURS: Array[float] = [8.0, 12.0, 16.5, 21.0]
const FRAMINGS := [[112.0, "APS + canteen"], [56.0, "Whole building"], [36.0, "Corridor"], [28.0, "Canteen"], [10.0, "Close-up"], [32.0, "Chapel"],
	[84.0, "IH Gym"], [44.0, "Gym side"], [64.0, "SJH"], [30.0, "Gym inside"]]
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
## Where the gym's inside framing (key 0) brings the student: centre court, facing the stage.
const GYM_IN_SPOT := Vector2(78.5, 96.3)
## Inside the gym the camera is a low 2.5D view from this pitch and distance, turned
## to face the west stand, the stage or the east stand (GymInterior.face_for).
const ARENA_PITCH := 12.0
const ARENA_DISTANCE := 60.0
## The framing the camera glides to when the student walks in from a wide one, and
## the widest it goes inside (wider, a low view's lower edge would start under the floor).
const ARENA_WIDTH := 30.0
const ARENA_CAP := 40.0
## Up on the stage, the stands or the balcony it closes in to a low side view.
const PERCH_PITCH := 10.0
const PERCH_DISTANCE := 60.0
const PERCH_WIDTH := 16.0
## Where the SJH framing (key 9) brings the student: the south road, by the parking.
const SJH_SPOT := Vector2(-11.0, 109.0)
## Where --view=mgn brings the student: the west road, in front of MGN's entrance.
const MGN_SPOT := Vector2(-60.5, 92.0)
## Where --view=middle brings the student: the middle road's north carriageway, past the zebra.
const MIDDLE_SPOT := Vector2(-78.0, 60.4)
const MAX_WIDTH := 140.0
## Facing south on the middle road, the camera cuts away everything north of this z (the
## APS wing and the corner garden, which would stand in front at the mouth); PGN's side of
## the road fades instead (MiddleRoad.NORTH_GROUP), so the ground up to the plot stays.
const MIDDLE_CUT_Z := 30.0
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
var npcs: Npcs
## E was just used to talk, so holding it does not also turn the camera.
var _e_talk := false
var help: Control
## The F1 fast-travel panel (a dev tool).
var travel: DevTravel
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
## 0..1: how far the camera has glided into the gym's inside view (see arena_for).
var arena := 0.0
## Inside the gym, which way the camera faces in quarter turns past the gym's front
## view: 0 the east stand (L), 1 the stage (F), 2 the west stand (R); eased.
var face := 1.0
## 0..1: how far the gym's hall view has closed in to the low side view (see perch_for).
var perch := 0.0
var _was_perched := false
var _zoom_before_perch := -1.0
## The gym's cut-away groups: {name, alpha, items: [[GeometryInstance3D, its own cast_shadow]]}.
var _cutaways: Array = []
var _interior_lights: Node3D
## The reserved plots' floating labels, hidden while the student is inside the gym
## (the annex's would hang in front of the side views).
var _plot_labels: Array[Node] = []
var _was_inside := false
var _zoom_before := -1.0
## 0..1: how far the camera has turned right round to face St. Joseph Hall from the parking.
var sjh := 0.0
## 0..1: how far the camera has turned right round to look west at MGN from the west road.
var mgn := 0.0
## 0..1: how far the camera has turned to look south across the middle road (PGN to MGN).
var middle := 0.0
## 0..1: how far the student is inside SJH's covered walkway (the same cutaway as the hallway).
var walkway := 0.0
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
	_collect_cutaways()
	student = Student.new()
	scene.add_child(student)
	sound = Sound.new()
	add_child(sound)
	student.stepped.connect(_on_step)
	_build_interface()
	travel = DevTravel.new()
	add_child(travel)
	var names: Array = []
	for place in travel_places():
		names.append(place[0])
	travel.setup(names)
	travel.chosen.connect(_travel_to)
	if _args.has("travel"):
		travel.toggle.call_deferred() # --travel opens the panel, for captures
	npcs = Npcs.new()
	npcs.camera = camera
	npcs.student = student
	npcs.to_screen = _to_screen
	scene.add_child(npcs)
	npcs.build_ui(self)

	var views := {"canteen": [CANTEEN_SPOT, 28.0], "gym": [GYM_SPOT, 84.0], "gym-side": [GYM_SIDE_SPOT, 44.0],
		"gym-in": [GYM_IN_SPOT, ARENA_WIDTH], "sjh": [SJH_SPOT, 64.0], "mgn": [MGN_SPOT, 56.0], "middle": [MIDDLE_SPOT, 40.0]}
	var start: Array = views.get(_args.get("view", ""), [Vector2(0.7, 5.3), 112.0])
	var spot: Vector2 = start[0]
	hour = float(_args.get("hour", "16.5"))
	if not HOURS.has(hour):
		hour = 16.5
	pixel_mode = _args.get("pixel", "auto") if PIXEL_MODES.has(_args.get("pixel", "auto")) else "auto"
	orbit = clampf(float(_args.get("angle", "0.12")), -0.25, 0.25)
	if _args.has("girl"):
		student.set_character("girl")
	# --level= starts the student on an upper storey inside the gym (the stands, the stage).
	student.place(float(_args.get("x", str(spot.x))), float(_args.get("z", str(spot.y))), float(_args["level"]) if _args.has("level") else NAN)
	_set_zoom(float(_args.get("zoom", str(start[1]))), true)
	if _args.has("hide-help"):
		help.visible = false
	_snap_follow()
	_set_hour(hour)
	get_window().size_changed.connect(_resize)
	_resize()
	_update_camera(1.0)
	_was_inside = arena_for(student.position.x, student.position.z) > 0.5
	_was_perched = _was_inside and perch > 0.5
	_update_cutaways(0.0, true)
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
	shown_width = lerpf(width, minf(width, HALL_WIDTH), smoothstep(0.0, 1.0, clampf(hall + walkway, 0.0, 1.0)))
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
	# Inside the gym the low view only goes out to ARENA_CAP: wider, its frame's lower
	# edge would start under the floor.
	var inside_gym := student != null and arena_for(student.position.x, student.position.z) > 0.5
	var widest := ARENA_CAP if inside_gym else MAX_WIDTH
	target_width = clampf(value, MIN_WIDTH, widest)
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
	return smoothstep(38.0, 46.0, z) * smoothstep(34.0, 38.0, x) * (1.0 - Sjh.view_for(x, z))

## The further turn to face the gym's north gable, once past its north-west corner into
## the lane; it hands over to the hall view in the side entrance.
static func gable_for(x: float, z: float) -> float:
	return smoothstep(Gym.FRONT_X, Gym.FRONT_X + 4.0, x) * (1.0 - _side_door_for(z))

## 0 in the lane, 1 once through the side entrance (the gable is at z 66.8).
static func _side_door_for(z: float) -> float:
	return smoothstep(Gym.NORTH + Gym.SHIFT - 0.8, Gym.NORTH + Gym.SHIFT, z)

## How far into the gym's inside view: 1 anywhere inside its walls, rising across the
## last 0.8 m in front of a front doorway or the side entrance; 0 elsewhere outside.
## The camera eases towards it, so walking in glides it round.
static func arena_for(x: float, z: float) -> float:
	if Gym.inside(x, z):
		return 1.0
	var p := Gym.gym_local(x, z)
	if p.y >= 0.0 and p.y < 0.8:
		for door in Gym.OPENINGS:
			if absf(p.x - door[0]) < door[1] / 2.0 + 0.3:
				return 1.0 - smoothstep(0.0, 0.8, p.y)
	if p.x > Gym.NORTH - 0.8 and p.x <= Gym.NORTH and absf(p.y - Gym.SIDE_DOOR) < 3.0:
		return _side_door_for(z)
	return 0.0

## Inside the gym, which way to face (see GymInterior.face_for): the student's half of
## the hall, or the stage.
static func face_for(x: float, z: float) -> float:
	var p := Gym.gym_local(x, z)
	return GymInterior.face_for(p.x, p.y)

## 1 with the student up on the gym's stage, stands or balcony (at height level).
static func perch_for(x: float, z: float, level: float) -> float:
	var p := Gym.gym_local(x, z)
	return 1.0 if GymInterior.perched(p.x, p.y, level) else 0.0

static func chapel_for(x: float, z: float) -> float:
	return smoothstep(24.0, 32.0, z) * (1.0 - smoothstep(-24.0, -18.0, x)) * (1.0 - Sjh.view_for(x, z)) * (1.0 - Mgn.reach(x, z)) \
		* (1.0 - MiddleRoad.view_for(x, z))

## The MGN view (facing west from the west road) yields to the middle road's.
static func mgn_for(x: float, z: float) -> float:
	return Mgn.view_for(x, z) * (1.0 - MiddleRoad.view_for(x, z))

func _snap_follow() -> void:
	follow = Vector2(student.position.x - 0.15, student.position.z)
	leg = leg_for(student.position.x, student.position.z)
	chapel = chapel_for(student.position.x, student.position.z)
	gym = gym_for(student.position.x, student.position.z)
	gable = gable_for(student.position.x, student.position.z)
	arena = arena_for(student.position.x, student.position.z)
	face = face_for(student.position.x, student.position.z)
	perch = perch_for(student.position.x, student.position.z, student.level())
	hall = Hallway.hall_for(student.position.x, student.position.z)
	sjh = Sjh.view_for(student.position.x, student.position.z)
	mgn = mgn_for(student.position.x, student.position.z)
	middle = MiddleRoad.view_for(student.position.x, student.position.z)
	walkway = Sjh.walkway_for(student.position.x, student.position.z)

## The camera's turn about the vertical: 0 looks north at APS, -90° east at the
## canteen or the chapel (their views never overlap: one is east of x 12, one west of -18),
## -180° south at the gym's gable from the lane or down its hall from inside, and
## -180° south at St. Joseph Hall (it takes over from the chapel and gym views), and
## -270° west at MGN from the west road (it takes over from the chapel view; at the
## corner it hands a quarter turn on to SJH's), and -180° south across the middle road.
func _yaw() -> float:
	return orbit - PI / 2.0 * _turns()

## The camera's turn in quarter turns (SJH's and the middle road's half turns count two,
## MGN's three); the controls use it too.
func _turns() -> float:
	return leg + chapel + gym + gable + arena * face + 2.0 * sjh + 3.0 * mgn + 2.0 * middle

func _update_camera(delta: float) -> void:
	var was_inside := hall + walkway
	hall = lerpf(hall, Hallway.hall_for(student.position.x, student.position.z), 1.0 - exp(-delta * 3.5))
	walkway = lerpf(walkway, Sjh.walkway_for(student.position.x, student.position.z), 1.0 - exp(-delta * 3.5))
	if absf(hall + walkway - was_inside) > 0.0005 or absf(width - target_width) > 0.001:
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
	arena = lerpf(arena, arena_for(student.position.x, student.position.z), 1.0 - exp(-delta * 3.0))
	perch = lerpf(perch, perch_for(student.position.x, student.position.z, student.level()), 1.0 - exp(-delta * 3.0))
	face = lerpf(face, face_for(student.position.x, student.position.z), 1.0 - exp(-delta * 3.0))
	sjh = lerpf(sjh, Sjh.view_for(student.position.x, student.position.z), 1.0 - exp(-delta * 3.0))
	mgn = lerpf(mgn, mgn_for(student.position.x, student.position.z), 1.0 - exp(-delta * 3.0))
	middle = lerpf(middle, MiddleRoad.view_for(student.position.x, student.position.z), 1.0 - exp(-delta * 3.0))
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
	# Inside the gym it is a low 2.5D view on the student, turned to their half of the
	# hall's stand or to the stage (face); up on the stage or the stands it closes in.
	var arena_x := roundf(follow.x / pixel) * pixel
	var arena_z := roundf(follow.y / pixel) * pixel
	gym_focus = gym_focus.lerp(Vector3(arena_x, student.position.y + 1.0, arena_z), arena)
	var inside_distance := lerpf(ARENA_DISTANCE, PERCH_DISTANCE, perch)
	var inside_lift := lerpf(ARENA_DISTANCE * tan(deg_to_rad(ARENA_PITCH)), PERCH_DISTANCE * tan(deg_to_rad(PERCH_PITCH)), perch)
	distance = lerpf(distance, inside_distance, arena)
	lift = lerpf(lift, inside_lift, arena)
	# Facing SJH it frames the front (sliding along it); wide, it centres on the building.
	var along := Sjh.local(follow.x, follow.y).x
	along = lerpf(lerpf(along, along * 0.4, wide), 0.0, campus)
	var sjh_face := Sjh.world(along, 0.5)
	var sjh_focus := Vector3(sjh_face.x, lerpf(target_y, target_y + 4.0, wide), sjh_face.y)
	# Facing MGN it frames the long block's corridor front (sliding along it); wide, it
	# centres on the building; close up it frames the student's own depth on the road.
	var mgn_at := Mgn.local(follow.x, follow.y)
	var mgn_along := lerpf(lerpf(mgn_at.x, 6.0, wide), 5.0, campus)
	var mgn_face := Mgn.world(mgn_along, lerpf(0.0, mgn_at.y, close))
	var mgn_focus := Vector3(mgn_face.x, lerpf(target_y, target_y + 3.0, wide), roundf(mgn_face.y / pixel) * pixel)
	# Facing south across the middle road it slides along it with the student; wide, it
	# frames the south walkway and MGN's north block behind it.
	var middle_x := roundf(follow.x / pixel) * pixel
	var middle_z := lerpf(lerpf(follow.y, MiddleRoad.LANE_S.x + 1.0, wide), MiddleRoad.WALK_S.x, campus)
	var middle_focus := Vector3(middle_x, lerpf(target_y, target_y + 2.0, wide), roundf(middle_z / pixel) * pixel)
	var focus := Vector3(front, target_y, depth) * (1.0 - leg - chapel - gym - sjh - mgn - middle)
	focus += Vector3(CANTEEN_FACE_X, target_y, side) * leg + Vector3(reach, target_y, aisle) * chapel + gym_focus * gym
	focus += sjh_focus * sjh + mgn_focus * mgn + middle_focus * middle
	# Inside a covered corridor (the APS hallway, SJH's walkway): glide in close and
	# look a little down along it. Each gives the corridor's middle, how far in front
	# of it the cut goes, and its ceiling.
	var inside_weight := clampf(hall + walkway, 0.0, 1.0)
	var inside := smoothstep(0.0, 1.0, inside_weight)
	var corridor := Vector3(roundf(follow.x / pixel) * pixel, 1.35, -1.9)
	var cut_offset := Hallway.CUT_Z + 1.9
	var ceiling := Hallway.CEILING
	if walkway > hall:
		var middle := Sjh.world(Sjh.local(follow.x, follow.y).x, Sjh.WALL_Z / 2.0)
		corridor = Vector3(middle.x, Sjh.WALK_Y + 1.35, middle.y)
		cut_offset = Sjh.CUT_OFFSET + Sjh.WALL_Z / 2.0 + 1.8
		ceiling = Sjh.CEILING
	focus = focus.lerp(corridor, inside)
	distance = lerpf(distance, 20.0, inside)
	lift = lerpf(lift, 5.0, inside)
	var yaw := _yaw()
	var toward := Vector3(sin(yaw), 0.0, cos(yaw))
	camera.position = focus + Vector3(sin(yaw) * distance, lift, cos(yaw) * distance)
	camera.look_at(focus)
	# The cutaway: the near plane sweeps in from the camera to just behind the front
	# piers or railing, so the road, the lawn and the piers fall away and the corridor stays.
	var forward := -camera.global_basis.z
	var cut := corridor + toward * absf(cut_offset)
	var cut_depth := (Vector3(cut.x, focus.y, cut.z) - camera.position).dot(forward)
	camera.near = maxf(0.1, cut_depth * inside)
	# Facing St. Joseph Hall the camera stands north of the chapel: everything north of
	# the parking (the chapel, its trees) is cut away the same way as it turns round.
	if sjh > 0.0:
		var parking_edge := (Vector3(focus.x, focus.y, Sjh.PARKING.position.y - 0.6) - camera.position).dot(forward)
		camera.near = maxf(camera.near, parking_edge * smoothstep(0.0, 1.0, sjh))
	# Facing MGN it stands over the chapel lawn: everything east of the west road (the
	# lawn's trees, the chapel) is cut away.
	if mgn > 0.0:
		var lawn_edge := (Vector3(Mgn.CUT_X, focus.y, focus.z) - camera.position).dot(forward)
		camera.near = maxf(camera.near, lawn_edge * smoothstep(0.0, 1.0, mgn))
	# Facing south across the middle road the camera stands over PGN's plot: everything
	# north of it (the APS wing, the corner garden) is cut away.
	if middle > 0.0:
		var north_edge := (Vector3(focus.x, focus.y, MIDDLE_CUT_Z) - camera.position).dot(forward)
		camera.near = maxf(camera.near, north_edge * smoothstep(0.0, 1.0, middle))
	var grade := display.material as ShaderMaterial
	grade.set_shader_parameter("cut", inside)
	if inside > 0.0:
		var size := Vector2(viewport.size)
		var back := corridor - toward * 0.4
		grade.set_shader_parameter("cut_top", camera.unproject_position(Vector3(back.x, ceiling, back.z)).y / size.y)
		grade.set_shader_parameter("cut_bottom", camera.unproject_position(Vector3(cut.x, corridor.y - 1.35, cut.z)).y / size.y)
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
	title.text = "APS, the chapel, the IH Gym and St. Joseph Hall"
	title.add_theme_font_size_override("font_size", 22)
	title.add_theme_color_override("font_color", Color("fff1d8"))
	title.add_theme_color_override("font_shadow_color", Color("272d39"))
	title.add_theme_constant_override("shadow_offset_y", 2)
	stack.add_child(title)
	var controls := Label.new()
	controls.text = "A/D  Walk    W/S  Depth    Shift  Run    T  Time    C  Character    M  Mute\n" + \
		"E/Space  Talk (near someone)\n" + \
		"Wheel or +/-  Zoom    1-9, 0  Framings    Q/E  Angle    P  Pixels\n" + \
		"R  Reset    F11  Fullscreen    F1  Fast travel (dev)    Tab  Hide controls    Esc  Close"
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
	elif value == ARENA_WIDTH:
		student.place(GYM_IN_SPOT.x, GYM_IN_SPOT.y)
		_snap_follow()
		_was_inside = true
		_zoom_before = -1.0
	elif value == 64.0:
		student.place(SJH_SPOT.x, SJH_SPOT.y)
		_snap_follow()
	elif value <= 56.0 and value > 10.0 and (leg > 0.5 or chapel > 0.5 or gym > 0.5 or sjh > 0.5 or mgn > 0.5):
		student.place(0.7, 5.3)
		_snap_follow()
	_set_zoom(value)

func _reset() -> void:
	student.place(0.7, 5.3)
	orbit = 0.12
	_snap_follow()
	_set_hour(16.5)
	_set_zoom(112.0)

## Fast-travel places (dev, F1): name, where the student stands, the framing width.
## Each spot is walkable ground (a check makes sure); add new buildings here.
static func travel_places() -> Array:
	return [
		["APS entrance", Vector2(0.7, 5.3), 22.0],
		["APS hallway", Vector2(-6.0, -2.0), 22.0],
		["Corner garden", Vector2(-52.0, 10.0), 30.0],
		["Canteen patio", CANTEEN_SPOT, 28.0],
		["Canteen hall", World.canteen_world(51.0, 0.0), 22.0],
		["Picnic strip", Vector2(45.5, 10.0), 26.0],
		["Chapel plaza", CHAPEL_SPOT, 32.0],
		["IH Gym front", GYM_SPOT, 84.0],
		["IH Gym side", GYM_SIDE_SPOT, 44.0],
		["IH Gym inside", GYM_IN_SPOT, ARENA_WIDTH],
		["St. Joseph Hall", SJH_SPOT, 64.0],
		["SJH walkway", Sjh.world(25.0, -1.8), 22.0],
		["Mary statue", Vector2(-48.5, 113.6), 26.0],
		["MGN", MGN_SPOT, 56.0],
		["MGN entrance", Mgn.world(21.0, 2.5), 18.0],
		["Middle road (PGN-MGN)", MIDDLE_SPOT, 40.0],
		["Flagpole end", Vector2(-170.5, 60.0), 40.0],
	]

## Jumps the student to a fast-travel place, with every camera zone, the gym's
## cutaways and the zoom snapped there at once (the panel fades it in from black).
func _travel_to(index: int) -> void:
	var place: Array = travel_places()[index]
	var spot: Vector2 = place[1]
	if not student.place(spot.x, spot.y):
		push_warning("Fast travel: %s is not walkable" % place[0])
		return
	_snap_follow()
	# Where the student lands decides the zoom's cap (inside the gym, ARENA_CAP), so
	# set it first.
	_was_inside = arena_for(student.position.x, student.position.z) > 0.5
	_zoom_before = -1.0
	_was_perched = false
	_zoom_before_perch = -1.0
	_set_zoom(place[2], true)
	_update_cutaways(0.0, true)
	_update_camera(1.0)
	sound.select()

func _unhandled_input(event: InputEvent) -> void:
	if event is InputEventKey and event.pressed and not event.echo and event.physical_keycode == KEY_F1:
		travel.toggle()
		return
	if travel and travel.is_open():
		if event is InputEventKey and event.pressed and event.physical_keycode == KEY_ESCAPE:
			travel.close()
		return
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
		KEY_E:
			if npcs.interact():
				_e_talk = true
				sound.select()
		KEY_SPACE, KEY_ENTER, KEY_KP_ENTER:
			if npcs.interact():
				sound.select()
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
		KEY_1, KEY_2, KEY_3, KEY_4, KEY_5, KEY_6, KEY_7, KEY_8, KEY_9:
			_choose_framing(event.physical_keycode - KEY_1)
			sound.select()
		KEY_0:
			_choose_framing(9) # the gym inside, after SJH on 9
			sound.select()

## Tiles, kerbs and the canteen floor click; the road and the patio thud.
func _on_step() -> void:
	sound.footstep(World.floor_height(student.position.x, student.position.z, student.level()) > 0.0)

## A world point on the UI layer: through the camera into the pixel viewport,
## then out through the display, which covers the window keeping its aspect.
func _to_screen(point: Vector3) -> Vector2:
	var p := camera.unproject_position(point)
	var ui := get_viewport().get_visible_rect().size
	var pixels := Vector2(viewport.size)
	var scale := maxf(ui.x / pixels.x, ui.y / pixels.y)
	return p * scale + (ui - pixels * scale) * 0.5

func _held(keys: Array) -> bool:
	for key in keys:
		if Input.is_physical_key_pressed(key):
			return true
	return false

func _process(delta: float) -> void:
	delta = minf(delta, 0.05)
	var direction := Vector2(float(_held([KEY_D, KEY_RIGHT])) - float(_held([KEY_A, KEY_LEFT])),
		float(_held([KEY_S, KEY_DOWN])) - float(_held([KEY_W, KEY_UP])))
	if travel.is_open():
		direction = Vector2.ZERO # the arrows pick a place instead
	# Keys are relative to the camera, so D keeps walking screen-right round the corner.
	var turn := -PI / 2.0 * _turns()
	var right := Vector2(cos(turn), -sin(turn))
	var away := Vector2(-sin(turn), -cos(turn))
	student.move(right * direction.x - away * direction.y, _held([KEY_SHIFT]), delta, direction.x)
	sound.indoor = World.floor_height(student.position.x, student.position.z, student.level()) >= 0.45 or hall > 0.5 or walkway > 0.5
	if not _held([KEY_E]):
		_e_talk = false
	orbit = clampf(orbit + (float(_held([KEY_E]) and not _e_talk) - float(_held([KEY_Q]))) * delta * 0.25, -0.25, 0.25)
	_glide_zoom()
	_update_camera(delta)
	_update_cutaways(delta)
	npcs.update(delta)

## Walking into the gym from a wide framing glides the zoom in to the hall's; walking
## out again glides back, unless the zoom was changed inside.
func _glide_zoom() -> void:
	var inside := arena_for(student.position.x, student.position.z) > 0.5
	if inside and not _was_inside:
		_zoom_before = target_width if target_width > ARENA_WIDTH + 8.0 else -1.0
		if _zoom_before > 0.0:
			_set_zoom(ARENA_WIDTH)
	elif not inside and _was_inside:
		if _zoom_before > 0.0 and is_equal_approx(target_width, ARENA_WIDTH):
			_set_zoom(_zoom_before)
		_zoom_before = -1.0
	_was_inside = inside
	# Up onto the stage or the stands: in to the side view's framing, and back down after.
	var perched := inside and perch_for(student.position.x, student.position.z, student.level()) > 0.5
	if perched and not _was_perched:
		_zoom_before_perch = target_width if target_width > PERCH_WIDTH + 2.0 else -1.0
		if _zoom_before_perch > 0.0:
			_set_zoom(PERCH_WIDTH)
	elif not perched and _was_perched:
		_was_perched = false
		if _zoom_before_perch > 0.0 and is_equal_approx(target_width, PERCH_WIDTH):
			_set_zoom(_zoom_before_perch)
		_zoom_before_perch = -1.0
	_was_perched = perched

# --- The gym's cutaway ----------------------------------------------------------------

func _collect_cutaways() -> void:
	var gym_node := scene.find_child("IHGym", false, false) as Node3D
	_interior_lights = gym_node.get_node("InteriorLights")
	_plot_labels = scene.find_children("Plot *", "Label3D", false, false)
	for group in GymInterior.cuts():
		var items := []
		var stack: Array[Node] = [gym_node.get_node(group)]
		while not stack.is_empty():
			var node: Node = stack.pop_back()
			if node is GeometryInstance3D:
				items.append([node, (node as GeometryInstance3D).cast_shadow])
			stack.append_array(node.get_children())
		_cutaways.append({"name": group, "alpha": 1.0, "items": items})
	# PGN's side of the middle road fades the same way while the camera faces south across it.
	var north_items := []
	var north_stack: Array[Node] = [scene.find_child(MiddleRoad.NORTH_GROUP, false, false)]
	while not north_stack.is_empty():
		var node: Node = north_stack.pop_back()
		if node is GeometryInstance3D:
			north_items.append([node, (node as GeometryInstance3D).cast_shadow])
		north_stack.append_array(node.get_children())
	_cutaways.append({"name": MiddleRoad.NORTH_GROUP, "alpha": 1.0, "items": north_items})

## Fades the groups standing between the camera and the student out (they keep casting
## shadows) and back in, and lights the hall while the student is in it.
func _update_cutaways(delta: float, immediate := false) -> void:
	var p := Gym.gym_local(student.position.x, student.position.z)
	var y := student.level()
	# Which side of the hall the camera is looking at now (it glides between them).
	var side := GymInterior.side_for(face)
	var on_middle := MiddleRoad.view_for(student.position.x, student.position.z) > 0.5
	for cut in _cutaways:
		var hidden: bool = on_middle if cut["name"] == MiddleRoad.NORTH_GROUP else GymInterior.hidden(cut["name"], p.x, p.y, y, side)
		var target := 0.0 if hidden else 1.0
		var alpha: float = target if immediate else move_toward(cut["alpha"], target, delta * 2.5)
		if alpha == cut["alpha"] and not immediate:
			continue
		cut["alpha"] = alpha
		for item in cut["items"]:
			var instance: GeometryInstance3D = item[0]
			var cast: int = item[1]
			instance.visible = alpha > 0.0 or cast != GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
			instance.transparency = 0.0 if alpha <= 0.0 or alpha >= 1.0 else 1.0 - alpha
			instance.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_SHADOWS_ONLY if alpha <= 0.0 else cast
	_interior_lights.visible = GymInterior.inside(p.x, p.y)
	# The plots' labels hide inside the gym and on the middle road (PGN's would hang in front).
	for label in _plot_labels:
		(label as Label3D).visible = not _interior_lights.visible and not on_middle

func _cut_alpha(group: String) -> float:
	for cut in _cutaways:
		if cut["name"] == group:
			return cut["alpha"]
	return -1.0

# --- Checks and captures ----------------------------------------------------------

func _all_visible(xs: Array, ys: Array, zs: Array) -> bool:
	for x in xs:
		for y in ys:
			for z in zs:
				var p := camera.unproject_position(Vector3(x, y, z))
				if p.x < 0 or p.y < 0 or p.x > viewport.size.x or p.y > viewport.size.y:
					return false
	return true

## World x/z of a point in the gym's local frame.
static func _gym_world(lx: float, lz: float) -> Vector2:
	return Vector2(Gym.FRONT_X - lz, lx + Gym.SHIFT)

## Walks the student in world direction for steps of 0.05 s, the camera following.
func _walk(direction: Vector2, steps: int) -> void:
	for i in steps:
		student.move(direction, false, 0.05)
		_update_camera(0.05)

## The gym inside: built, entered by its doorways and side entrance, its storeys,
## stairs, bleacher rows, stage and backstage reachable, the cutaway and the hall view.
func _gym_inside_checks(checks: Dictionary, gym_node: Node3D) -> void:
	var interior := gym_node.find_child("Interior", false, false)
	var lights := gym_node.find_child("InteriorLights", false, false)
	checks.gym_interior_built = interior != null and interior.find_child("Court", false, false) != null \
		and interior.find_child("WELCOME ANGELITES", false, false) != null and lights.get_child_count() > 20
	# In through the left doorway from its landing: in the west half the camera glides
	# round to face the west stand, the roof is cut away and the hall is lit.
	var door := _gym_world(Gym.LEFT_DOOR, 0.4)
	student.place(door.x, door.y)
	_snap_follow()
	_walk(Vector2(1, 0), 60)
	_update_cutaways(0.0, true)
	var inside := Gym.gym_local(student.position.x, student.position.z)
	checks.walk_into_gym = Gym.inside(student.position.x, student.position.z) and inside.y < -3.0 \
		and is_equal_approx(student.level(), GymInterior.FLOOR) and arena > 0.9 \
		and (-camera.global_basis.z).dot(Vector3.LEFT) > 0.75 and _cut_alpha("Roof") == 0.0 and _interior_lights.visible
	# The lobby and the stand above it are two storeys at one spot; the back has two
	# open doorways like the front.
	var aisle := _gym_world(90.0, -10.0)
	var back_door := _gym_world(Gym.LEFT_DOOR, -40.8)
	checks.gym_floor_levels = is_equal_approx(World.floor_height(aisle.x, aisle.y, GymInterior.FLOOR), GymInterior.FLOOR) \
		and is_equal_approx(World.floor_height(aisle.x, aisle.y, GymInterior.DECK), GymInterior.DECK) \
		and is_equal_approx(World.floor_height(aisle.x, aisle.y), GymInterior.FLOOR) \
		and not World.blocked(back_door.x, back_door.y) and is_equal_approx(World.floor_height(back_door.x, back_door.y), GymInterior.FLOOR)
	# Up the stair on the right of the entry corridor (as in the photo), away from the
	# door to the stand's aisle by the court rail (no falling off).
	var foot := _gym_world(83.0, -1.0)
	student.place(foot.x, foot.y)
	_walk(Vector2(1, 0), 160)
	inside = Gym.gym_local(student.position.x, student.position.z)
	checks.gym_stairs_to_stand = is_equal_approx(student.level(), GymInterior.DECK) and inside.y < -10.5
	# Along the aisle, then up the rows (one run between the stairs) to the top.
	_walk(Vector2(0, 1), 30)
	_walk(Vector2(-1, 0), 120)
	checks.gym_bleacher_rows = student.level() > GymInterior.DECK + 3.9 \
		and not is_nan(GymInterior.deck_at(90.0, -5.0)) and not is_nan(GymInterior.deck_at(100.0, -35.0))
	# Up there the camera closes in to the low side view, facing the stand (west).
	for i in 90:
		_glide_zoom()
		_update_camera(1.0 / 30.0)
	_update_cutaways(0.0, true)
	var pitch := rad_to_deg(asin(camera.global_basis.z.y))
	checks.gym_side_view_on_stands = perch > 0.95 and absf(pitch - PERCH_PITCH) < 1.5 and is_equal_approx(target_width, PERCH_WIDTH) \
		and (-camera.global_basis.z).dot(Vector3.LEFT) > 0.75
	var stand_cut := _cut_alpha("WestStands") == 1.0 and _cut_alpha("EastStands") == 0.0
	# Down the east stand's north stair, away from the court to the back doorway's passage.
	var top := _gym_world(83.0, -31.0)
	student.place(top.x, top.y, GymInterior.DECK)
	_walk(Vector2(1, 0), 100)
	inside = Gym.gym_local(student.position.x, student.position.z)
	checks.gym_east_stair = is_equal_approx(student.level(), GymInterior.FLOOR) and inside.y < -39.4
	# The camera faces the student's own half: the east stand from the west half's side
	# of the hall when in the east half (L), the west stand when in the west half (R).
	var east_half := _gym_world(100.5, -26.0)
	student.place(east_half.x, east_half.y)
	_snap_follow()
	_update_camera(1.0)
	var faces_east := (-camera.global_basis.z).dot(Vector3.RIGHT) > 0.9
	var west_half := _gym_world(100.5, -15.0)
	student.place(west_half.x, west_half.y)
	_snap_follow()
	_update_camera(1.0)
	checks.gym_faces_sides = faces_east and (-camera.global_basis.z).dot(Vector3.LEFT) > 0.9
	# The cutaway: what stands between the camera and the student goes, by side.
	checks.gym_cutaway = stand_cut and GymInterior.hidden("WestWalls", 90.0, -6.0, GymInterior.FLOOR, "R") \
		and not GymInterior.hidden("WestStands", 90.0, -6.0, GymInterior.FLOOR, "R") \
		and GymInterior.hidden("WestStands", 100.0, -25.0, GymInterior.FLOOR, "L") \
		and GymInterior.hidden("FrontWall", 100.0, -25.0, GymInterior.FLOOR, "L") \
		and not GymInterior.hidden("FrontWall", 100.0, -15.0, GymInterior.FLOOR, "R") \
		and GymInterior.hidden("BackWall", 100.0, -15.0, GymInterior.FLOOR, "R") \
		and GymInterior.hidden("Ceiling5W", 100.0, -25.0, GymInterior.FLOOR, "L") \
		and not GymInterior.hidden("Ceiling5E", 100.0, -25.0, GymInterior.FLOOR, "L") \
		and GymInterior.hidden("Ceiling2W", 100.0, -20.5, GymInterior.FLOOR, "F") \
		and not GymInterior.hidden("Ceiling10E", 100.0, -20.5, GymInterior.FLOOR, "F") \
		and not GymInterior.hidden("Roof", 60.0, 5.0, 0.0, "F")
	# Up the long stair along the west side wall onto the stage; the stage front curves.
	var steps := _gym_world(127.0, -11.8)
	student.place(steps.x, steps.y)
	_snap_follow()
	_walk(Vector2(0, 1), 60)
	var middle_front := GymInterior.stage_front(GymInterior.SIDE_DOOR)
	checks.gym_stage_reachable = is_equal_approx(student.level(), GymInterior.STAGE_TOP) \
		and middle_front < GymInterior.stage_front(-13.0) and is_equal_approx(GymInterior.stage_front(-11.2), GymInterior.STAGE_CORNER) \
		and GymInterior.end_wall(-0.4) < GymInterior.end_wall(-8.0) and is_equal_approx(GymInterior.end_wall(GymInterior.WEST), GymInterior.STAGE_CORNER)
	for i in 90:
		_glide_zoom()
		_update_camera(1.0 / 30.0)
	pitch = rad_to_deg(asin(camera.global_basis.z.y))
	checks.gym_side_view_on_stage = perch > 0.95 and absf(pitch - PERCH_PITCH) < 1.5 \
		and (-camera.global_basis.z).dot(Vector3.BACK) > 0.75 \
		and _all_visible([student.position.x], [student.position.y, student.position.y + 1.83], [student.position.z])
	# From the stage through the west door, down into the backstage room.
	var wing := _gym_world(137.0, -12.0)
	student.place(wing.x, wing.y, GymInterior.STAGE_TOP)
	_walk(Vector2(-1, 0), 40)
	inside = Gym.gym_local(student.position.x, student.position.z)
	checks.gym_backstage = is_equal_approx(student.level(), GymInterior.FLOOR) and inside.y > -8.6
	# From the lane up the side entrance's steps under the balcony.
	student.place(78.5, 64.0)
	_snap_follow()
	_walk(Vector2(0, 1), 60)
	checks.gym_side_entrance = Gym.inside(student.position.x, student.position.z) \
		and is_equal_approx(student.level(), GymInterior.FLOOR) and arena > 0.9 and gable < 0.1
	# Key 0: centre court, the low view facing the stage.
	_choose_framing(9)
	_set_zoom(ARENA_WIDTH, true)
	_update_camera(1.0)
	var forward := -camera.global_basis.z
	checks.gym_inside_view = arena > 0.99 and forward.dot(Vector3.BACK) > 0.75 \
		and absf(rad_to_deg(asin(-forward.y)) - ARENA_PITCH) < 1.5 \
		and _all_visible([student.position.x], [student.position.y, student.position.y + 1.83], [student.position.z])

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
			var turn := -PI / 2.0 * _turns()
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
		checks.gym_built = gym_node != null and gym_node.find_child("HOLY ANGEL UNIVERSITY", true, false) != null \
			and gym_node.find_child("GYM", true, false) != null and not Plots.shapes().has("gym")
		checks.gym_faces_road = gym_node != null and (gym_node.global_basis * Vector3.BACK).dot(Vector3.LEFT) > 0.99
		checks.gym_real_size = is_equal_approx(Gym.DEPTH, 41.0) and is_equal_approx(Gym.SOUTH - Gym.NORTH, 69.5)
		# Its walls are solid (front, back, north gable) away from the doorways.
		checks.gym_solid = World.blocked(58.2, 86.0) and World.blocked(98.8, 130.0) and World.blocked(63.0, 67.0)
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
		_gym_inside_checks(checks, gym_node)
		# St. Joseph Hall: built on its plot, solid, its walkway, parking and south road walkable.
		var sjh_node := scene.find_child("SJH", false, false) as Node3D
		checks.sjh_built = sjh_node != null and sjh_node.find_child("*JOSEPH HALL", false, false) != null \
			and not Plots.shapes().has("sjh")
		checks.sjh_faces_north = sjh_node != null and (sjh_node.global_basis * Vector3.BACK).dot(Vector3.FORWARD) > 0.99
		var deep := Sjh.world(20.0, -10.0)
		var walk := Sjh.world(25.0, -1.8)
		checks.sjh_solid = World.blocked(deep.x, deep.y) and World.blocked(Sjh.MARY.x, Sjh.MARY.y)
		checks.sjh_walkway_and_parking = not World.blocked(walk.x, walk.y) \
			and is_equal_approx(World.floor_height(walk.x, walk.y), Sjh.WALK_Y) and not World.blocked(-11.0, 109.0) \
			and is_equal_approx(World.floor_height(-11.0, 109.0), -0.19) and Sjh.on_parking(-30.0, 99.0)
		_choose_framing(8)
		_set_zoom(64.0, true)
		_update_camera(1.0)
		checks.sjh_view_faces_front = sjh > 0.99 and (-camera.global_basis.z).dot(Vector3.BACK) > 0.95 \
			and _all_visible([Sjh.world(0, 1).x], [0.0, 20.0], [Sjh.world(0, 1).y])
		# Walking into SJH's covered walkway through a railing gap: the cutaway again.
		var sjh_gap := Sjh.world(20.0, 2.5)
		student.place(sjh_gap.x, sjh_gap.y)
		_set_zoom(36.0, true)
		_snap_follow()
		for i in 120:
			var turn := -PI / 2.0 * _turns()
			var away := Vector2(-sin(turn), -cos(turn))
			student.move(away, false, 1.0 / 30.0, 0.0)
			_update_camera(1.0 / 30.0)
		var inside_local := Sjh.local(student.position.x, student.position.z)
		checks.walk_into_sjh_walkway = inside_local.y < -1.0 and walkway > 0.95 and shown_width < HALL_WIDTH + 0.2 \
			and camera.near > 5.0 and _all_visible([student.position.x], [0.3, 1.9], [student.position.z])
		# MGN: built on its plot facing the west road, solid, its garden planted, the entry
		# walk under the wing open up to the turnstile, the road beside it walkable.
		var mgn_node := scene.find_child("MGN", false, false) as Node3D
		checks.mgn_built = mgn_node != null and mgn_node.find_child("MGN 09", false, false) != null and not Plots.shapes().has("mgn")
		checks.mgn_faces_road = mgn_node != null and (mgn_node.global_basis * Vector3.BACK).dot(Vector3.RIGHT) > 0.99
		var mgn_solid := true
		for spot in [Vector2(0, -8), Vector2(35, -10), Vector2(-24, -10), Vector2(-24, 4), Vector2(12, -1.5), Vector2(0, 2.0)]:
			var p := Mgn.world(spot.x, spot.y)
			mgn_solid = mgn_solid and World.blocked(p.x, p.y)
		checks.mgn_solid_and_garden = mgn_solid
		var porch := Mgn.world(21.0, 2.5)
		var turnstile := Mgn.world(21.0, 0.4)
		var column := Mgn.world(Mgn.PORCH_COLUMNS[0], Mgn.COLUMN_Z)
		var stair := Mgn.world(27.0, 2.0)
		checks.mgn_entry_to_turnstile = not World.blocked(porch.x, porch.y) and is_equal_approx(World.floor_height(porch.x, porch.y), Mgn.FLOOR_Y) \
			and World.blocked(turnstile.x, turnstile.y) and World.blocked(column.x, column.y) and World.blocked(stair.x, stair.y)
		var west_road := true
		for z in range(70, 102, 4):
			west_road = west_road and not World.blocked(-58.5, z) and not World.blocked(-63.0, z)
		checks.west_road_beside_mgn = west_road
		# Walking in from the sidewalk under the wing, up to the turnstile.
		var sidewalk := Mgn.world(21.0, 5.6)
		student.place(sidewalk.x, sidewalk.y)
		for i in 90:
			student.move(Vector2(-1, 0), false, 1.0 / 30.0, 0.0)
		var walked_in := Mgn.local(student.position.x, student.position.z)
		checks.mgn_walk_in = walked_in.y < 1.2 and walked_in.y > Mgn.TURNSTILE_Z and is_equal_approx(student.position.y, Mgn.FLOOR_Y + 0.015)
		# Down the west road from the walkway end: the camera turns right round to face MGN,
		# stands over the lawn (cut away up to the road), never inside a building.
		student.place(-58.5, 58.0)
		_set_zoom(36.0, true)
		_snap_follow()
		for i in 240:
			student.move(Vector2(0, 1), true, 1.0 / 30.0, 0.0)
			_update_camera(1.0 / 30.0)
		var forward := -camera.global_basis.z
		var lawn_cut := (Vector3(Chapel.NOSE.x, 1.0, Chapel.NOSE.y) - camera.position).dot(forward) < camera.near
		checks.walk_past_mgn = student.position.z > 85.0 and mgn > 0.95 and forward.dot(Vector3.LEFT) > 0.9 \
			and camera.position.x > Mgn.CUT_X and camera.near > (Vector3(Mgn.CUT_X, 0, student.position.z) - camera.position).dot(forward) - 1.0
		student.place(MGN_SPOT.x, MGN_SPOT.y)
		_was_perched = false # left over from the gym checks, it would cap the zoom
		_set_zoom(56.0, true)
		_snap_follow()
		_update_camera(1.0)
		forward = -camera.global_basis.z
		var north := Mgn.world(Mgn.WING.y, Mgn.WING_FRONT)
		var south := Mgn.world(-Mgn.LONG, 0.0)
		checks.mgn_view_faces_front = mgn > 0.99 and forward.dot(Vector3.LEFT) > 0.95 and lawn_cut \
			and _all_visible([north.x, south.x], [0.0, Mgn.ROOF], [north.y, south.y]) \
			and not Mgn.inside(Mgn.local(camera.position.x, camera.position.z).x, Mgn.local(camera.position.x, camera.position.z).y)
		_set_zoom(MIN_WIDTH, true)
		_update_camera(1.0)
		checks.mgn_close_shows_student = _all_visible([student.position.x], [student.position.y, student.position.y + 1.83], [student.position.z])
		# The middle road: walkable from the west road to the flagpole, both carriageways,
		# both covered walkways and the crossings; the strips, median, pillars and island solid.
		var lanes := true
		for x in range(-64, -168, -8):
			lanes = lanes and not World.blocked(x, 60.4) and not World.blocked(x, 66.6) \
				and is_equal_approx(World.floor_height(x, 60.4), -0.19) and is_equal_approx(World.floor_height(x, 66.6), -0.19)
		checks.middle_road_walkable = lanes and not World.blocked(-90.0, 53.0) and not World.blocked(-90.0, 73.5) \
			and not World.blocked(-105.5, 56.6) and not World.blocked(-105.5, 63.5) and not World.blocked(-170.5, 60.0) \
			and is_equal_approx(World.floor_height(-90.0, 53.0), -0.04) and is_equal_approx(World.floor_height(-105.5, 63.5), -0.04)
		var pillar: Vector2 = MiddleRoad.pillars()[0]
		checks.middle_road_solid = World.blocked(-90.0, 63.5) and World.blocked(-90.0, 56.6) and World.blocked(-90.0, 70.3) \
			and World.blocked(pillar.x, pillar.y) and World.blocked(MiddleRoad.FLAG.x, MiddleRoad.FLAG.y) and World.blocked(-90.0, 77.0)
		checks.middle_road_kerbs = is_equal_approx(World.floor_height(-90.0, MiddleRoad.LANE_N.x), 0.0) \
			and is_equal_approx(World.floor_height(-90.0, MiddleRoad.MEDIAN.y), 0.0)
		# The west road's sidewalk and kerb open across the mouth, and stay either side of it.
		checks.west_road_opening = Roads.opened(Vector2(-62.0, 63.5)) and is_equal_approx(World.floor_height(-62.0, 63.5), -0.19) \
			and not Roads.opened(Vector2(-62.0, 54.0)) and is_equal_approx(World.floor_height(-62.0, 54.0), 0.0)
		# Walking in off the west road: the camera turns to face south across the road, the
		# PGN side behind the student is cut away, and the student stays in view.
		student.place(-60.0, 60.4)
		_set_zoom(36.0, true)
		_snap_follow()
		for i in 240:
			student.move(Vector2(-1, 0), true, 1.0 / 30.0, 0.0)
			_update_camera(1.0 / 30.0)
		forward = -camera.global_basis.z
		_update_cutaways(1.0, true)
		checks.walk_down_middle_road = student.position.x < -75.0 and middle > 0.95 and mgn < 0.05 and chapel < 0.05 \
			and forward.dot(Vector3.BACK) > 0.95 and _cut_alpha(MiddleRoad.NORTH_GROUP) < 0.05 \
			and _all_visible([student.position.x], [student.position.y, student.position.y + 1.83], [student.position.z])
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
		# NPCs: all spawned on walkable ground, the strollers stroll without walking
		# into anything, and talking opens the bubble and walking away closes it.
		checks.npcs_spawned = npcs.cast.size() == Npcs.CAST.size()
		checks.npcs_on_walkable_ground = npcs.cast.all(func(n: Node3D) -> bool: return not World.blocked(n.position.x, n.position.z))
		for i in 900:
			npcs.update(1.0 / 30.0)
		checks.npcs_wander = npcs.cast.filter(func(n: Node3D) -> bool: return n.roam > 0.0).all(func(n: Node3D) -> bool: return n.walked > 0.5) \
			and npcs.cast.all(func(n: Node3D) -> bool: return not World.blocked(n.position.x, n.position.z) and n.ground().distance_to(n.home) <= n.roam + 0.6)
		var guard: Node3D = npcs.cast.filter(func(n: Node3D) -> bool: return n.id == "kuya-ben")[0]
		student.place(guard.position.x + 0.9, guard.position.z)
		var talked: bool = npcs.interact() and npcs.bubble.visible and npcs.bubble_text.text == guard.lines[0] and guard.talking
		npcs.update(1.0 / 30.0)
		talked = talked and guard.animation == "talk"
		npcs.interact()
		talked = talked and npcs.bubble_text.text == guard.lines[1]
		student.place(guard.position.x + 6.0, guard.position.z + 1.5)
		npcs.update(1.0 / 30.0)
		checks.npc_talks = talked and not npcs.bubble.visible and not guard.talking
		# Fast travel (dev): every place is walkable and the jump lands there, framed.
		var travelled := travel.panel.get_child(0).get_child(1).get_child_count() == travel_places().size()
		for i in travel_places().size():
			var place: Array = travel_places()[i]
			_travel_to(i)
			var spot: Vector2 = place[1]
			travelled = travelled and Vector2(student.position.x, student.position.z).distance_to(spot) < 0.01 \
				and is_equal_approx(target_width, place[2])
		checks.fast_travel = travelled
		student.position = saved
		_snap_follow()
		_set_zoom(float(_args.get("zoom", "112")), true)
		_update_camera(1.0)
		_update_cutaways(0.0, true)
	var okay := not checks.values().has(false)
	print(JSON.stringify({"scene": "APS 2.5D", "checks": checks, "checks_pass": okay, "boxes": world.box_count,
		"nodes": scene.get_child_count(), "viewport": [viewport.size.x, viewport.size.y], "pixel_scale": pixel_scale,
		"renderer": RenderingServer.get_current_rendering_method()}))
	if _args.has("capture"):
		# --talk: open a conversation with whoever is in reach, to review the bubble
		if _args.has("talk") and npcs.interact():
			npcs.update(1.0 / 60.0)
			await get_tree().process_frame
			npcs.update(1.0 / 60.0)
		await RenderingServer.frame_post_draw
		var path: String = _args["capture"]
		var image := viewport.get_texture().get_image() if _args.has("raw") else get_viewport().get_texture().get_image()
		var result := image.save_png(path)
		print("Capture: ", path, " result=", result)
		okay = okay and result == OK
	get_tree().quit(0 if okay else 1)
