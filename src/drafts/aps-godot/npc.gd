extends Node3D
## A campus NPC: a lit, alpha-cut sheet from the style reference, animated by the
## boy's rig (assets/drafts/characters/npcs/rig/), who strolls between spots near
## home, stops a while, and talks when the student asks. Posts (roam 0) stay put.

const World := preload("res://world.gd")
## Metres per sprite pixel: the student's density, 85 px for 1.83 m.
const DENSITY := 1.83 / 85.0
const STRIDE := 1.15 # metres per walk cycle, the student's
const SPEED := 1.1
const FRAMES := {"walk": 12, "idle": 24, "talk": 4}
const RATES := {"idle": 4.0, "talk": 6.0}

var id := ""
var display_name := ""
var lines: PackedStringArray = []
var home := Vector2.ZERO
## How far from home it may wander; 0 keeps it at its post.
var roam := 0.0
var sprite := Sprite3D.new()
var contact := Decal.new()
var talking := false
var animation := ""
var walked := 0.0 # metres, for the checks
var _sheets := {}
var _target := Vector2.ZERO
var _wait := 0.0
var _distance := 0.0
var _phase := 0.0
var _facing := 1.0
var _rng := RandomNumberGenerator.new()

func setup(data: Dictionary) -> void:
	id = data.id
	display_name = data.name
	lines = PackedStringArray(data.lines)
	home = data.home
	roam = data.get("roam", 0.0)
	_facing = data.get("facing", 1.0)
	_rng.seed = hash(id)

func _ready() -> void:
	name = "NPC_" + id
	for kind in FRAMES:
		var image := (load("res://sprites/npcs/%s/%s.png" % [id, kind]) as Texture2D).get_image()
		image.generate_mipmaps()
		_sheets[kind] = ImageTexture.create_from_image(image)
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
	place(home)
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
	if talking:
		var toward := student_at - ground()
		if toward.length() > 0.05:
			_facing = signf(toward.dot(screen_right)) if absf(toward.dot(screen_right)) > 0.05 else _facing
		_animate("talk", delta)
		return
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

func start_talk() -> void:
	talking = true

func stop_talk() -> void:
	talking = false
	_wait = _rng.randf_range(1.5, 3.0)

func _animate(kind: String, delta: float) -> void:
	var frames: int = FRAMES[kind]
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
