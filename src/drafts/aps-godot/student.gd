extends Node3D
## The playable student: a lit, alpha-cut PixelLab sheet that casts its real
## silhouette, with a soft contact shadow draped over steps by a decal.

const World := preload("res://world.gd")
const HEIGHT := 1.83
const STRIDE := 1.15 # metres per walk cycle, so feet do not slide
const FRAMES := {"boy": {"idle": 12, "walk": 9}, "girl": {"idle": 12, "walk": 6}}

## A foot landed: two steps per walk cycle.
signal stepped

var sprite := Sprite3D.new()
var contact := Decal.new()
var who := "boy"
var animation := ""
var walking := false
var _sheets := {}
var _facing := 1.0
var _phase := 0.0
var _distance := 0.0

func _ready() -> void:
	name = "Student"
	for character in FRAMES:
		_sheets[character] = {}
		for kind in ["idle", "walk"]:
			# Mipmapped copies stay steady when the wide framings shrink the sprite.
			var image := (load("res://sprites/%s/%s.png" % [character, kind]) as Texture2D).get_image()
			image.generate_mipmaps()
			_sheets[character][kind] = ImageTexture.create_from_image(image)
	sprite.name = "LitPixelSprite"
	sprite.shaded = true
	sprite.double_sided = true
	sprite.alpha_cut = SpriteBase3D.ALPHA_CUT_DISCARD
	sprite.alpha_scissor_threshold = 0.35
	sprite.texture_filter = BaseMaterial3D.TEXTURE_FILTER_NEAREST_WITH_MIPMAPS
	sprite.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_DOUBLE_SIDED
	sprite.position.y = HEIGHT * 0.5
	add_child(sprite)
	var image := Image.create(32, 32, false, Image.FORMAT_RGBA8)
	for y in 32:
		for x in 32:
			var d := Vector2(x - 15.5, y - 15.5).length() / 15.5
			image.set_pixel(x, y, Color(0.08, 0.1, 0.11, 0.42 * clampf(1.0 - d, 0.0, 1.0) ** 1.6))
	contact.name = "SoftFootContact"
	contact.texture_albedo = ImageTexture.create_from_image(image)
	contact.size = Vector3(0.75, 0.6, 0.5)
	contact.upper_fade = 0.2
	contact.lower_fade = 0.2
	contact.position.y = 0.1
	add_child(contact)
	set_character(who)

func set_character(character: String) -> void:
	who = character
	_phase = 0.0
	animation = ""
	_animate(false, 0.0)

func place(x: float, z: float) -> bool:
	var at := World.clamp_position(x, z)
	if World.blocked(at.x, at.y):
		return false
	position = Vector3(at.x, World.floor_height(at.x, at.y) + 0.015, at.y)
	return true

## direction is in world x/z; screen_x (the A/D input) picks which way the sprite faces.
func move(direction: Vector2, running: bool, delta: float, screen_x := NAN) -> void:
	var speed := 4.2 if running else 2.4
	var step := direction.normalized() * speed * delta
	var before := Vector2(position.x, position.z)
	place(position.x + step.x, position.z)
	place(position.x, position.z + step.y)
	var travelled := before.distance_to(Vector2(position.x, position.z))
	var steps_before := floori(_distance / STRIDE * 2.0)
	_distance += travelled
	if floori(_distance / STRIDE * 2.0) != steps_before:
		stepped.emit()
	var sideways := direction.x if is_nan(screen_x) else screen_x
	if sideways != 0.0:
		_facing = signf(sideways)
	_animate(travelled > 0.0001, delta)

func _animate(moving: bool, delta: float) -> void:
	walking = moving
	var kind := "walk" if moving else "idle"
	var frames: int = FRAMES[who][kind]
	var key := who + ":" + kind
	if key != animation:
		sprite.texture = _sheets[who][kind]
		sprite.hframes = frames
		sprite.pixel_size = HEIGHT / float(sprite.texture.get_height())
		animation = key
	_phase += delta * 4.0
	sprite.frame = int(_distance / STRIDE * frames) % frames if moving else int(_phase) % frames
	sprite.flip_h = _facing < 0.0

## Orthographic billboards share the camera direction, not its position:
## facing the position twisted the sprite and its shadow as it walked.
func face(camera: Camera3D) -> void:
	var forward := -camera.global_transform.basis.z
	sprite.rotation.y = atan2(-forward.x, -forward.z)
