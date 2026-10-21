extends Node3D
## A campus NPC: a lit, alpha-cut sheet from the style reference, animated by the
## boy's rig (assets/drafts/characters/npcs/rig/), who strolls between spots near
## home, stops a while, and talks when the student asks. Posts (roam 0) stay put.
## When the student comes near it stops, turns to them, waves and says hello (the cast
## shows the bubble); standing about, it looks their way from further off. In the rain
## it opens an umbrella unless it is under a roof.

const World := preload("res://world.gd")
## Metres per sprite pixel: the student's density, 85 px for 1.83 m.
const DENSITY := 1.83 / 85.0
const STRIDE := 1.15 # metres per walk cycle, the student's
const SPEED := 1.1
const FRAMES := {"walk": 12, "idle": 24, "talk": 4, "wave": 4}
const RATES := {"idle": 4.0, "talk": 6.0, "wave": 7.0}
## Metres: closer than this, it notices the student; it waves again only after
## they have gone further than AWAY.
const NOTICE := 3.0
const AWAY := 6.0
const WAVE_TIME := 1.6
## Metres: standing about (not walking), it turns to look at a student this close.
const LOOK := 6.0

var id := ""
var display_name := ""
## What it says, by what the student has said before: see npcs.gd.
var talks: Array = []
var home := Vector2.ZERO
## How far from home it may wander; 0 keeps it at its post.
var roam := 0.0
var sprite := Sprite3D.new()
var contact := Decal.new()
var talking := false
## Words are still coming out of the bubble: the mouth moves.
var speaking := false
var animation := ""
var walked := 0.0 # metres, for the checks
## The student is close: it stops and looks at them.
var noticed := false
var waved := 0 # times it has waved, for the checks
## Set when it starts to wave: the cast shows its hello and clears it.
var greeting := false
## How hard it is raining (set by the cast each frame), and whether it is under a roof.
var rain := 0.0
var sheltered := false
var umbrella := Node3D.new()
var umbrella_colour := Color("2f4f7a")
var _open := 0.0
var _greeted := false
var _waving := 0.0
var _sheets := {}
var _frames := {} # frames per sheet (an idle standing in for a missing sheet has the idle's)
var _target := Vector2.ZERO
var _wait := 0.0
var _distance := 0.0
var _phase := 0.0
var _facing := 1.0
var _rng := RandomNumberGenerator.new()

func setup(data: Dictionary) -> void:
	id = data.id
	display_name = data.name
	talks = data.talks
	umbrella_colour = data.get("umbrella", umbrella_colour)
	home = data.home
	roam = data.get("roam", 0.0)
	_facing = data.get("facing", 1.0)
	_rng.seed = hash(id)

func _ready() -> void:
	name = "NPC_" + id
	for kind in FRAMES:
		var path := "res://sprites/npcs/%s/%s.png" % [id, kind]
		if not ResourceLoader.exists(path):
			continue
		var image := (load(path) as Texture2D).get_image()
		image.generate_mipmaps()
		_sheets[kind] = ImageTexture.create_from_image(image)
		_frames[kind] = FRAMES[kind]
	# a character still being made may have only its idle: it stands in that for the rest
	for kind in FRAMES:
		if not _sheets.has(kind):
			_sheets[kind] = _sheets["idle"]
			_frames[kind] = FRAMES["idle"]
	sprite.name = "LitPixelSprite"
	sprite.shaded = true
	sprite.double_sided = true
	sprite.alpha_cut = SpriteBase3D.ALPHA_CUT_DISCARD
	sprite.alpha_scissor_threshold = 0.35
	sprite.texture_filter = BaseMaterial3D.TEXTURE_FILTER_NEAREST_WITH_MIPMAPS
	sprite.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_DOUBLE_SIDED
	sprite.pixel_size = DENSITY
	add_child(sprite)
	contact.name = "SoftFootContact"
	contact.texture_albedo = _contact_texture()
	contact.size = Vector3(0.7, 0.6, 0.45)
	contact.upper_fade = 0.2
	contact.lower_fade = 0.2
	contact.position.y = 0.1
	add_child(contact)
	_build_umbrella()
	place(home)
	sheltered = World.floor_height(home.x, home.y) >= 0.45 # inside the canteen hall
	_target = home
	_wait = _rng.randf_range(0.5, 3.0)
	_animate("idle", 0.0)

static var _shadow: ImageTexture
static func _contact_texture() -> ImageTexture:
	if _shadow == null:
		var image := Image.create(32, 32, false, Image.FORMAT_RGBA8)
		for y in 32:
			for x in 32:
				var d := Vector2(x - 15.5, y - 15.5).length() / 15.5
				image.set_pixel(x, y, Color(0.08, 0.1, 0.11, 0.42 * clampf(1.0 - d, 0.0, 1.0) ** 1.6))
		_shadow = ImageTexture.create_from_image(image)
	return _shadow

## A plain matte umbrella like the patio ones: an eight-sided canopy, a rib
## ring, a thin shaft. It sits a little in front of the sprite, on its facing side.
func _build_umbrella() -> void:
	umbrella.name = "Umbrella"
	var cloth := StandardMaterial3D.new()
	cloth.albedo_color = umbrella_colour
	cloth.diffuse_mode = BaseMaterial3D.DIFFUSE_LAMBERT
	cloth.specular_mode = BaseMaterial3D.SPECULAR_DISABLED
	cloth.roughness = 0.9
	cloth.cull_mode = BaseMaterial3D.CULL_DISABLED
	var steel := StandardMaterial3D.new()
	steel.albedo_color = Color("2b2b30")
	steel.diffuse_mode = BaseMaterial3D.DIFFUSE_LAMBERT
	steel.specular_mode = BaseMaterial3D.SPECULAR_DISABLED
	var canopy := CylinderMesh.new()
	canopy.top_radius = 0.03
	canopy.bottom_radius = 0.6
	canopy.height = 0.26
	canopy.radial_segments = 8
	canopy.rings = 1
	canopy.cap_bottom = false
	canopy.material = cloth
	var top := MeshInstance3D.new()
	top.mesh = canopy
	top.position.y = 2.06
	umbrella.add_child(top)
	var edge := CylinderMesh.new()
	edge.top_radius = 0.6
	edge.bottom_radius = 0.61
	edge.height = 0.03
	edge.radial_segments = 8
	edge.rings = 1
	edge.material = steel
	var rim := MeshInstance3D.new()
	rim.mesh = edge
	rim.position.y = 1.93
	umbrella.add_child(rim)
	var rod := CylinderMesh.new()
	rod.top_radius = 0.014
	rod.bottom_radius = 0.014
	rod.height = 1.0
	rod.radial_segments = 6
	rod.rings = 1
	rod.material = steel
	var shaft := MeshInstance3D.new()
	shaft.mesh = rod
	shaft.position.y = 1.62
	umbrella.add_child(shaft)
	umbrella.visible = false
	add_child(umbrella)

func place(at: Vector2) -> void:
	position = Vector3(at.x, World.floor_height(at.x, at.y) + 0.015, at.y)

func ground() -> Vector2:
	return Vector2(position.x, position.z)

## A spot near home it can walk to in a straight line without hitting anything.
func _pick_target() -> Vector2:
	for attempt in 16:
		var angle := _rng.randf() * TAU
		var spot := home + Vector2(cos(angle), sin(angle)) * _rng.randf_range(0.6, roam)
		if _clear(ground(), spot):
			return spot
	return ground()

static func _clear(from: Vector2, to: Vector2) -> bool:
	var steps := maxi(1, ceili(from.distance_to(to) / 0.3))
	var floor_before := World.floor_height(from.x, from.y)
	for i in range(1, steps + 1):
		var p := from.lerp(to, float(i) / steps)
		if World.blocked(p.x, p.y):
			return false
		var floor_here := World.floor_height(p.x, p.y)
		if absf(floor_here - floor_before) > 0.2:
			return false # no stepping off kerbs or up into the canteen
		floor_before = floor_here
	return true

## Called every frame. screen_right is the camera's right in world x/z, so
## facing follows the screen as the camera turns round corners.
func update(delta: float, screen_right: Vector2, student_at: Vector2) -> void:
	var toward := student_at - ground()
	_shelter(delta)
	noticed = toward.length() < NOTICE
	if toward.length() > AWAY:
		_greeted = false
	if talking:
		_turn_to(toward, screen_right)
		_animate("talk" if speaking else "idle", delta)
		return
	if noticed:
		# stop, look at them, and the first time they come up, wave
		_turn_to(toward, screen_right)
		_target = ground()
		_wait = maxf(_wait, 1.5)
		if not _greeted:
			_greeted = true
			_waving = WAVE_TIME
			waved += 1
			greeting = true
	if _waving > 0.0:
		_waving -= delta
		_animate("wave", delta)
		return
	if noticed:
		_animate("idle", delta)
		return
	if toward.length() < LOOK and (roam <= 0.0 or _wait > 0.0 or (_target - ground()).length() < 0.08):
		_turn_to(toward, screen_right) # standing about, it looks the student's way
	if roam <= 0.0 or _wait > 0.0:
		_wait -= delta
		if _wait <= 0.0 and roam > 0.0:
			_target = _pick_target()
		_animate("idle", delta)
		return
	var to_target := _target - ground()
	if to_target.length() < 0.08:
		_wait = _rng.randf_range(2.0, 6.0)
		_animate("idle", delta)
		return
	var step := to_target.limit_length(SPEED * delta)
	var next := ground() + step
	if World.blocked(next.x, next.y):
		_wait = _rng.randf_range(0.5, 1.5)
		_target = ground()
		_animate("idle", delta)
		return
	place(next)
	_distance += step.length()
	walked += step.length()
	var sideways := step.dot(screen_right)
	if absf(sideways) > 0.0001:
		_facing = signf(sideways)
	_animate("walk", delta)

func _turn_to(toward: Vector2, screen_right: Vector2) -> void:
	if absf(toward.dot(screen_right)) > 0.05:
		_facing = signf(toward.dot(screen_right))

## Opens the umbrella in rain (it springs open over a quarter second), closes it after.
func _shelter(delta: float) -> void:
	var want := 1.0 if rain > 0.35 and not sheltered else 0.0
	_open = move_toward(_open, want, delta * 4.0)
	umbrella.visible = _open > 0.01
	umbrella.scale = Vector3(lerpf(0.25, 1.0, _open), 1.0, lerpf(0.25, 1.0, _open))

func start_talk() -> void:
	talking = true
	_waving = 0.0

func stop_talk() -> void:
	talking = false
	speaking = false
	_wait = _rng.randf_range(1.5, 3.0)

func _animate(kind: String, delta: float) -> void:
	var frames: int = _frames[kind]
	if kind != animation:
		sprite.texture = _sheets[kind]
		sprite.hframes = frames
		# feet on the floor: the sheets are drawn with the sole on the bottom row
		sprite.position.y = sprite.texture.get_height() * DENSITY * 0.5
		animation = kind
		_phase = 0.0
	if kind == "walk":
		sprite.frame = int(_distance / STRIDE * frames) % frames
	else:
		_phase += delta * RATES[kind]
		sprite.frame = int(_phase) % frames
	sprite.flip_h = _facing < 0.0

## Orthographic billboards share the camera direction, not its position.
func face(camera: Camera3D) -> void:
	var forward := -camera.global_transform.basis.z
	sprite.rotation.y = atan2(-forward.x, -forward.z)
	# the umbrella's shaft in front of the body, on the side it faces, as if in its hand
	var right := camera.global_transform.basis.x
	var flat_back := Vector3(-forward.x, 0, -forward.z).normalized()
	umbrella.position = flat_back * 0.12 + Vector3(right.x, 0, right.z).normalized() * 0.1 * _facing
