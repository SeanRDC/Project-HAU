extends Node
## APS in Godot: the full browser frontage (wing, canopy, tall block, stair
## tower, canteen) with spatial lighting and an adaptive pixel resolution that
## stays crisp from the entrance close-up out to the whole street.

const World := preload("res://world.gd")
const Student := preload("res://student.gd")
const Sound := preload("res://audio.gd")
const Chapel := preload("res://areas/chapel.gd")
const ChapelSouth := preload("res://areas/chapel_south.gd")
const Roads := preload("res://roads.gd")
const CampusPlan := preload("res://campus_plan.gd")
const Plots := preload("res://areas/plots.gd")
const Gym := preload("res://areas/gym.gd")
const GymInterior := preload("res://areas/gym_interior.gd")
const Npcs := preload("res://npcs.gd")
const Critters := preload("res://critters.gd")
const Atmosphere := preload("res://atmosphere.gd")
const Hallway := preload("res://areas/hallway.gd")
const Sjh := preload("res://areas/sjh.gd")
const Mgn := preload("res://areas/mgn.gd")
const MiddleRoad := preload("res://areas/middle_road.gd")
const StudentCenter := preload("res://areas/student_center.gd")
const Pgn := preload("res://areas/pgn.gd")
const Formation := preload("res://areas/formation.gd")
const Aero := preload("res://areas/aero.gd")
const CoveredCourt := preload("res://areas/court.gd")
const BesideAps := preload("res://areas/beside_aps.gd")
const SacredHeart := preload("res://areas/sh.gd")
const DevTravel := preload("res://dev_travel.gd")
const DevFreeCam := preload("res://dev_free_cam.gd")
const Opening := preload("res://opening.gd")
## Inside the hallway the view closes in to this width, framed on the corridor.
const HALL_WIDTH := 8.5
const HOURS: Array[float] = [5.75, 8.0, 12.0, 16.5, 17.75, 18.5, 21.0]
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
const MGN_SPOT := Vector2(-60.5, 96.8)
## Where --view=middle brings the student: the boulevard's south open walk, facing the Main
## Building's side; and (--view=middle-north) the north walk, facing PGN's.
const MIDDLE_SPOT := Vector2(-80.0, 72.0)
const MIDDLE_NORTH_SPOT := Vector2(-80.0, 57.2)
## Where --view=student-center brings the student: the arcade, by Cafe Juan's door.
const STUDENT_CENTER_SPOT := Vector2(-121.0, 83.4)
## Where --view=formation brings the student: the Formation Center's drop-off, by its steps.
const FORMATION_SPOT := Vector2(28.0, 58.0)
const MAX_WIDTH := 140.0
## On the boulevard the camera looks down at least this steeply, so the hedge along the
## lane does not hide the red-paver walk (or the student's legs) behind it.
const MIDDLE_PITCH := 16.0
## Facing south on the boulevard, the camera cuts away everything north of this z (the
## APS wing and the corner garden, which would stand in front at the mouth); PGN's side of
## the road fades instead (MiddleRoad.NORTH_GROUP), so the ground up to the plot stays.
## Facing north it cuts everything south of the Main Building's face (MGN, the plots).
const MIDDLE_CUT_Z := 50.4
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
var critters: Critters
var atmosphere: Atmosphere
## E was just used to talk, so holding it does not also turn the camera.
var _e_talk := false
var help: Control
## The F1 fast-travel panel (a dev tool).
var travel: DevTravel
## The F2 free cam (a dev tool).
var free_cam: DevFreeCam
var time_label: Label
var view_label: Label

var hour := 16.5
## The time preset's sun offset, as seen from the APS front view; _aim_sun() turns it
## with the camera so every view's face gets the light the APS front gets.
var _sun_offset := Vector3(-55, 44, 60)
var _sun_turn := INF
var orbit := 0.12
## Where the player has turned the camera to (Q/E, right-drag); `orbit` eases after it, so
## the turn glides rather than stepping with each mouse event.
var orbit_goal := 0.12
## The camera turns ORBIT_MAX either way (Q/E, right-drag): the range every view's cuts
## and cutaways were made for. (±45° was tried; turned that far the views broke down.)
const ORBIT_MAX := 0.25
## Holding the right mouse button and dragging turns the angle, like Q/E (radians per pixel).
const DRAG_TURN := 0.0015
var _dragging := false
var _drag_from := Vector2.ZERO
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
## The Student Center's daylight fill, on while the student is under its roof.
var _arcade_lights: Node3D
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
## 0..1: how far it has turned to look west at PGN's east face from the west road beside it
## (a quarter turn back from north, not three on: from APS's road it turns the short way).
var pgn_east := 0.0
## 0..1: how far the camera faces the Formation Center (west, from over the east road).
var formation := 0.0
## 0..1: how far the camera faces east down the Covered Court (on its floor).
var court := 0.0
## 0..1: how far the student is on the walk along the chapel's south side (the camera,
## facing north at the chapel, cuts away the parking and SJH behind it).
var south_walk := 0.0
## 0..1: how far the camera has turned to look south across the boulevard at the Main
## Building's side; middle_north, how far it looks north at PGN's (its turn is 0, like APS's).
## Which one is on follows the side of the centre line the student is on.
var middle := 0.0
var middle_north := 0.0
## 0..1: how far the student is under one of the boulevard's covered walkways (the cutaway).
var covered := 0.0
## 0..1: how far the student is under the Student Center's roof (the same cutaway).
var arcade := 0.0
## The controls keep the boulevard side they started on while a direction is held, so
## walking across the road does not turn round with the camera halfway (see _control_turns).
var _control_direction := Vector2.ZERO
var _control_south := 0.0
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
	Atmosphere.add_wind()
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
	free_cam = DevFreeCam.new()
	free_cam.camera = camera
	add_child(free_cam)
	if _args.has("travel"):
		travel.toggle.call_deferred() # --travel opens the panel, for captures
	if _args.has("free-cam"):
		_look_freely.call_deferred(str(_args["free-cam"])) # --free-cam=<yaw>,<pitch>: a free cam capture
	npcs = Npcs.new()
	npcs.camera = camera
	npcs.student = student
	npcs.to_screen = _to_screen
	npcs.sound = sound
	scene.add_child(npcs)
	npcs.build_ui(self)
	critters = Critters.new()
	critters.camera = camera
	critters.student = student
	critters.to_screen = _to_screen
	critters.sound = sound
	scene.add_child(critters)
	critters.build_ui(self)
	# weather and atmosphere: rain, falling leaves, light shafts
	atmosphere = Atmosphere.new()
	atmosphere.world = world
	atmosphere.camera = camera
	atmosphere.sun = sun
	atmosphere.environment = environment
	atmosphere.sky = sky_material
	atmosphere.sound = sound
	scene.add_child(atmosphere)
	atmosphere.build()
	if _args.has("rain"):
		atmosphere.start_raining() # --rain starts in a shower, for captures
	if Atmosphere.WEATHER.has(_args.get("weather", "")):
		atmosphere.auto_weather = false # --weather=clear|overcast|rain|storm|fog|windy, for captures
		atmosphere.set_weather(_args["weather"], true)

	var views := {"canteen": [CANTEEN_SPOT, 28.0], "gym": [GYM_SPOT, 84.0], "gym-side": [GYM_SIDE_SPOT, 44.0],
		"gym-in": [GYM_IN_SPOT, ARENA_WIDTH], "sjh": [SJH_SPOT, 64.0], "sjh-rear": [Sjh.world(0.0, Sjh.BACK - 7.0), 40.0], "mgn": [MGN_SPOT, 56.0], "middle": [MIDDLE_SPOT, 40.0],
		"middle-north": [MIDDLE_NORTH_SPOT, 40.0], "fountain": [Vector2(-159.0, 61.0), 40.0],
		"student-center": [STUDENT_CENTER_SPOT, 22.0], "formation": [FORMATION_SPOT, 40.0], "sjh-walkway": [Sjh.world(25.0, -1.8), 22.0],
		"sjh-lobby": [Sjh.world(0.0, -1.5), 22.0], "sjh-west": [Sjh.world(48.6, -0.8), 22.0],
		"sjh-steps": [Sjh.world(6.0, 4.0), 30.0]}
	var start: Array = views.get(_args.get("view", ""), [Vector2(0.7, 5.3), 112.0])
	var spot: Vector2 = start[0]
	hour = float(_args.get("hour", "16.5"))
	if not HOURS.has(hour):
		hour = 16.5
	pixel_mode = _args.get("pixel", "auto") if PIXEL_MODES.has(_args.get("pixel", "auto")) else "auto"
	orbit = clampf(float(_args.get("angle", "0.12")), -ORBIT_MAX, ORBIT_MAX)
	orbit_goal = orbit
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
	elif Opening.wanted(_args):
		_play_opening()

## The opening plays over the game, which waits paused behind it (the music keeps playing).
func _play_opening() -> void:
	var opening := Opening.new()
	opening.sound = sound
	opening.args = _args
	add_child(opening)
	get_tree().paused = true
	sound.process_mode = Node.PROCESS_MODE_ALWAYS
	opening.finished.connect(func() -> void:
		get_tree().paused = false
		sound.process_mode = Node.PROCESS_MODE_INHERIT
		opening.queue_free())

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
	if pixel_mode == "crisp" or (free_cam and free_cam.active and pixel_mode == "auto"):
		return 1 # the free cam's perspective has no one framing width to match
	if pixel_mode == "pixel":
		return maxi(1, roundi(window.y / 360.0))
	var ideal := window.y / view_metres.y / SPRITE_DENSITY
	# Hysteresis keeps the scale from flickering while zooming across a boundary.
	if pixel_scale > 0 and absf(ideal - pixel_scale) < 0.65:
		return pixel_scale
	return clampi(roundi(ideal), 1, 8)

func _resize() -> void:
	shown_width = lerpf(width, minf(width, HALL_WIDTH), smoothstep(0.0, 1.0, clampf(hall + walkway + covered + arcade, 0.0, 1.0)))
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
	return smoothstep(38.0, 46.0, z) * smoothstep(34.0, 38.0, x) * (1.0 - Sjh.view_for(x, z)) * (1.0 - Formation.view_for(x, z)) \
			* (1.0 - Sjh.rear_for(x, z)) * (1.0 - CoveredCourt.view_for(x, z))

## The further turn to face the gym's north gable, once past its north-west corner into
## the lane; it hands over to the hall view in the side entrance.
static func gable_for(x: float, z: float) -> float:
	return smoothstep(Gym.FRONT_X, Gym.FRONT_X + 4.0, x) * (1.0 - _side_door_for(z)) * (1.0 - CoveredCourt.view_for(x, z)) 		* smoothstep(38.0, 46.0, z) # only on the gym's side, not north of the court (Sacred Heart)

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
		* (1.0 - MiddleRoad.view_for(x, z)) * (1.0 - Pgn.lane_for(x, z)) * (1.0 - Pgn.east_for(x, z)) * (1.0 - Sjh.rear_for(x, z))

## The MGN view (facing west from the west road) yields to the middle road's.
static func mgn_for(x: float, z: float) -> float:
	return Mgn.view_for(x, z) * (1.0 - MiddleRoad.view_for(x, z)) * (1.0 - Sjh.rear_for(x, z))

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
	pgn_east = Pgn.east_for(student.position.x, student.position.z)
	formation = Formation.view_for(student.position.x, student.position.z)
	court = CoveredCourt.view_for(student.position.x, student.position.z)
	south_walk = ChapelSouth.view_for(student.position.x, student.position.z)
	var on_middle := MiddleRoad.view_for(student.position.x, student.position.z)
	middle = on_middle * MiddleRoad.south_for(student.position.z)
	middle_north = on_middle - middle
	walkway = Sjh.walkway_for(student.position.x, student.position.z)
	covered = MiddleRoad.covered_for(student.position.x, student.position.z)
	arcade = StudentCenter.covered_for(student.position.x, student.position.z)

## The camera's turn about the vertical: 0 looks north at APS, -90° east at the
## canteen or the chapel (their views never overlap: one is east of x 12, one west of -18),
## -180° south at the gym's gable from the lane or down its hall from inside, and
## -180° south at St. Joseph Hall (it takes over from the chapel and gym views), and
## -270° west at MGN from the west road (it takes over from the chapel view; at the
## corner it hands a quarter turn on to SJH's), and on the boulevard -180° south at the
## Main Building's side or 0° north at PGN's (crossing the median it glides round through east).
func _yaw() -> float:
	return orbit - PI / 2.0 * _turns()

## The camera's turn in quarter turns (SJH's and the boulevard's south half turns count
## two, MGN's three; the boulevard's north view adds none); the controls use it too.
func _turns() -> float:
	return leg + chapel + gym + gable + arena * face + 2.0 * sjh + 3.0 * mgn + 2.0 * middle - pgn_east + 3.0 * formation + court

## The turn the controls use: the camera's, except that on the boulevard the side it faces
## stays the one it faced when the current direction was pressed, until it is let go or
## changed. Holding S from PGN's side then walks straight across to the Main Building's,
## although the camera turns round to face that side on the way.
func _control_turns(direction: Vector2) -> float:
	var on_middle := middle + middle_north
	if direction == Vector2.ZERO or direction != _control_direction or on_middle < 0.01:
		_control_south = middle / on_middle if on_middle > 0.01 else 0.0
	_control_direction = direction
	return _turns() - 2.0 * middle + 2.0 * on_middle * _control_south

func _update_camera(delta: float) -> void:
	var was_inside := hall + walkway + covered + arcade
	hall = lerpf(hall, Hallway.hall_for(student.position.x, student.position.z), 1.0 - exp(-delta * 3.5))
	walkway = lerpf(walkway, Sjh.walkway_for(student.position.x, student.position.z), 1.0 - exp(-delta * 3.5))
	covered = lerpf(covered, MiddleRoad.covered_for(student.position.x, student.position.z), 1.0 - exp(-delta * 3.5))
	arcade = lerpf(arcade, StudentCenter.covered_for(student.position.x, student.position.z), 1.0 - exp(-delta * 3.5))
	if absf(hall + walkway + covered + arcade - was_inside) > 0.0005 or absf(width - target_width) > 0.001:
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
	pgn_east = lerpf(pgn_east, Pgn.east_for(student.position.x, student.position.z), 1.0 - exp(-delta * 3.0))
	formation = lerpf(formation, Formation.view_for(student.position.x, student.position.z), 1.0 - exp(-delta * 3.0))
	court = lerpf(court, CoveredCourt.view_for(student.position.x, student.position.z), 1.0 - exp(-delta * 3.0))
	south_walk = lerpf(south_walk, ChapelSouth.view_for(student.position.x, student.position.z), 1.0 - exp(-delta * 3.0))
	var on_middle := MiddleRoad.view_for(student.position.x, student.position.z)
	var south := on_middle * MiddleRoad.south_for(student.position.z)
	middle = lerpf(middle, south, 1.0 - exp(-delta * 3.0))
	middle_north = lerpf(middle_north, on_middle - south, 1.0 - exp(-delta * 3.0))
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
	lift = lerpf(lift, maxf(lift, distance * tan(deg_to_rad(MIDDLE_PITCH))), clampf(middle + middle_north, 0.0, 1.0))
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
	# Facing across the boulevard at the student's side it slides along it with them; wide,
	# it frames that side's walks and covered walkway.
	var middle_x := roundf(follow.x / pixel) * pixel
	var middle_z := lerpf(lerpf(follow.y, MiddleRoad.LANE_S.x + 1.0, wide), MiddleRoad.WALK_S.x, campus)
	var middle_focus := Vector3(middle_x, lerpf(target_y, target_y + 2.0, wide), roundf(middle_z / pixel) * pixel)
	var north_z := lerpf(lerpf(follow.y, MiddleRoad.LANE_N.y - 1.0, wide), MiddleRoad.WALK_N.y, campus)
	var north_focus := Vector3(middle_x, lerpf(target_y, target_y + 2.0, wide), roundf(north_z / pixel) * pixel)
	# Facing PGN's east face it frames that face (sliding along it); close up, the student's
	# own depth on the road.
	var pgn_focus := Vector3(lerpf(Pgn.EAST, follow.x, close), lerpf(target_y, target_y + 3.0, wide), roundf(follow.y / pixel) * pixel)
	# Facing the Formation Center it frames the front (sliding along it); wide, it centres on
	# the building; close up it frames the student's own depth on the drop-off.
	var formation_z := lerpf(lerpf(follow.y, 56.5, wide), 56.5, campus)
	var formation_focus := Vector3(lerpf(Formation.FRONT_X, follow.x, close), lerpf(target_y, target_y + 3.0, wide), roundf(formation_z / pixel) * pixel)
	# Down the Covered Court it frames the student's own depth across it.
	var court_focus := Vector3(roundf(follow.x / pixel) * pixel, target_y, roundf(follow.y / pixel) * pixel)
	var focus := Vector3(front, target_y, depth) * (1.0 - leg - chapel - gym - sjh - mgn - middle - middle_north - pgn_east - formation - court)
	focus += Vector3(CANTEEN_FACE_X, target_y, side) * leg + Vector3(reach, target_y, aisle) * chapel + gym_focus * gym
	focus += sjh_focus * sjh + mgn_focus * mgn + middle_focus * middle + north_focus * middle_north + pgn_focus * pgn_east + formation_focus * formation + court_focus * court
	# Every framing, the wide ones too, keeps the student in the middle across the screen:
	# the focus slides sideways onto them and keeps the depth its view frames.
	var yaw := _yaw()
	var across := Vector2(cos(yaw), -sin(yaw))
	var flat := Vector2(focus.x, focus.z)
	flat += across * (roundf(follow.dot(across) / pixel) * pixel - flat.dot(across))
	focus.x = flat.x
	focus.z = flat.y
	# Inside a covered corridor (the APS hallway, SJH's walkway, the boulevard's covered
	# walkways, the Student Center): glide in close and look a little down along it. Each
	# gives the corridor's middle, how far in front of it the cut goes, and its ceiling.
	var inside_weight := clampf(hall + walkway + covered + arcade, 0.0, 1.0)
	var inside := smoothstep(0.0, 1.0, inside_weight)
	var corridor := Vector3(roundf(follow.x / pixel) * pixel, 1.35, -1.9)
	var cut_offset := Hallway.CUT_Z + 1.9
	var ceiling := Hallway.CEILING
	var band_back := 0.4
	if walkway > hall:
		var middle := Sjh.world(Sjh.local(follow.x, follow.y).x, Sjh.WALL_Z / 2.0)
		corridor = Vector3(middle.x, Sjh.WALK_Y + 1.35, middle.y)
		cut_offset = Sjh.CUT_OFFSET + Sjh.WALL_Z / 2.0 + 1.8
		ceiling = Sjh.CEILING
	if covered + arcade > maxf(hall, walkway):
		# Through an opening from the boulevard's south walkway into the Student Center the
		# two blend by their weights, so the corridor glides across rather than jumping.
		var share := arcade / (covered + arcade)
		var walk_z := lerpf(MiddleRoad.covered_middle(follow.y), StudentCenter.MIDDLE, share)
		corridor = Vector3(roundf(follow.x / pixel) * pixel, lerpf(MiddleRoad.WALK_Y, StudentCenter.FLOOR_Y, share) + 1.35, walk_z)
		cut_offset = lerpf(MiddleRoad.CUT_OFFSET, StudentCenter.CUT_OFFSET, share)
		ceiling = lerpf(MiddleRoad.CEILING, StudentCenter.CEILING, share)
		band_back = lerpf(band_back, StudentCenter.BAND_BACK, share)
	focus = focus.lerp(corridor, inside)
	distance = lerpf(distance, 20.0, inside)
	lift = lerpf(lift, 5.0, inside)
	var toward := Vector3(sin(yaw), 0.0, cos(yaw))
	camera.position = focus + Vector3(sin(yaw) * distance, lift, cos(yaw) * distance)
	camera.look_at(focus)
	# The cutaway: the near plane sweeps in from the camera to just behind the front
	# piers or railing, so the road, the lawn and the piers fall away and the corridor stays.
	var forward := -camera.global_basis.z
	var cut := corridor + toward * absf(cut_offset)
	var cut_depth := (Vector3(cut.x, focus.y, cut.z) - camera.position).dot(forward)
	camera.near = maxf(0.1, cut_depth * inside)
	var inside_near := camera.near
	# Facing St. Joseph Hall the camera stands north of the chapel: everything north of
	# the parking (the chapel, its trees) is cut away the same way as it turns round.
	if sjh > 0.0:
		var parking_edge := (Vector3(focus.x, focus.y, Sjh.PARKING.position.y - 0.6) - camera.position).dot(forward)
		camera.near = maxf(camera.near, parking_edge * smoothstep(0.0, 1.0, sjh))
	# On the walk along the chapel's south side, facing north at it, the camera stands over
	# the road and SJH: everything past the road (SJH and its row of cars) is cut away, so
	# the cars nosed in to the grass stay in front, as in the photos. It fades out as the
	# chapel's or the gym's view takes over at either end.
	var facing_north := clampf(1.0 - leg - chapel - gym - sjh - mgn - middle - middle_north - pgn_east - formation - court, 0.0, 1.0)
	if south_walk * facing_north > 0.0:
		# (through the ground line, as the plane leans with the camera: then nothing of the
		# front row's cars stands above it)
		var road_edge := (Vector3(focus.x, 0.0, Sjh.FRONT_ROW.position.y - 0.5) - camera.position).dot(forward)
		camera.near = maxf(camera.near, road_edge * smoothstep(0.0, 1.0, south_walk * facing_north))
	# Behind SJH, facing north at its back, it stands over the perimeter wall and the trees
	# along it: everything past the lane's far kerb is cut away (through the ground line), but
	# never the back itself: turned and pitched, the top corners of the part in frame can
	# stand nearer than the kerb.
	var rear := Sjh.rear_for(follow.x, follow.y) * facing_north
	if rear > 0.0:
		var kerb := Sjh.world(Sjh.local(follow.x, follow.y).x, Sjh.LANE_EDGE)
		var kerb_edge := (Vector3(focus.x, 0.0, kerb.y) - camera.position).dot(forward)
		var rear_along := Sjh.local(focus.x, focus.z).x
		var half := view_metres.x / 2.0 / cos(orbit) + 1.0
		var top := minf(Sjh.ROOF + 0.7, focus.y + view_metres.y)
		for end in [clampf(rear_along - half, -Sjh.HALF, Sjh.HALF), clampf(rear_along + half, -Sjh.HALF, Sjh.HALF)]:
			var corner := Sjh.world(end, Sjh.BACK - 1.0)
			kerb_edge = minf(kerb_edge, (Vector3(corner.x, top, corner.y) - camera.position).dot(forward) - 0.5)
		camera.near = maxf(camera.near, kerb_edge * smoothstep(0.0, 1.0, rear))
	# Facing MGN it stands over the chapel lawn: everything east of the west road (the
	# lawn's trees, the chapel) is cut away.
	if mgn > 0.0:
		var lawn_edge := (Vector3(Mgn.CUT_X, focus.y, focus.z) - camera.position).dot(forward)
		camera.near = maxf(camera.near, lawn_edge * smoothstep(0.0, 1.0, mgn))
	# Facing PGN's east face it stands over the corner garden: everything east of the west
	# road's middle (the bamboo, the chapel lawn's trees) is cut away.
	if pgn_east > 0.0:
		var garden_edge := (Vector3(Pgn.CUT_X, focus.y, focus.z) - camera.position).dot(forward)
		camera.near = maxf(camera.near, garden_edge * smoothstep(0.0, 1.0, pgn_east))

	# Facing the Formation Center it stands over the east road: everything east of it (the
	# Covered Court's plot, the gym) is cut away.
	if formation > 0.0:
		var court_edge := (Vector3(Formation.CUT_X, focus.y, focus.z) - camera.position).dot(forward)
		camera.near = maxf(camera.near, court_edge * smoothstep(0.0, 1.0, formation))

	# Facing the gym's front from beside Aero Hall it would stand inside SJH: everything west
	# of SJH's east face is cut away (only out past the road's end, not on the road).
	if gym > 0.0 and Aero.cut_for(follow.y) > 0.0:
		var sjh_edge := (Vector3(Aero.CUT_X, focus.y, focus.z) - camera.position).dot(forward)
		camera.near = maxf(camera.near, sjh_edge * smoothstep(0.0, 1.0, gym) * Aero.cut_for(follow.y))

	# Facing south at the gym from the lane (or inside it), the camera stands over the
	# Covered Court: its roof and columns, north of the lane, are cut away.
	if forward.z > 0.3 and focus.z > CoveredCourt.CUT_Z and camera.position.z < CoveredCourt.CUT_Z:
		var court_edge := (Vector3(focus.x, focus.y, CoveredCourt.CUT_Z) - camera.position).dot(forward)
		camera.near = maxf(camera.near, court_edge)
	# In Sacred Heart's square and its covered walkway, facing north, the camera stands over
	# the Covered Court: everything south of the fence along it is cut away.
	var square_cut := SacredHeart.court_cut_for(follow.x, follow.y) * facing_north
	if square_cut > 0.0:
		var fence_edge := (Vector3(focus.x, focus.y, SacredHeart.FENCE_Z + 0.3) - camera.position).dot(forward)
		camera.near = maxf(camera.near, fence_edge * smoothstep(0.0, 1.0, square_cut))
	# Facing east down the Covered Court (its roof fades) the camera stands over the parking
	# lane's trees and the pergola: everything west of the court's front (its gable too) is cut away.
	if court > 0.0 and forward.x > 0.3 and camera.position.x < CoveredCourt.SHED.position.x:
		var west_edge := (Vector3(CoveredCourt.SHED.position.x + 0.3, focus.y, focus.z) - camera.position).dot(forward)
		camera.near = maxf(camera.near, west_edge * smoothstep(0.0, 1.0, court))
	# Facing south across the boulevard the camera stands over PGN's plot: everything
	# north of it (the APS wing, the corner garden) is cut away. Facing north it stands
	# over the Main Building and MGN: everything south of their faces is cut away.
	if middle > 0.0:
		var north_edge := (Vector3(focus.x, focus.y, MIDDLE_CUT_Z) - camera.position).dot(forward)
		camera.near = maxf(camera.near, north_edge * smoothstep(0.0, 1.0, middle))
	if middle_north > 0.0:
		# (through the ground line, as the plane leans with the camera: then nothing of MGN
		# stands above it)
		var south_edge := (Vector3(focus.x, 0.0, MiddleRoad.FACE_S - 0.2) - camera.position).dot(forward)
		camera.near = maxf(camera.near, south_edge * smoothstep(0.0, 1.0, middle_north))
	# Every framing keeps the student in the middle top to bottom too: the camera moves
	# straight up or down the screen onto their middle (in whole render pixels; the cuts
	# stay put). Not in a cutaway, which frames its corridor. Zoomed far out it stops where
	# the frame's lower edge would start under the ground (that shows as an empty band, and
	# stepping the camera back to avoid it puts things behind it into the view), so there the
	# student sits a little low.
	var up := camera.global_basis.y
	var middle_of := Vector3(follow.x, student.position.y + 0.9, follow.y)
	var onto := (middle_of - camera.position).dot(up)
	var lowest := (0.5 - camera.position.y + up.y * view_metres.y / 2.0) / up.y
	onto = roundf(maxf(onto, lowest) / pixel) * pixel * (1.0 - inside)
	camera.position += up * onto
	# Those cuts take the near ground away too; zoomed out, the frame would reach past the
	# cut's edge and show an empty band at the bottom. Raise the frame (straight up the
	# screen, so the cut stays where it is) until the edge sits on its bottom.
	if camera.near > inside_near + 0.01:
		var level := Vector3(forward.x, 0.0, forward.z).normalized()
		var below := -0.2 - camera.position.y
		var ahead := (camera.near - below * forward.y) / level.dot(forward)
		var edge := ahead * level.dot(up) + below * up.y
		var raise := ceilf((edge + view_metres.y / 2.0) / pixel) * pixel
		if raise > 0.0:
			camera.position += up * raise
	var grade := display.material as ShaderMaterial
	grade.set_shader_parameter("cut", inside)
	if inside > 0.0:
		var size := Vector2(viewport.size)
		var back := corridor - toward * band_back
		grade.set_shader_parameter("cut_top", camera.unproject_position(Vector3(back.x, ceiling, back.z)).y / size.y)
		grade.set_shader_parameter("cut_bottom", camera.unproject_position(Vector3(cut.x, corridor.y - 1.35, cut.z)).y / size.y)
	# Shadow and fog ranges follow the camera so the wide views stay sharp and unhazed.
	sun.directional_shadow_max_distance = distance + 45.0
	environment.fog_depth_begin = distance + 14.0
	environment.fog_depth_end = distance + 170.0
	student.face(camera)
	_aim_sun()

# --- Time of day ---------------------------------------------------------------

## The view's turn the sun follows: every zone's but the canteen's (its patio was tuned
## under the APS sun, and turned, the tall block shades the wing) and the gym's inside
## faces (inside, the sun stays where the gym's front view puts it, so the hall's light
## does not swing).
func _sun_turns() -> float:
	return _turns() - arena * face - leg

## Turns the preset's sun offset with the camera's view, so the face a view looks at is
## lit the way the APS front is (from the camera's side, slanting in from the left or
## right with the time of day). Re-aimed only when the turn changes.
func _aim_sun(force := false) -> void:
	var turn := -PI / 2.0 * _sun_turns()
	# Facing MGN the sun slants in from the other side: from the usual side SJH's slab
	# shades most of MGN's front. (mgn is folded into the key so the swap re-aims too.)
	var key := turn + mgn * 10.0
	if not force and absf(key - _sun_turn) < 0.0005:
		return
	_sun_turn = key
	var offset := _sun_offset * Vector3(1.0 - 2.0 * mgn, 1.0, 1.0)
	var target := Vector3(22, 7, 0)
	sun.look_at_from_position(target + Basis(Vector3.UP, turn) * offset, target)
	edges.set_shader_parameter("sun_dir", sun.basis.z.normalized())
	# At night the light is the moon's: the sky draws the moon where it comes from.
	sky_material.set_shader_parameter("moon_dir", sun.basis.z.normalized())

## The time-of-day presets (T steps through them): the sun's offset as seen from the APS
## front (`_aim_sun` turns it with the view), its colour and strength, the ambient fill,
## haze, grade, glow, sky, the display's light and shade tints, cloud shadows, whether the
## lamps and lit windows are on, stars, the crickets, the light shafts' strength and the
## dawn mist.
const PRESETS := {
	5.75: {"label": "Dawn · 5:45 AM", "sun_offset": Vector3(60, 16, 60), "sun": "ffb39a", "energy": 0.5,
		"ambient": "9aa4c8", "ambient_energy": 0.42, "fog": 1.0, "saturation": 0.96, "contrast": 1.02,
		"glow": 0.55, "glow_threshold": 1.1, "top": "3f527f", "horizon": "f1b5a3", "ground": "5e6371",
		"light_tint": "ffe9e4", "shade_tint": "d4daf2", "clouds": 0.35, "lamps": true, "stars": 0.3,
		"crickets": false, "shafts": 0.06, "shaft_colour": "ffc9b0", "mist": 0.7},
	8.0: {"label": "Morning · 8:00 AM", "sun_offset": Vector3(55, 44, 60), "sun": "ffce96", "energy": 1.08,
		"ambient": "b8bec6", "ambient_energy": 0.42, "fog": 0.6, "saturation": 1.05, "contrast": 1.04,
		"glow": 0.25, "glow_threshold": 1.6, "top": "5d8aaf", "horizon": "edd3ae", "ground": "8a8a7c",
		"light_tint": "fff6e4", "shade_tint": "eceef4", "clouds": 0.85, "lamps": false, "stars": 0.0,
		"crickets": false, "shafts": 0.085, "shaft_colour": "ffd59a", "mist": 0.15},
	# Noon is a clear, sunny Philippine midday: a strong white sun a little off overhead so
	# the shadows still read, a blue sky fill in the shade, almost no haze.
	12.0: {"label": "Noon · 12:00 PM", "sun_offset": Vector3(-55, 80, 34), "sun": "fff4de", "energy": 1.42,
		"ambient": "a9bdd8", "ambient_energy": 0.32, "fog": 0.1, "saturation": 1.18, "contrast": 1.08,
		"glow": 0.25, "glow_threshold": 1.6, "top": "3f86d0", "horizon": "bfdcf0", "ground": "8a8a7c",
		"light_tint": "fff6e4", "shade_tint": "eceef4", "clouds": 0.5, "lamps": false, "stars": 0.0,
		"crickets": false, "shafts": 0.045, "shaft_colour": "fff1d6", "mist": 0.0},
	16.5: {"label": "Afternoon · 4:30 PM", "sun_offset": Vector3(-55, 44, 60), "sun": "ffce96", "energy": 1.08,
		"ambient": "b8bec6", "ambient_energy": 0.42, "fog": 0.6, "saturation": 1.05, "contrast": 1.04,
		"glow": 0.25, "glow_threshold": 1.6, "top": "5d8aaf", "horizon": "edd3ae", "ground": "8a8a7c",
		"light_tint": "fff6e4", "shade_tint": "eceef4", "clouds": 0.85, "lamps": false, "stars": 0.0,
		"crickets": false, "shafts": 0.085, "shaft_colour": "ffd59a", "mist": 0.0},
	# Golden hour: the sun low in the west, deep warm light, long shadows, glowing edges,
	# strong shafts and dust in them.
	17.75: {"label": "Golden hour · 5:45 PM", "sun_offset": Vector3(-62, 17, 50), "sun": "ffa257", "energy": 1.2,
		"ambient": "d6b08c", "ambient_energy": 0.36, "fog": 0.75, "saturation": 1.16, "contrast": 1.07,
		"glow": 0.5, "glow_threshold": 1.15, "top": "6a84b6", "horizon": "ffbd76", "ground": "8a7862",
		"light_tint": "fff0d6", "shade_tint": "e6d8d6", "clouds": 0.6, "lamps": false, "stars": 0.0,
		"crickets": false, "shafts": 0.16, "shaft_colour": "ffb866", "mist": 0.0},
	# Dusk: the sun just under the horizon, the sky orange to deep blue, the lamps and
	# windows coming on, the first stars.
	18.5: {"label": "Dusk · 6:30 PM", "sun_offset": Vector3(-62, 9, 50), "sun": "ff8e6e", "energy": 0.32,
		"ambient": "7c86b6", "ambient_energy": 0.42, "fog": 0.8, "saturation": 1.0, "contrast": 1.04,
		"glow": 0.8, "glow_threshold": 0.9, "top": "1f2d5c", "horizon": "e2896a", "ground": "3a3c4a",
		"light_tint": "f4e4ea", "shade_tint": "cfd6f4", "clouds": 0.25, "lamps": true, "stars": 0.45,
		"crickets": true, "shafts": 0.0, "shaft_colour": "ff9a70", "mist": 0.2},
	21.0: {"label": "Night · 9:00 PM", "sun_offset": Vector3(55, 58, 60), "sun": "a7bee5", "energy": 0.2,
		"ambient": "6f86c2", "ambient_energy": 0.3, "fog": 0.6, "saturation": 1.05, "contrast": 1.04,
		"glow": 0.9, "glow_threshold": 0.85, "top": "101c39", "horizon": "364566", "ground": "2a3040",
		"light_tint": "e6eeff", "shade_tint": "c9d6ff", "clouds": 0.0, "lamps": true, "stars": 1.0,
		"crickets": true, "shafts": 0.0, "shaft_colour": "ffd59a", "mist": 0.0},
}

func _set_hour(value: float) -> void:
	hour = value if PRESETS.has(value) else 16.5
	var p: Dictionary = PRESETS[hour]
	var lamps: bool = p.lamps
	_sun_offset = p.sun_offset
	_aim_sun(true)
	sun.light_color = Color(p.sun)
	sun.light_energy = p.energy
	environment.ambient_light_color = Color(p.ambient)
	environment.ambient_light_energy = p.ambient_energy
	environment.fog_density = p.fog
	environment.adjustment_saturation = p.saturation
	environment.adjustment_contrast = p.contrast
	environment.glow_intensity = p.glow
	environment.glow_hdr_threshold = p.glow_threshold
	var horizon := Color(p.horizon)
	sky_material.set_shader_parameter("top_color", Color(p.top))
	sky_material.set_shader_parameter("horizon_color", horizon)
	sky_material.set_shader_parameter("ground_color", Color(p.ground))
	sky_material.set_shader_parameter("stars", p.stars)
	environment.fog_light_color = horizon
	var grade := display.material as ShaderMaterial
	grade.set_shader_parameter("light_tint", Color(p.light_tint))
	grade.set_shader_parameter("shade_tint", Color(p.shade_tint))
	# Cloud shadows by day, a touch lighter in the slanting light; few at a clear noon.
	edges.set_shader_parameter("clouds", p.clouds)
	world.set_night(lamps)
	if atmosphere:
		atmosphere.set_hour(hour, lamps, p)
	if sound:
		sound.night = p.crickets
		sound.hour = hour
	if time_label:
		time_label.text = p.label

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
	controls.text = "A/D  Walk    W/S  Depth    Shift  Run    T  Time    G  Weather    C  Character    M  Mute\n" + \
		"E/Space  Talk (near someone)\n" + \
		"Wheel or +/-  Zoom    1-9, 0  Framings    Q/E or right-drag  Angle    P  Pixels\n" + \
		"R  Reset    F11  Fullscreen    F1  Fast travel (dev)    F2  Free cam (dev)    Tab  Hide controls    Esc  Close"
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
	elif value <= 56.0 and value > 10.0 and (leg > 0.5 or chapel > 0.5 or gym > 0.5 or sjh > 0.5 or mgn > 0.5 or pgn_east > 0.5 or formation > 0.5):
		student.place(0.7, 5.3)
		_snap_follow()
	_set_zoom(value)

func _reset() -> void:
	student.place(0.7, 5.3)
	orbit = 0.12
	orbit_goal = orbit
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
		["Lane beside APS", Vector2(45.5, 10.0), 26.0],
		["Pergola beside APS", Vector2(43.6, 31.0), 24.0],
		["Chapel plaza", CHAPEL_SPOT, 32.0],
		["Chapel south walk", Vector2(-8.0, 91.8), 30.0],
		["Picnic corner", Vector2(29.0, 91.0), 30.0],
		["IH Gym front", GYM_SPOT, 84.0],
		["IH Gym side", GYM_SIDE_SPOT, 44.0],
		["IH Gym inside", GYM_IN_SPOT, ARENA_WIDTH],
		["St. Joseph Hall", SJH_SPOT, 64.0],
		["SJH walkway", Sjh.world(25.0, -1.8), 22.0],
		["SJH lobby", Sjh.world(0.0, -1.5), 22.0],
		["SJH west entrance", Sjh.world(48.6, -0.8), 22.0],
		["SJH back lane", Sjh.world(0.0, Sjh.BACK - 7.0), 40.0],
		["Mary statue", Vector2(-48.5, 113.6), 26.0],
		["MGN", MGN_SPOT, 56.0],
		["MGN entrance", Mgn.world(21.0, 2.5), 18.0],
		["Boulevard, Main Bldg side", MIDDLE_SPOT, 40.0],
		["Boulevard, PGN side", MIDDLE_NORTH_SPOT, 40.0],
		["Boulevard covered walkway", Vector2(-92.1, 51.9), 22.0],
		["Angel fountain", Vector2(-159.0, 61.0), 40.0],
		["Student Center", STUDENT_CENTER_SPOT, 22.0],
		["Student Center, west end", Vector2(-158.0, 84.0), 30.0],
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

## Right-drag turns the angle: the cursor hides while the button is held and comes back
## where it was. Mouse right looks right, as Q/E do with E.
func _input(event: InputEvent) -> void:
	if event is InputEventMouseButton and event.button_index == MOUSE_BUTTON_RIGHT:
		if event.pressed and not free_cam.active and not (travel and travel.is_open()):
			_dragging = true
			_drag_from = event.position
			if DisplayServer.get_name() != "headless":
				Input.mouse_mode = Input.MOUSE_MODE_CAPTURED
		elif not event.pressed:
			_end_drag()
	elif event is InputEventMouseMotion and _dragging:
		orbit_goal = clampf(orbit_goal - event.relative.x * DRAG_TURN, -ORBIT_MAX, ORBIT_MAX)
		get_viewport().set_input_as_handled()

func _end_drag() -> void:
	if not _dragging:
		return
	_dragging = false
	if DisplayServer.get_name() != "headless":
		Input.mouse_mode = Input.MOUSE_MODE_VISIBLE
		Input.warp_mouse(_drag_from)

func _unhandled_input(event: InputEvent) -> void:
	if event is InputEventKey and event.pressed and not event.echo and event.physical_keycode == KEY_F1:
		_end_drag()
		_leave_free_cam()
		travel.toggle()
		return
	if event is InputEventKey and event.pressed and not event.echo and event.physical_keycode == KEY_F2 and not travel.is_open():
		if free_cam.active:
			_leave_free_cam()
		else:
			_end_drag()
			free_cam.enter()
			sky_material.set_shader_parameter("free_look", true) # the stars by direction, staying put as it turns
			pixel_scale = 0
			_resize()
		sound.select()
		return
	if free_cam.active:
		if free_cam.handle(event):
			return
		# Flying, only the keys that change the look still work (time, rain, pixels...).
		if not event is InputEventKey or not event.pressed or event.echo:
			return
		match event.physical_keycode:
			KEY_ESCAPE:
				_leave_free_cam()
				sound.select()
				return
			KEY_T, KEY_G, KEY_M, KEY_P, KEY_TAB, KEY_F11:
				pass
			_:
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
	# replies on offer: W/S or the arrows move, 1-3 says one straight away
	if npcs.choosing():
		match event.physical_keycode:
			KEY_W, KEY_UP:
				npcs.move_choice(-1)
				return
			KEY_S, KEY_DOWN:
				npcs.move_choice(1)
				return
			KEY_1, KEY_2, KEY_3:
				if npcs.pick(event.physical_keycode - KEY_1):
					sound.select()
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
		KEY_G:
			atmosphere.toggle_rain()
			sound.select()
		KEY_M:
			sound.toggle_mute()
		KEY_E:
			if npcs.interact():
				_e_talk = true
				sound.select()
			elif critters.pet():
				_e_talk = true
		KEY_SPACE, KEY_ENTER, KEY_KP_ENTER:
			if npcs.interact():
				sound.select()
			else:
				critters.pet()
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

## Where the student is, for the campus sounds: how near the busy spots where students gather.
const BUSY_SPOTS: Array[Vector2] = [Vector2(0.7, 5.3), Vector2(28.0, 12.0), Vector2(-34.0, 55.0), Vector2(50.0, 95.8)]
func _listen() -> void:
	var at := Vector2(student.position.x, student.position.z)
	var busy := 0.0
	for spot in BUSY_SPOTS:
		busy = maxf(busy, 1.0 - at.distance_to(spot) / 22.0)
	sound.crowd = clampf(busy, 0.0, 1.0)

func night_now() -> bool:
	return hour >= 19.0 or hour < 6.0

func _held(keys: Array) -> bool:
	for key in keys:
		if Input.is_physical_key_pressed(key):
			return true
	return false

## --free-cam=<yaw>,<pitch> (degrees): starts in the free cam looking that way from where
## the camera stands, for captures of the sky.
func _look_freely(angles: String) -> void:
	var parts := angles.split(",")
	free_cam.enter()
	free_cam.yaw = deg_to_rad(float(parts[0]))
	free_cam.pitch = deg_to_rad(float(parts[1]) if parts.size() > 1 else 20.0)
	free_cam._aim()
	sky_material.set_shader_parameter("free_look", true)
	pixel_scale = 0
	_resize()

## Lands the free cam back on the student's camera, snapped there at once.
func _leave_free_cam() -> void:
	if not free_cam.active:
		return
	free_cam.leave()
	sky_material.set_shader_parameter("free_look", false)
	pixel_scale = 0
	_resize()
	_update_camera(1.0)

func _process(delta: float) -> void:
	delta = minf(delta, 0.05)
	if free_cam.active:
		_fly(delta)
		return
	var direction := Vector2(float(_held([KEY_D, KEY_RIGHT])) - float(_held([KEY_A, KEY_LEFT])),
		float(_held([KEY_S, KEY_DOWN])) - float(_held([KEY_W, KEY_UP])))
	if travel.is_open():
		direction = Vector2.ZERO # the arrows pick a place instead
	# Keys are relative to the camera, so D keeps walking screen-right round the corner.
	var turn := -PI / 2.0 * _control_turns(direction)
	var right := Vector2(cos(turn), -sin(turn))
	var away := Vector2(-sin(turn), -cos(turn))
	# like the browser game, the student stands still while someone is talking
	if npcs.talking_to != null:
		direction = Vector2.ZERO
	student.move(right * direction.x - away * direction.y, _held([KEY_SHIFT]), delta, direction.x)
	sound.indoor = World.floor_height(student.position.x, student.position.z, student.level()) >= 0.45 or hall > 0.5 or walkway > 0.5
	_listen()
	if not _held([KEY_E]):
		_e_talk = false
	if _dragging and not Input.is_mouse_button_pressed(MOUSE_BUTTON_RIGHT):
		_end_drag() # released while the window was not listening

	orbit_goal = clampf(orbit_goal + (float(_held([KEY_E]) and not _e_talk) - float(_held([KEY_Q]))) * delta * 0.25, -ORBIT_MAX, ORBIT_MAX)
	orbit = lerpf(orbit, orbit_goal, 1.0 - exp(-delta * 16.0))
	_glide_zoom()
	_update_camera(delta)
	_update_cutaways(delta)
	npcs.update(delta)
	critters.hour = hour
	critters.rain = atmosphere.rain
	critters.update(delta, direction == Vector2.ZERO, direction != Vector2.ZERO and _held([KEY_SHIFT]), npcs.talking_to != null, npcs.in_reach() != null)
	atmosphere.focus = student.position
	atmosphere.view_width = width
	atmosphere.indoor = sound.indoor
	atmosphere.update(delta)
	sound.rain = atmosphere.rain
	npcs.rain = atmosphere.rain
	npcs.hour = hour
	_show_weather()

## The time badge also names the weather when it is not clear.
func _show_weather() -> void:
	if time_label == null or not PRESETS.has(hour):
		return
	var text: String = PRESETS[hour].label
	if atmosphere.weather != "clear":
		text += " · " + {"overcast": "Overcast", "rain": "Rain", "storm": "Thunderstorm", "windy": "Windy"}[atmosphere.weather]
	if time_label.text != text:
		time_label.text = text

## A frame of the free cam: the student waits, the world goes on round the camera.
func _fly(delta: float) -> void:
	student.move(Vector2.ZERO, false, delta)
	free_cam.fly(delta)
	var ahead := camera.position - camera.global_basis.z * 30.0
	sun.directional_shadow_max_distance = 160.0
	environment.fog_depth_begin = 80.0
	environment.fog_depth_end = 520.0
	(display.material as ShaderMaterial).set_shader_parameter("cut", 0.0)
	student.face(camera)
	_update_cutaways(delta)
	npcs.update(delta)
	critters.update(delta, true, false, false, false)
	atmosphere.focus = Vector3(ahead.x, 0.0, ahead.z)
	atmosphere.view_width = 60.0
	atmosphere.update(delta)
	sound.rain = atmosphere.rain
	npcs.rain = atmosphere.rain
	npcs.hour = hour

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
	# Each side of the boulevard fades the same way while the camera faces the other across
	# it, and the Student Center's roof while the student is under it.
	_arcade_lights = scene.find_child(StudentCenter.LIGHTS_GROUP, false, false)
	for group in [MiddleRoad.NORTH_GROUP, MiddleRoad.SOUTH_GROUP, StudentCenter.ROOF_GROUP, CoveredCourt.ROOF_GROUP, SacredHeart.WALK_ROOF]:
		var items := []
		var stack: Array[Node] = [scene.find_child(group, false, false)]
		while not stack.is_empty():
			var node: Node = stack.pop_back()
			if node is GeometryInstance3D:
				items.append([node, (node as GeometryInstance3D).cast_shadow])
			stack.append_array(node.get_children())
		_cutaways.append({"name": group, "alpha": 1.0, "items": items})

## Fades the groups standing between the camera and the student out (they keep casting
## shadows) and back in, and lights the hall while the student is in it.
func _update_cutaways(delta: float, immediate := false) -> void:
	var p := Gym.gym_local(student.position.x, student.position.z)
	var y := student.level()
	# Which side of the hall the camera is looking at now (it glides between them).
	var side := GymInterior.side_for(face)
	var on_middle := MiddleRoad.view_for(student.position.x, student.position.z) > 0.5
	var facing_south := MiddleRoad.south_for(student.position.z) > 0.5
	var under_arcade := StudentCenter.covered_for(student.position.x, student.position.z) > 0.5
	for cut in _cutaways:
		var hidden: bool
		if cut["name"] == MiddleRoad.NORTH_GROUP or cut["name"] == MiddleRoad.SOUTH_GROUP:
			hidden = on_middle and facing_south == (cut["name"] == MiddleRoad.NORTH_GROUP)
		elif cut["name"] == StudentCenter.ROOF_GROUP:
			hidden = under_arcade
		elif cut["name"] == CoveredCourt.ROOF_GROUP:
			hidden = CoveredCourt.under_roof(student.position.x, student.position.z)
		elif cut["name"] == SacredHeart.WALK_ROOF:
			hidden = SacredHeart.in_walk(student.position.x, student.position.z)
		else:
			hidden = GymInterior.hidden(cut["name"], p.x, p.y, y, side)
		hidden = hidden and not free_cam.active # flying, everything stands
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
	_arcade_lights.visible = under_arcade
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
		# Beside APS: the paved lane north of the canteen's tip and the parking lane by the
		# Covered Court are walkable at their heights; the patio's street lights are solid.
		checks.yard_walkable = not World.blocked(45.5, 10.0) and is_equal_approx(World.floor_height(45.5, 10.0), BesideAps.LANE_Y) 			and not World.blocked(50.7, 30.0) and is_equal_approx(World.floor_height(50.7, 30.0), BesideAps.PARKING_Y)
		checks.yard_props_block = World.blocked(26.9, 18.4)
		# The pergola island: walkable at its height between the pillars and the tables;
		# the pillars, the tables and the palm bowls are solid.
		checks.pergola_island = not World.blocked(45.8, 27.2) and is_equal_approx(World.floor_height(45.8, 27.2), BesideAps.ISLAND_Y) 			and World.blocked(BesideAps.PILLAR_X[0], BesideAps.PILLAR_Z[1]) and World.blocked(BesideAps.TABLE_X, BesideAps.TABLES[0]) 			and World.blocked(BesideAps.BOWLS[0].x, BesideAps.BOWLS[0].y) and World.blocked(BesideAps.TABLE_X, BesideAps.SHEDS[1]) \
			and not World.blocked(45.0, BesideAps.SHEDS[1] + 1.6)
		# The corner at the canteen tip's foot: walkable on its pavers, the umbrella tables solid.
		checks.tip_corner = not World.blocked(43.2, 25.6) and is_equal_approx(World.floor_height(43.2, 25.6), BesideAps.PATIO_Y) \
			and World.blocked(BesideAps.UMBRELLAS[0].x, BesideAps.UMBRELLAS[0].y) and World.blocked(38.0, 24.0)
		# The corner garden is planted, not walkable; the road turning past it is.
		checks.left_garden_blocks = World.blocked(-58.0, 8.0) and not World.blocked(-52.0, 10.0)
		# The shared campus plan: every building, the closed road loop, reserved plots.
		checks.plan_loaded = CampusPlan.PLOTS.size() == 29 and CampusPlan.PLOTS["aps"]["built"] \
			and not CampusPlan.PLOTS.has("corazon") and not CampusPlan.PLOTS.has("srh")
		checks.road_loop_closed = Roads.points()[0].distance_to(Roads.points()[-1]) < 0.01
		checks.plots_reserved = Plots.occupied(-197.1, 43.6) and not Plots.occupied(76.8, -7.1) and not Plots.occupied(-8.7, 58.1)
		# The layout reference: the Student Center (built now, so no longer a plot) between
		# the boulevard and the Main Building, and every plot painted with its name and
		# outlined in dashes.
		checks.plots_layout = not Plots.occupied(-120.0, 84.0) and Plots.occupied(-120.0, 100.0) \
			and CampusPlan.PLOTS["student"]["built"] and CampusPlan.PLOTS["mainGate"]["kind"] == "gate" \
			and CampusPlan.PLOTS["annex"]["short"] == "Aero Hall"
		var painted := scene.find_children("Ground *", "Label3D", false, false).size()
		checks.plots_named = painted == Plots.shapes().size()
		# No two plots overlap each other or a built building (shared edges allowed), and
		# none covers ground the student walks on.
		var overlap := false
		var ids: Array = CampusPlan.PLOTS.keys()
		for i in ids.size():
			for j in range(i + 1, ids.size()):
				var a: Dictionary = CampusPlan.PLOTS[ids[i]]
				var b: Dictionary = CampusPlan.PLOTS[ids[j]]
				if a["built"] and b["built"]:
					continue
				for piece in Geometry2D.intersect_polygons(PackedVector2Array(a["outline"]), PackedVector2Array(b["outline"])):
					var area := 0.0
					for k in piece.size():
						area += piece[k].cross(piece[(k + 1) % piece.size()])
					if absf(area) / 2.0 > 1.0:
						overlap = true
		var walked_on := false
		for spot in [Vector2(-90.0, 57.2), Vector2(-90.0, 72.0), Vector2(-92.1, 51.9), Vector2(-92.1, 77.3), Vector2(-159.0, 61.0),
				Vector2(-176.0, 64.6), Vector2(-58.5, 40.0), Vector2(-60.0, 90.0), MGN_SPOT, CHAPEL_SPOT, SJH_SPOT, GYM_SPOT]:
			walked_on = walked_on or Plots.occupied(spot.x, spot.y)
		checks.plots_clear = not overlap and not walked_on
		# The chapel is solid; its plaza, parking and the lawn path are walkable.
		checks.chapel_blocks = World.blocked(-8.7, 58.1) and World.blocked(-25.0, 59.5)
		var plaza_floor := World.floor_height(CHAPEL_SPOT.x, CHAPEL_SPOT.y)
		checks.chapel_plaza_walkable = not World.blocked(CHAPEL_SPOT.x, CHAPEL_SPOT.y) and is_equal_approx(plaza_floor, -0.04) 			and not World.blocked(-54.0, 70.0) and not World.blocked(-54.0, 46.0) and World.blocked(-45.0, 60.0)
		checks.lawn_path_walkable = not World.blocked(-36.0, 24.0) and World.blocked(-30.0, 24.0)
		# (the chapel lawn is mown, with only a few clumps; the wilder lawns elsewhere add more)
		checks.grass_built = (scene.find_child("Grass", false, false) as MultiMeshInstance3D).multimesh.instance_count > 400
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
		# The canteen's back is open: out through a gap to the strip behind the wing, the low
		# wall solid elsewhere; HAU COOP and RINA'S FOOD face the back.
		var back_gap := World.canteen_world((World.BACK_GAPS[0].x + World.BACK_GAPS[0].y) / 2.0, World.BACK_EDGE)
		var low_wall := World.canteen_world(50.0, World.BACK_EDGE)
		var wing_node := scene.find_child("CanteenWing", false, false)
		checks.canteen_open_back = not World.blocked(back_gap.x, back_gap.y) and World.blocked(low_wall.x, low_wall.y) 			and wing_node != null and wing_node.find_child("HAU COOP", false, false) != null
		var steps_before := sound.steps
		for i in 20:
			student.move(Vector2(-1, 0), false, 0.05)
		checks.footsteps_while_walking = sound.steps - steps_before >= 3
		checks.ambience_playing = AudioServer.get_bus_index("Music") >= 0
		checks.opening_panels = Opening.panels_ready() and not Opening.wanted(_args)
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
		# Along the path by the chapel's south side: facing north at the chapel, with the
		# road and SJH behind the camera cut away; trunks, the steps and the sheds are solid.
		student.place(-20.0, 91.8)
		_set_zoom(56.0, true)
		_snap_follow()
		for i in 240:
			student.move(Vector2(1, 0), false, 1.0 / 30.0, 0.0)
			_update_camera(1.0 / 30.0)
		var south_forward := -camera.global_basis.z
		checks.walk_chapel_south = student.position.x > -5.0 and ChapelSouth.on_path(student.position.x, student.position.z) \
			and south_forward.dot(Vector3.FORWARD) > 0.9 and camera.near > 20.0
		var trunk := ChapelSouth.TREES[0]
		var bay: Array = Chapel.south_bays()[1]
		var step: Vector2 = (bay[0] + bay[1]) / 2.0 + Chapel.outward(bay[0], bay[1]) * 1.5
		checks.chapel_south_blocks = World.blocked(trunk.x, trunk.y) and World.blocked(step.x, step.y) \
			and World.blocked(ChapelSouth.SHEDS[1].x, ChapelSouth.SHEDS[1].y) and not World.blocked(0.0, 91.8) \
			and not World.blocked(0.0, 86.5) and not World.blocked(0.0, 95.0)
		# From an empty bay in the chapel-side parking, out along its slant and north over
		# the grass onto the path.
		var bay_x := Sjh.PARKING.position.x + 1.4
		var bay_z := Sjh.PARKING.position.y + 4.6
		while World.blocked(bay_x, bay_z) and bay_x < 20.0:
			bay_x += Sjh.SLANT_BAY
		student.place(bay_x, bay_z)
		_snap_follow()
		for i in 150:
			var out := Vector2(-sin(Sjh.SLANT), -cos(Sjh.SLANT)) if i < 60 else Vector2(0, -1)
			student.move(out, false, 1.0 / 30.0, 0.0)
			_update_camera(1.0 / 30.0)
		checks.parking_to_chapel_walk = student.position.z < ChapelSouth.PATH[4].y
		student.position = saved
		# The wide framings follow the student: from the middle of the L (where the 112 m
		# frame used to stay) the whole APS and the canteen fit.
		student.place(-7.85, 5.3)
		_set_zoom(112.0, true)
		_snap_follow()
		_update_camera(1.0)
		checks.wide_shows_l = _all_visible([-62.5, 43.3], [0.0, 13.4], [-3.4, 0.3]) and _all_visible([33.0, 43.3], [0.0, 18.4], [24.9])
		student.place(5.72, 5.3)
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
		# The lane by the north gable: flat past the side entrance, rising east to the back.
		checks.gym_lane_rises = is_equal_approx(World.floor_height(70.0, 62.0), Gym.APRON_Y) and not World.blocked(92.0, 62.0) \
			and World.floor_height(92.0, 62.0) > Gym.APRON_Y + 0.1 and is_equal_approx(World.floor_height(99.5, 62.0), Gym.LANE_TOP)
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
		# Walking into SJH's lobby up the front stairs: the cutaway again.
		var sjh_gap := Sjh.world(3.0, Sjh.LOBBY_FOOT + 0.4)
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
			and camera.near > 5.0 and is_equal_approx(student.level(), Sjh.WALK_Y) 			and _all_visible([student.position.x], [student.position.y + 0.3, student.position.y + 1.9], [student.position.z])
		# SJH's raised ground floor: the lobby and the passage are on the walkway's floor, the
		# steps and the ramp climb to it, the planter terrace, the piers, the tables and the lift
		# wall stop the walk, the yard and the lane at the west end are open, and walking
		# from the yard up the west steps leads into the corridor.
		var deck := func(u: float, v: float) -> bool:
			var at := Sjh.world(u, v)
			return not World.blocked(at.x, at.y) and is_equal_approx(World.floor_height(at.x, at.y), Sjh.WALK_Y)
		var solid := func(u: float, v: float) -> bool:
			var at := Sjh.world(u, v)
			return World.blocked(at.x, at.y)
		var height := func(u: float, v: float) -> float:
			var at := Sjh.world(u, v)
			return World.floor_height(at.x, at.y)
		var up := func(u: float, v: float, low: float, high: float) -> bool:
			return height.call(u, v) > low and height.call(u, v) < high
		var climbs: bool = is_equal_approx(height.call(25.0, Sjh._walk_middle(25.0)), Sjh.LANDING_Y) and up.call(-38.0, Sjh._walk_middle(-38.0), -0.04, Sjh.LANDING_Y) and solid.call(25.0, Sjh.KERB_Z - 0.1) and solid.call(25.0, Sjh._walk_middle(25.0) - 1.3) and solid.call(8.3, 5.0) 			and up.call(0.0, 1.5, Sjh.LANDING_Y, Sjh.WALK_Y) and is_equal_approx(height.call(0.0, 3.5), Sjh.LANDING_Y) 			and up.call(0.0, 5.0, 0.0, Sjh.LANDING_Y) and height.call(44.0, 1.5) > height.call(48.0, 1.5) 			and height.call(48.0, 1.5) > 0.0 and not solid.call(25.0, Sjh._walk_middle(25.0))
		var west := Sjh.world(48.6, -0.8)
		student.place(west.x, west.y)
		_snap_follow()
		var east := Sjh.world(-1.0, -0.8) - Sjh.world(0.0, -0.8)
		for i in 200:
			student.move(east, false, 1.0 / 30.0, 0.0)
			_update_camera(1.0 / 30.0)
		var up_the_west_steps := Sjh.local(student.position.x, student.position.z).x < Sjh.WALK_END - 2.0 			and is_equal_approx(student.level(), Sjh.WALK_Y)
		checks.sjh_ground_floor = deck.call(0.0, -1.5) and deck.call(0.0, 0.6) and deck.call(43.0, -0.8) and deck.call(39.5, 1.5) 			and climbs and solid.call(25.0, 1.1) and solid.call(Sjh.PIERS[1], -0.5) and solid.call(Sjh.TABLES[1], Sjh.TABLE_Z) 			and solid.call(0.0, Sjh.WALL_Z) and solid.call(8.5, 0.5) and solid.call(25.0, Sjh.RAIL_Z) 			and not solid.call(48.6, -0.8) and not solid.call(51.2, -8.0) and not solid.call(49.4, -17.0) 			and is_equal_approx(height.call(51.2, -8.0), -0.04) and up_the_west_steps
		# Behind SJH: the lane along its back and the lane down to it round the east end
		# walkable; the back wall, a parked van and the perimeter wall solid; the camera faces
		# the back.
		var lane := Sjh.world(0.0, Sjh.BACK - 7.0)
		var back := Sjh.world(0.0, Sjh.BACK + 0.5)
		var van := Sjh.world(-8.2, Sjh.BACK - 2.8)
		var beyond := Sjh.world(0.0, Sjh.BOUNDARY - 0.5)
		checks.sjh_rear_lane = not World.blocked(lane.x, lane.y) and not World.blocked(41.0, 130.0) \
			and not World.blocked(42.0, 152.0) and is_equal_approx(World.floor_height(lane.x, lane.y), -0.04) \
			and World.blocked(back.x, back.y) and World.blocked(van.x, van.y) and World.blocked(beyond.x, beyond.y)
		student.place(lane.x, lane.y)
		_set_zoom(64.0, true)
		_snap_follow()
		_update_camera(1.0)
		checks.sjh_rear_view_faces_back = sjh < 0.01 and gym < 0.01 and chapel < 0.01 and mgn < 0.01 \
			and (-camera.global_basis.z).dot(Vector3.FORWARD) > 0.95 and _all_visible([back.x], [1.0, 6.0], [back.y - 0.6])
		# MGN: built on its plot facing the west road, solid, its garden planted, the entry
		# walk under the wing open up to the turnstile, the road beside it walkable.
		var mgn_node := scene.find_child("MGN", false, false) as Node3D
		checks.mgn_built = mgn_node != null and mgn_node.find_child("MGN 09", false, false) != null and not Plots.shapes().has("mgn")
		checks.mgn_faces_road = mgn_node != null and (mgn_node.global_basis * Vector3.BACK).dot(Vector3.RIGHT) > 0.99
		var mgn_solid := true
		for spot in [Vector2(0, -8), Vector2(35, -10), Vector2(-24, -10), Vector2(-24, 4), Vector2(12, -1.5), Vector2(5.0, 2.0)]: # (5, 2): the garden, clear of the walk
			var p := Mgn.world(spot.x, spot.y)
			mgn_solid = mgn_solid and World.blocked(p.x, p.y)
		checks.mgn_solid_and_garden = mgn_solid
		# the north entrance's forecourt: walkable at its height, its pillars and bins solid, the
		# paver corner and the drain at the ground beside it
		var court := Mgn.world(Mgn.FORECOURT.get_center().x, 2.0)
		var court_pillar := Mgn.world(Mgn.FORECOURT_PILLARS[0], Mgn.PILLAR_Z)
		var bin := Mgn.world(Mgn.BINS[0].x, Mgn.BINS[0].y)
		var corner := Mgn.world((Mgn.CORNER.x + Mgn.CORNER.y) / 2.0, 1.0)
		checks.mgn_north_entrance = not World.blocked(court.x, court.y) and absf(World.floor_height(court.x, court.y) - Mgn.FORECOURT_Y) < 0.01 			and World.blocked(court_pillar.x, court_pillar.y) and World.blocked(bin.x, bin.y) and not World.blocked(corner.x, corner.y) 			and absf(World.floor_height(corner.x, corner.y)) < 0.05
		# the drive off the road's bend round the Mary lawn into the lane: walkable all along,
		# the lawn solid round her
		var drive_open := true
		for at in Sjh.drive_line():
			drive_open = drive_open and not World.blocked(at.x, at.y)
		var lawn_mid := Vector2(-55.0, 122.5)
		checks.mary_drive_and_lawn = drive_open and World.blocked(lawn_mid.x, lawn_mid.y) 			and Geometry2D.is_point_in_polygon(Sjh.MARY, Sjh.lawn())
		# the paver walk through the garden: walkable at its height from the drive to the corridor
		var walk_mid := Mgn.world((Mgn.WALK_FROM.x + Mgn.WALK_TO.x) / 2.0, (Mgn.WALK_FROM.y + Mgn.WALK_TO.y) / 2.0)
		var walk_in := Mgn.world(Mgn.WALK_FROM.x, Mgn.WALK_FROM.y - 0.3)
		var beside := Mgn.world((Mgn.WALK_FROM.x + Mgn.WALK_TO.x) / 2.0 - 2.0, (Mgn.WALK_FROM.y + Mgn.WALK_TO.y) / 2.0)
		var drive := Mgn.world(Mgn.WALK_FROM.x, Mgn.GARDEN + 0.9)
		checks.mgn_front_walk = not World.blocked(walk_mid.x, walk_mid.y) and not World.blocked(walk_in.x, walk_in.y) 			and absf(World.floor_height(walk_mid.x, walk_mid.y) - Mgn.walk_height(walk_mid.x, walk_mid.y)) < 0.01 and World.blocked(beside.x, beside.y) 			and not World.blocked(drive.x, drive.y)
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
		# from the middle of its front, on the road (the frame follows the student)
		var mgn_middle := Mgn.world(6.0, Mgn.local(MGN_SPOT.x, MGN_SPOT.y).y)
		student.position = Vector3(mgn_middle.x, student.position.y, mgn_middle.y)
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
		# PGN: built on its plot, solid, the lane along its west end open from the boulevard's
		# covered walkway (through the planter) up to the courtyard, the planter still solid
		# elsewhere; in the lane the camera looks north up it; facing south across the
		# boulevard the cut is in front of PGN's face, so PGN never stands in the way.
		checks.pgn_built = scene.find_child("PGN NAME", true, false) != null and not Plots.shapes().has("pgn") 			and World.blocked(-100.0, 35.0) and World.blocked(-75.0, 0.0) and World.blocked(-110.0, 49.7) 			and not World.blocked(-134.0, 49.7) and not World.blocked(-134.0, 30.0) and not World.blocked(-125.0, 17.0) 			and is_equal_approx(World.floor_height(-134.0, 30.0), Pgn.LANE_Y) and World.blocked(Pgn.POTS[0].x, Pgn.POTS[0].y)
		student.place(-134.0, 30.0)
		_snap_follow()
		checks.pgn_lane_view = chapel < 0.01 and _turns() < 0.01 and MIDDLE_CUT_Z > Pgn.FACE + Pgn.BAND_OUT
		# The east face's ground floor: the raised walk walkable behind its railing (open at
		# the steps), the columns solid; on the west road beside it the camera faces it from
		# over the road, standing outside PGN, not inside it facing the chapel.
		checks.pgn_east_ground = not World.blocked(-64.8, 30.0) and is_equal_approx(World.floor_height(-64.8, 30.0), Pgn.EAST_WALK_Y) 			and World.blocked(Pgn.RAIL_X, 30.0) and not World.blocked(Pgn.RAIL_X, Pgn.DOOR_Z) and World.blocked(Pgn.EAST, Pgn.east_columns()[2])
		student.place(-58.5, 35.0)
		_set_zoom(40.0, true)
		_snap_follow()
		_update_camera(1.0)
		checks.pgn_east_view = pgn_east > 0.99 and chapel < 0.01 and (-camera.global_basis.z).dot(Vector3.LEFT) > 0.9 			and camera.position.x > Pgn.EAST + Pgn.BAND_OUT

		# The Formation Center: built on its plot facing the east road and set back from the
		# sidewalk round the bend; the building, its columns, the island and the kiosks solid;
		# the colonnade, the drop-off, its ways in and out and the sidewalk walkable.
		var sign := scene.find_child("SISTER JOSEFINA G* NEPOMUCENO FORMATION CENTER", true, false) # (a node name drops the ".")
		checks.formation_built = sign != null and scene.find_child("CMO RESERVED", true, false) != null and not Plots.shapes().has("formation") and World.blocked(15.0, 56.0) 			and World.blocked(Formation.FRONT_X - 0.25, Formation.COLUMNS[2]) and World.blocked(Formation.ISLAND.x, Formation.ISLAND.y) 			and World.blocked(Formation.KIOSK.x, Formation.KIOSK.y) and World.blocked(ChapelSouth.SHEDS[0].x, ChapelSouth.SHEDS[0].y)
		checks.formation_walkable = not World.blocked(24.0, 52.7) and is_equal_approx(World.floor_height(24.0, 52.7), Formation.TERRACE_Y) 			and not World.blocked(28.0, 58.0) and not World.blocked(33.0, 52.0) and not World.blocked(32.0, 71.0) 			and not World.blocked(27.4, 74.5) and not World.blocked(35.6, 80.0)
		checks.formation_sidewalk = not World.blocked(30.0, 35.3) and is_equal_approx(World.floor_height(30.0, 35.3), Formation.SIDEWALK_Y) 			and not World.blocked(35.6, 41.0) and Formation.NORTH_WING.y - Formation.NORTH_WING.z > 38.0
		# In front of it the camera turns to face it from over the east road; on the road it
		# still faces the gym.
		student.place(FORMATION_SPOT.x, FORMATION_SPOT.y)
		_set_zoom(40.0, true)
		_snap_follow()
		_update_camera(1.0)
		var facing := -camera.global_basis.z
		var faces_front := formation > 0.99 and facing.dot(Vector3.LEFT) > 0.9 and camera.position.x > Formation.FRONT_X
		student.place(40.5, 60.0)
		_snap_follow()
		checks.formation_view = faces_front and formation < 0.01 and gym > 0.99

		# Aero Hall: built in front of the gym's south end, solid; the concrete beside it and the
		# yard behind the green wall walkable; facing the gym from out here the camera stands
		# west of SJH's east face, with SJH cut away.
		checks.aero_built = scene.find_child("AERO NO PARKING", true, false) != null and not Plots.shapes().has("annex") 			and World.blocked(51.0, 128.0) and World.blocked(Aero.PLANTER.get_center().x, Aero.PLANTER.get_center().y) 			and not World.blocked(42.0, 128.0) and not World.blocked(46.5, 140.0) and not World.blocked(60.0, 140.0) 			and World.blocked(Aero.GREEN_WALL.x, 140.0) and is_equal_approx(World.floor_height(42.0, 128.0), Aero.GROUND_Y)
		student.place(42.0, 128.0)
		_set_zoom(40.0, true)
		_snap_follow()
		_update_camera(1.0)
		checks.aero_view = gym > 0.9 and camera.near > 1.0

		# The Covered Court: built on its plot, its floor and the ramp up from the gym's lane
		# walkable, the columns, bleachers and the things in front of it solid; facing south at
		# the gym from the lane, its roof is cut away.
		# Its inside: the courts' lettering and the AERO gate, the gate solid, the floor clear
		# between the courts; on the floor the camera faces east and the roof fades.
		checks.court_inside = scene.find_child("COURT LETTERING", true, false) != null and scene.find_child("AERO LABORATORY", true, false) != null 			and World.blocked(CoveredCourt.GATE_X + 1.0, CoveredCourt.centre_z()) and not World.blocked(80.0, 41.5) 			and is_equal_approx(CoveredCourt.view_for(70.0, 40.0), 1.0) and CoveredCourt.under_roof(70.0, 40.0)
		# Sacred Heart: built on its plot, solid; its square and the covered walkway walkable at
		# their heights, the fountain, the fence along the court and the walkway's tables solid;
		# in the square the camera faces north and the court behind is cut away.
		checks.sh_built = not Plots.shapes().has("sh") and scene.find_child("SACRED HEART BUILDING", true, false) != null 			and scene.find_child("SH SQUARE NAME", true, false) != null and World.blocked(60.0, 5.0) and World.blocked(80.0, -10.0) 			and World.blocked(100.0, 0.0)
		checks.sh_square = not World.blocked(83.5, 12.0) and is_equal_approx(World.floor_height(83.5, 12.0), SacredHeart.SQUARE_Y) 			and World.blocked(SacredHeart.FOUNTAIN.x, SacredHeart.FOUNTAIN.y) and World.blocked(80.0, SacredHeart.FENCE_Z) 			and not World.blocked(62.0, 18.6) and is_equal_approx(World.floor_height(62.0, 18.6), SacredHeart.WALK_Y) 			and World.blocked(SacredHeart.WALK_TABLES[1], SacredHeart.WALK_TABLE_Z) and not World.blocked(52.0, 18.6) 			and is_equal_approx(SacredHeart.court_cut_for(83.5, 12.0), 1.0) and is_equal_approx(gable_for(83.5, 12.0), 0.0)
		checks.court_built = not Plots.shapes().has("court") 			and not World.blocked(70.0, 40.0) and is_equal_approx(World.floor_height(70.0, 40.0), CoveredCourt.FLOOR_Y) 			and not World.blocked(70.0, CoveredCourt.SHED.end.y + 0.8) and World.blocked(CoveredCourt.columns()[2], CoveredCourt.SHED.end.y - 0.3) 			and World.blocked(70.0, CoveredCourt.STANDS.x + 1.0)
		student.place(GYM_SIDE_SPOT.x, GYM_SIDE_SPOT.y)
		_set_zoom(44.0, true)
		_snap_follow()
		_update_camera(1.0)
		checks.court_cut_from_lane = gable > 0.9 and camera.near > 1.0
		_set_zoom(MIN_WIDTH, true)
		_update_camera(1.0)
		# HAU Boulevard: walkable from the west road to the fountain, both lanes, both covered
		# walkways, both open walks and the crossings; the strips, median, planters, pillars
		# and the fountain solid.
		var lanes := true
		for x in range(-64, -158, -8):
			lanes = lanes and not World.blocked(x, 62.0) and not World.blocked(x, 67.2) \
				and is_equal_approx(World.floor_height(x, 62.0), -0.19) and is_equal_approx(World.floor_height(x, 67.2), -0.19)
		checks.middle_road_walkable = lanes and not World.blocked(-92.1, 51.9) and not World.blocked(-92.1, 77.3) \
			and not World.blocked(-90.0, 57.2) and not World.blocked(-90.0, 72.0) and not World.blocked(-106.0, 54.8) \
			and not World.blocked(-106.0, 64.6) and not World.blocked(-159.0, 61.0) \
			and is_equal_approx(World.floor_height(-92.1, 51.9), MiddleRoad.WALK_Y) and is_equal_approx(World.floor_height(-90.0, 57.2), -0.04) \
			and is_equal_approx(World.floor_height(-106.0, 64.6), -0.04)
		var pillar: Vector2 = MiddleRoad.pillars()[5]
		checks.middle_road_solid = World.blocked(-90.0, 64.6) and World.blocked(-90.0, 59.2) and World.blocked(-90.0, 54.8) \
			and World.blocked(-90.0, 70.0) and World.blocked(-90.0, 74.4) and World.blocked(-90.0, 49.7) and World.blocked(-90.0, 79.5) \
			and World.blocked(pillar.x, pillar.y) and World.blocked(MiddleRoad.FOUNTAIN.x, MiddleRoad.FOUNTAIN.y)
		checks.middle_road_kerbs = is_equal_approx(World.floor_height(-90.0, MiddleRoad.LANE_N.x), 0.0) \
			and is_equal_approx(World.floor_height(-90.0, MiddleRoad.MEDIAN.y), 0.0)
		# The west road's sidewalk and kerb open across the lanes, and stay either side of them.
		checks.west_road_opening = Roads.opened(Vector2(-62.0, 63.5)) and is_equal_approx(World.floor_height(-62.0, 63.5), -0.19) \
			and not Roads.opened(Vector2(-62.0, 54.0)) and is_equal_approx(World.floor_height(-62.0, 54.0), 0.0)
		# Walking in off the west road on the south lane: the camera turns to face south
		# across the boulevard, PGN's side behind the student fades, and they stay in view.
		student.place(-60.0, 67.2)
		_set_zoom(36.0, true)
		_snap_follow()
		for i in 240:
			student.move(Vector2(-1, 0), true, 1.0 / 30.0, 0.0)
			_update_camera(1.0 / 30.0)
		forward = -camera.global_basis.z
		_update_cutaways(1.0, true)
		checks.walk_down_middle_road = student.position.x < -75.0 and middle > 0.95 and mgn < 0.05 and chapel < 0.05 \
			and forward.dot(Vector3.BACK) > 0.95 and _cut_alpha(MiddleRoad.NORTH_GROUP) < 0.05 and _cut_alpha(MiddleRoad.SOUTH_GROUP) > 0.95 \
			and _all_visible([student.position.x], [student.position.y, student.position.y + 1.83], [student.position.z])
		# On the north lane it faces north at PGN's side instead: the Main Building's side
		# fades, MGN is cut away behind the camera.
		student.place(-60.0, 62.0)
		_snap_follow()
		for i in 240:
			student.move(Vector2(-1, 0), true, 1.0 / 30.0, 0.0)
			_update_camera(1.0 / 30.0)
		forward = -camera.global_basis.z
		_update_cutaways(1.0, true)
		var mgn_cut := (Vector3(student.position.x, 0.2, MiddleRoad.FACE_S + 0.3) - camera.position).dot(forward) < camera.near
		checks.walk_down_pgn_side = student.position.x < -75.0 and middle_north > 0.95 and middle < 0.05 and mgn < 0.05 \
			and forward.dot(Vector3.FORWARD) > 0.95 and _cut_alpha(MiddleRoad.SOUTH_GROUP) < 0.05 and _cut_alpha(MiddleRoad.NORTH_GROUP) > 0.95 \
			and mgn_cut and _all_visible([student.position.x], [student.position.y, student.position.y + 1.83], [student.position.z])
		# Holding S from the north walk walks straight across to the south one, although the
		# camera turns round to face that side on the way.
		student.place(-106.0, 57.2)
		_snap_follow()
		for i in 330:
			var turn := -PI / 2.0 * _control_turns(Vector2(0, 1))
			var away := Vector2(-sin(turn), -cos(turn))
			student.move(-away, false, 1.0 / 30.0, 0.0)
			_update_camera(1.0 / 30.0)
		forward = -camera.global_basis.z
		checks.cross_the_boulevard = student.position.z > 71.0 and middle > 0.9 and forward.dot(Vector3.BACK) > 0.9
		_control_turns(Vector2.ZERO)
		# From the north walk through the crossing's gap into PGN's covered walkway: the
		# camera glides in close and the road-side pillars and the road are cut away.
		student.place(-106.0, 57.2)
		_set_zoom(36.0, true)
		_snap_follow()
		for i in 150:
			var turn := -PI / 2.0 * _turns()
			var away := Vector2(-sin(turn), -cos(turn))
			student.move(away, false, 1.0 / 30.0, 0.0)
			_update_camera(1.0 / 30.0)
		forward = -camera.global_basis.z
		checks.walk_into_covered_walkway = student.position.z < MiddleRoad.FRONT_N - 0.6 and covered > 0.95 \
			and shown_width < HALL_WIDTH + 0.2 and camera.near > 5.0 and forward.dot(Vector3.FORWARD) > 0.9 \
			and _all_visible([student.position.x], [0.3, 1.9], [student.position.z])
		for i in 150:
			var turn := -PI / 2.0 * _turns()
			var away := Vector2(-sin(turn), -cos(turn))
			student.move(-away, false, 1.0 / 30.0, 0.0)
			_update_camera(1.0 / 30.0)
		checks.walk_out_of_covered_walkway = covered < 0.05 and student.position.z > MiddleRoad.PAVE_N.x and absf(shown_width - 36.0) < 0.2
		# The Student Center: its floor, the openings through both planters from the
		# boulevard's south walkway, and the brick apron past its west end are walkable; the
		# planters and rail, the tables and chairs, the ATM, the back wall and the lawn at
		# its east end are solid.
		checks.student_center_walkable = not World.blocked(-121.0, 83.4) and not World.blocked(-140.0, 82.0) \
			and not World.blocked(-106.0, 79.5) and not World.blocked(-106.0, 80.4) and not World.blocked(-145.0, 81.0) \
			and not World.blocked(-158.0, 84.0) and not World.blocked(-162.0, 77.5) \
			and is_equal_approx(World.floor_height(-121.0, 83.4), StudentCenter.FLOOR_Y) \
			and is_equal_approx(World.floor_height(-106.0, 79.5), MiddleRoad.WALK_Y) \
			and is_equal_approx(World.floor_height(-158.0, 84.0), -0.04)
		checks.student_center_solid = World.blocked(-120.0, 80.3) and World.blocked(-120.0, 81.1) and World.blocked(-120.0, 79.5) \
			and World.blocked(-130.0, StudentCenter.TABLE_Z) and World.blocked(-130.0, StudentCenter.CHAIR_Z) \
			and World.blocked(-153.5, 87.5) and World.blocked(-120.0, 88.1) and World.blocked(-87.0, 84.0) \
			and World.blocked(-120.0, 92.0)
		# From the boulevard's south walkway through the courtyard crossing's openings into
		# the arcade: the camera keeps facing south, glides into the cutaway, and the posts,
		# rail and planter in front of the student are cut away.
		student.place(-106.0, 77.3)
		_set_zoom(36.0, true)
		_snap_follow()
		for i in 150:
			var turn := -PI / 2.0 * _turns()
			var away := Vector2(-sin(turn), -cos(turn))
			student.move(away, false, 1.0 / 30.0, 0.0)
			_update_camera(1.0 / 30.0)
		forward = -camera.global_basis.z
		var post_cut := (Vector3(student.position.x, 1.0, StudentCenter.POST_Z) - camera.position).dot(forward) < camera.near
		checks.walk_into_student_center = student.position.z > StudentCenter.INNER + 1.0 and arcade > 0.95 and middle > 0.95 \
			and shown_width < HALL_WIDTH + 0.2 and forward.dot(Vector3.BACK) > 0.9 and post_cut \
			and _all_visible([student.position.x], [StudentCenter.FLOOR_Y + 0.3, StudentCenter.FLOOR_Y + 1.9], [student.position.z])
		for i in 150:
			var turn := -PI / 2.0 * _turns()
			var away := Vector2(-sin(turn), -cos(turn))
			student.move(-away, false, 1.0 / 30.0, 0.0)
			_update_camera(1.0 / 30.0)
		checks.walk_out_of_student_center = arcade < 0.05 and student.position.z < StudentCenter.FACE - 1.0 and middle > 0.95
		# Past the west end, on the brick apron, the camera still faces south (the chapel
		# view, which would otherwise take any spot this far south, stays off).
		student.place(-158.0, 84.0)
		_snap_follow()
		for i in 60:
			_update_camera(1.0 / 30.0)
		checks.student_center_west_end = middle > 0.95 and chapel < 0.05 and arcade < 0.05
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
		# (the student well away, or the strollers would stop to look at them)
		var student_was := student.position
		student.position = Vector3(-70.0, 0.0, 30.0)
		for i in 900:
			npcs.update(1.0 / 30.0)
		checks.npcs_wander = npcs.cast.filter(func(n: Node3D) -> bool: return n.roam > 0.0).all(func(n: Node3D) -> bool: return n.walked > 0.5) \
			and npcs.cast.all(func(n: Node3D) -> bool: return not World.blocked(n.position.x, n.position.z) and n.ground().distance_to(n.home) <= n.roam + 0.6)
		var guard: Node3D = npcs.cast.filter(func(n: Node3D) -> bool: return n.id == "kuya-ben")[0]
		student.place(guard.position.x + 0.9, guard.position.z)
		# like the browser game: the line types out with the mouth moving, a key shows it
		# all, the next key moves on; a question offers replies once it is all out
		var opening: Array = npcs.script_for(guard)
		var talked: bool = npcs.interact() and npcs.bubble.visible and npcs.said() == opening[0] and guard.talking
		npcs.update(1.0 / 30.0)
		talked = talked and npcs.typing() and npcs.shown > 0.0 and guard.animation == "talk"
		npcs.interact()
		npcs.update(1.0 / 30.0)
		talked = talked and not npcs.typing() and not npcs.choosing() and guard.animation == "idle"
		npcs.interact()
		talked = talked and npcs.said() == opening[1].ask and npcs.typing() and not npcs.choosing()
		npcs.interact()
		npcs.update(1.0 / 30.0)
		checks.npc_talks = talked and npcs.choosing() and npcs.choice_panel.visible and npcs.choice_list.get_child_count() == 2
		# picking a reply: their answer, then the talk ends; next time they remember it
		npcs.move_choice(1)
		var picked: bool = npcs.choice == 1 and npcs.pick(npcs.choice) and npcs.memory.has("ben.no_id") and not npcs.choice_panel.visible
		for i in 6:
			if npcs.talking_to != null:
				npcs.interact()
		picked = picked and not npcs.bubble.visible and not guard.talking and npcs.memory.has("met.kuya-ben")
		npcs.interact()
		picked = picked and npcs.said().begins_with("Bukas, dala mo na ID mo")
		for i in 4:
			if npcs.talking_to != null:
				npcs.interact()
		# one NPC's words reach another: Rica's message for Paolo
		var paolo: Node3D = npcs.cast.filter(func(n: Node3D) -> bool: return n.id == "paolo")[0]
		var before: String = npcs.script_for(paolo)[0]
		npcs.memory["rica.asked"] = true
		checks.dialogue_choices = picked and npcs.talking_to == null and npcs.script_for(paolo)[0] != before
		npcs.memory.clear()
		# and walking off mid-line closes it
		npcs.interact()
		student.place(guard.position.x + 6.0, guard.position.z + 1.5)
		npcs.update(1.0 / 30.0)
		checks.npc_talk_closes_when_away = not npcs.bubble.visible
		# NPCs notice the student: a stroller stops, turns to them and waves, once
		var bea: Node3D = npcs.cast.filter(func(n: Node3D) -> bool: return n.id == "bea")[0]
		student.position = Vector3(-70.0, 0.0, 30.0)
		npcs.update(1.0 / 30.0)
		var side := Vector2(camera.global_transform.basis.x.x, camera.global_transform.basis.x.z).normalized()
		var by_bea: Vector2 = bea.ground() + side * 2.2
		student.position = Vector3(by_bea.x, bea.position.y, by_bea.y)
		npcs.update(1.0 / 30.0)
		if not npcs.hellos.any(func(h: Dictionary) -> bool: return h.npc == bea):
			npcs._say_hello(bea) # she says hello only some of the time (CHATTY); the bubble is what is checked
		var waving: bool = bea.noticed and bea.animation == "wave" and bea.waved == 1 and not bea.sprite.flip_h
		var greeted: bool = npcs.hellos.any(func(h: Dictionary) -> bool: return h.npc == bea and not (h.label as Label).text.is_empty())
		var walked_before: float = bea.walked
		for i in 90:
			npcs.update(1.0 / 30.0)
		checks.npc_notices_and_waves = waving and bea.animation == "idle" and bea.waved == 1 and bea.walked == walked_before 			and greeted
		# Standing about, an NPC looks the student's way from further off than it notices them.
		var ben: Node3D = npcs.cast.filter(func(n: Node3D) -> bool: return n.id == "kuya-ben")[0]
		var by_ben: Vector2 = ben.ground() + side * 4.5
		student.position = Vector3(by_ben.x, ben.position.y, by_ben.y)
		npcs.update(1.0 / 30.0)
		var looks_right: bool = not ben.noticed and not ben.sprite.flip_h
		by_ben = ben.ground() - side * 4.5
		student.position = Vector3(by_ben.x, ben.position.y, by_ben.y)
		npcs.update(1.0 / 30.0)
		# Ambient life: the cats and the flocks are there; a flock takes off when the student
		# comes close and lands again later; a cat can be petted.
		critters.hour = 12.0
		critters.rain = 0.0
		var flock: Dictionary = critters.flocks[0]
		var first: Dictionary = flock.birds[0]
		var by_bird: Vector2 = first.at + Vector2(1.0, 0.0)
		student.position = Vector3(by_bird.x, 0.0, by_bird.y)
		critters.update(1.0 / 30.0, true, false, false, false)
		var took_off: bool = flock.state == "flying" and critters.takeoffs >= 1
		# it flies off the screen before it is gone (never vanishing in view), and lands again
		# gliding in to the ground
		var vanished_in_view := false
		for i in 600:
			var was: bool = (first.node as Node3D).visible
			critters.update(1.0 / 30.0, true, false, false, false)
			if was and not (first.node as Node3D).visible and camera.is_position_in_frustum((first.node as Node3D).position):
				vanished_in_view = true
			if flock.state == "away":
				break
		var flew_away: bool = flock.state == "away" and not (first.node as Node3D).visible and not vanished_in_view
		student.position = Vector3(by_bird.x + 40.0, 0.0, by_bird.y)
		flock.timer = 0.0
		for i in 150:
			critters.update(1.0 / 30.0, true, false, false, false)
		var landed: bool = flock.state == "feeding" and (first.node as Node3D).visible 			and absf((first.node as Node3D).position.y - World.floor_height((first.at as Vector2).x, (first.at as Vector2).y)) < 0.2
		var tisay: Dictionary = critters.cats[2]
		var by_cat: Vector2 = tisay.at + Vector2(0.6, 0.0)
		student.position = Vector3(by_cat.x, World.floor_height(by_cat.x, by_cat.y), by_cat.y)
		var petted: bool = critters.pet() and tisay.state == "petted" and critters.pets == 1
		# petted, it leans into the hand (its own frames); sitting, it fidgets now and then; asleep
		# it breathes; it wakes with a stretch and strolls off
		var leans := {}
		for i in 40:
			critters._update_cat(tisay, 1.0 / 30.0, by_cat, true, false, side)
			if tisay.state == "petted":
				leans[tisay.sprite.frame] = tisay.sprite.texture == tisay.sheets.petted[0]
		var kiko: Dictionary = critters.cats[1]
		var away: Vector2 = kiko.at + Vector2(30.0, 0.0)
		kiko.state = "sit"
		kiko.timer = 99.0
		kiko.next_fidget = 0.0
		var fidgeted := false
		for i in 30:
			critters._update_cat(kiko, 1.0 / 30.0, away, false, false, side)
			fidgeted = fidgeted or (kiko.fidget != "" and kiko.sprite.texture == kiko.sheets[kiko.fidget][0])
		kiko.state = "sleep"
		kiko.timer = 2.0
		var breaths := {}
		var stretched := false
		for i in 180:
			critters._update_cat(kiko, 1.0 / 30.0, away, false, false, side)
			if kiko.state == "sleep" and kiko.sprite.texture == kiko.sheets.breathe[0]:
				breaths[kiko.sprite.frame] = true
			stretched = stretched or (kiko.state == "stretch" and kiko.sprite.texture == kiko.sheets.stretch[0])
		var woke: bool = kiko.state in ["walk", "sit"]
		# run at a cat and it gallops off; a feeding maya hops with its own frames
		kiko.state = "sit"
		var galloped := false
		for i in 20:
			critters._update_cat(kiko, 1.0 / 30.0, kiko.at + Vector2(1.0, 0.0), false, true, side)
			galloped = galloped or (kiko.state == "dash" and kiko.sprite.texture == kiko.sheets.gallop[0])
		var hopper: Dictionary = critters.flocks[1].birds[0]
		hopper.hop = 0.0
		hopper.from = hopper.at
		hopper.to = hopper.at + Vector2(0.2, 0.0)
		var hops := {}
		for i in 6:
			critters._feed(hopper, 1.0 / 30.0, critters.flocks[1].spot, side)
			if hopper.sprite.texture == critters._birds().hop[0]:
				hops[hopper.sprite.frame] = true
		var cat_animates: bool = galloped and hops.size() >= 3 and leans.size() >= 3 and leans.values().all(func(v: bool) -> bool: return v) and fidgeted 			and breaths.size() >= 3 and stretched and woke
		# birds flying over cross between the camera and the student, above the ground
		var screen_right := Vector2(camera.global_transform.basis.x.x, camera.global_transform.basis.x.z).normalized()
		critters._launch(Vector2(student.position.x, student.position.z), screen_right)
		critters.update(1.0 / 30.0, true, false, false, false)
		var over: Node3D = critters.flyers[-1].birds[0].node
		var flying_over: bool = over != null and over.position.y > World.floor_height(over.position.x, over.position.z) + 2.0 			and (over.position - student.position).dot(camera.global_transform.basis.z) > 1.0
		checks.cats_and_birds = critters.cats.size() >= 10 and critters.flocks.size() >= 16 and flying_over and took_off and flew_away and landed and petted and cat_animates 			and critters.cats.all(func(c: Dictionary) -> bool: return not World.blocked((c.at as Vector2).x, (c.at as Vector2).y))
		checks.npc_looks_and_says_hello = looks_right and ben.sprite.flip_h and not ben.noticed and greeted 			and not npcs.hello_for(bea).is_empty()
		# in the rain, umbrellas open outside, and not under the canteen roof
		npcs.rain = 1.0
		for i in 15:
			npcs.update(1.0 / 30.0)
		var lorna: Node3D = npcs.cast.filter(func(n: Node3D) -> bool: return n.id == "ate-lorna")[0]
		checks.npc_umbrellas = bea.umbrella.visible and lorna.sheltered and not lorna.umbrella.visible
		npcs.rain = 0.0
		for i in 15:
			npcs.update(1.0 / 30.0)
		checks.npc_umbrellas = checks.npc_umbrellas and not bea.umbrella.visible
		student.position = student_was
		# the campus sounds: busy by the APS front, and birds by day
		sound.warm_all()
		student.place(0.7, 5.3)
		_listen()
		sound.indoor = false
		var calls := sound.bird_calls
		for i in 600:
			sound._process(1.0 / 30.0)
		# weather: a shower wets the ground (glossy) and is heard, and the ground dries matte after
		atmosphere.start_raining()
		atmosphere.indoor = false
		atmosphere.focus = student.position
		for i in 5:
			atmosphere.update(0.1)
		sound.rain = atmosphere.rain
		var raining := atmosphere.rain > 0.99 and atmosphere.rain_fx.emitting and atmosphere.wet_count() > 0 and atmosphere.puddles.size() > 50 and atmosphere.puddles[0].visible
		atmosphere.rain_target = 0.0
		atmosphere.rain = 0.0
		atmosphere.update(0.1)
		sound.rain = 0.0
		checks.rain_wets_then_dries = raining and atmosphere.wet_count() == 0 and not atmosphere.puddles[0].visible
		# The weathers: a storm flashes lightning and blows hard, overcast dims the sun; G
		# steps through them; then clear again.
		atmosphere.set_weather("clear", true)
		atmosphere.update(0.1)
		var sun_before := sun.light_energy
		atmosphere.set_weather("storm", true)
		for i in 200:
			atmosphere.update(0.1)
		var stormy: bool = atmosphere.strikes > 0 and atmosphere.rain > 0.99 and atmosphere.wind > 0.75
		atmosphere.set_weather("overcast", true)
		atmosphere.update(0.1)
		var dull := sun.light_energy < sun_before * 0.6
		var stepped := Atmosphere.WEATHERS.size() == 5 and not Atmosphere.WEATHER.has("fog")
		atmosphere.toggle_rain()
		stepped = stepped and atmosphere.weather == "rain"
		atmosphere.set_weather("clear", true)
		atmosphere.update(0.1)
		var hours_ok := HOURS.all(func(h: float) -> bool: return PRESETS.has(h))
		checks.weather_and_light = stormy and dull and stepped and hours_ok and environment.fog_height_density < 0.05
		# light: every tree drops leaves and (by day) casts shafts
		checks.leaves_and_shafts = world.trees.size() > 10 and atmosphere.leaves.size() == world.trees.size() 			and (night_now() or atmosphere.shafts.get_child_count() >= world.trees.size())
		checks.campus_sounds = sound.crowd > 0.9 and (sound.night or sound.bird_calls > calls)
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
		# The free cam: F2 starts it where the camera stands, looking the same way, in
		# perspective; it flies along the view, and hands back the orthographic camera.
		var looking := -camera.global_basis.z
		var from := camera.position
		free_cam.enter()
		var same_view := camera.position.is_equal_approx(from) and (-camera.global_basis.z).dot(looking) > 0.999 			and camera.projection == Camera3D.PROJECTION_PERSPECTIVE
		free_cam.step(1.0, Vector3(0, 0, -1))
		var flown := absf(camera.position.distance_to(from) - free_cam.speed()) < 0.01 			and (camera.position - from).normalized().dot(looking) > 0.999
		var low := camera.position.y
		free_cam.step(1.0, Vector3(0, 1, 0))
		var risen := is_equal_approx(camera.position.y, low + free_cam.speed())
		var still := student.position
		_fly(0.5)
		_leave_free_cam()
		checks.free_cam = same_view and flown and risen and student.position == still and not free_cam.active 			and camera.projection == Camera3D.PROJECTION_ORTHOGONAL and is_equal_approx(camera.far, 240.0) 			and camera.position.distance_to(from) < 0.01
		# Right-drag turns the angle while the button is held, within the Q/E range.
		var saved_orbit := orbit
		orbit_goal = 0.12
		var right := InputEventMouseButton.new()
		right.button_index = MOUSE_BUTTON_RIGHT
		right.pressed = true
		_input(right)
		var drag := InputEventMouseMotion.new()
		drag.relative = Vector2(20, 0)
		_input(drag)
		var turned := is_equal_approx(orbit_goal, 0.12 - 20.0 * DRAG_TURN)
		drag.relative = Vector2(-1000, 0)
		_input(drag)
		var clamped := is_equal_approx(orbit_goal, ORBIT_MAX)
		right.pressed = false
		_input(right)
		_input(drag)
		checks.drag_angle = turned and clamped and not _dragging and is_equal_approx(orbit_goal, ORBIT_MAX)
		orbit = saved_orbit
		orbit_goal = saved_orbit
		_update_camera(1.0)
	var okay := not checks.values().has(false)
	print(JSON.stringify({"scene": "APS 2.5D", "checks": checks, "checks_pass": okay, "boxes": world.box_count,
		"nodes": scene.get_child_count(), "viewport": [viewport.size.x, viewport.size.y], "pixel_scale": pixel_scale,
		"renderer": RenderingServer.get_current_rendering_method()}))
	if _args.has("capture"):
		# --talk: open a conversation with whoever is in reach, to review the bubble
		if _args.has("talk") and npcs.interact():
			npcs.update(float(_args.get("talk-time", "0.6")))
			await get_tree().process_frame
			npcs.update(1.0 / 60.0)
		await RenderingServer.frame_post_draw
		var path: String = _args["capture"]
		var image := viewport.get_texture().get_image() if _args.has("raw") else get_viewport().get_texture().get_image()
		var result := image.save_png(path)
		print("Capture: ", path, " result=", result)
		okay = okay and result == OK
	get_tree().quit(0 if okay else 1)
