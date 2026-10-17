extends CanvasLayer
## Developer free cam: F2 lifts the camera off the student and lets it fly anywhere to
## look at the campus. The mouse looks round, W/A/S/D (or the arrows) fly along the
## view, Space/E rise, Ctrl/Q sink, Shift goes fast and the wheel sets the speed. F2 or
## Esc lands it back on the student's camera. A dev tool, not part of the game: the
## camera turns perspective while flying (the game's views are orthographic), the camera
## zones and cutaways stop, and the student waits where they were. aps.gd skips its
## camera while `active` and calls `fly()` instead.

const FOV := 65.0
const FAR := 900.0
const LOOK := 0.0025
const SPEEDS: Array[float] = [3.0, 6.0, 12.0, 24.0, 48.0, 96.0]
const FAST := 4.0

var camera: Camera3D
var active := false
var speed_index := 2
var yaw := 0.0
var pitch := 0.0
var _saved := {}
var _badge := Label.new()

func _ready() -> void:
	layer = 10
	_badge.add_theme_font_size_override("font_size", 15)
	_badge.add_theme_color_override("font_color", Color("fff1d8"))
	_badge.add_theme_color_override("font_shadow_color", Color("263548"))
	_badge.add_theme_constant_override("shadow_offset_y", 2)
	var box := StyleBoxFlat.new()
	box.bg_color = Color(0.05, 0.08, 0.11, 0.85)
	box.set_content_margin_all(10)
	box.content_margin_left = 14
	box.content_margin_right = 14
	box.set_corner_radius_all(4)
	box.border_color = Color("c9a24a")
	box.set_border_width_all(1)
	_badge.add_theme_stylebox_override("normal", box)
	_badge.set_anchors_and_offsets_preset(Control.PRESET_CENTER_BOTTOM)
	_badge.grow_horizontal = Control.GROW_DIRECTION_BOTH
	_badge.grow_vertical = Control.GROW_DIRECTION_BEGIN
	_badge.offset_top = -64
	_badge.offset_bottom = -20
	_badge.visible = false
	add_child(_badge)

func speed() -> float:
	return SPEEDS[speed_index]

## Takes the camera from where the game's camera stands, looking the same way.
func enter() -> void:
	if active:
		return
	active = true
	_saved = {"projection": camera.projection, "fov": camera.fov, "near": camera.near, "far": camera.far}
	var forward := -camera.global_basis.z
	yaw = atan2(-forward.x, -forward.z)
	pitch = asin(clampf(forward.y, -1.0, 1.0))
	camera.projection = Camera3D.PROJECTION_PERSPECTIVE
	camera.fov = FOV
	camera.near = 0.1
	camera.far = FAR
	_aim()
	if DisplayServer.get_name() != "headless":
		Input.mouse_mode = Input.MOUSE_MODE_CAPTURED
	_badge.visible = true
	_show_speed()

## Hands the camera back; aps.gd puts it on the student again the next frame.
func leave() -> void:
	if not active:
		return
	active = false
	camera.projection = _saved["projection"]
	camera.fov = _saved["fov"]
	camera.near = _saved["near"]
	camera.far = _saved["far"]
	Input.mouse_mode = Input.MOUSE_MODE_VISIBLE
	_badge.visible = false

func toggle() -> void:
	if active:
		leave()
	else:
		enter()

## The mouse looks and the wheel sets the speed. True when the event was used.
func handle(event: InputEvent) -> bool:
	if event is InputEventMouseMotion:
		yaw -= event.relative.x * LOOK
		pitch = clampf(pitch - event.relative.y * LOOK, -1.5, 1.5)
		_aim()
		return true
	if event is InputEventMouseButton and event.pressed:
		if event.button_index == MOUSE_BUTTON_WHEEL_UP:
			speed_index = mini(speed_index + 1, SPEEDS.size() - 1)
		elif event.button_index == MOUSE_BUTTON_WHEEL_DOWN:
			speed_index = maxi(speed_index - 1, 0)
		elif event.button_index == MOUSE_BUTTON_LEFT:
			Input.mouse_mode = Input.MOUSE_MODE_CAPTURED # after the window lost it
		_show_speed()
		return true
	return false

## Every frame while active: flies by the held keys.
func fly(delta: float) -> void:
	var wish := Vector3(_axis([KEY_D, KEY_RIGHT], [KEY_A, KEY_LEFT]), _axis([KEY_SPACE, KEY_E], [KEY_CTRL, KEY_Q]),
		_axis([KEY_S, KEY_DOWN], [KEY_W, KEY_UP]))
	step(delta, wish, Input.is_physical_key_pressed(KEY_SHIFT))

## wish: x right, y up, z back, in the view's frame (up is always straight up).
func step(delta: float, wish: Vector3, fast := false) -> void:
	if wish == Vector3.ZERO:
		return
	var flat := Vector3(wish.x, 0.0, wish.z)
	var move := camera.global_basis * flat.normalized() if flat != Vector3.ZERO else Vector3.ZERO
	move.y += wish.y
	camera.position += move.normalized() * speed() * (FAST if fast else 1.0) * delta

func _aim() -> void:
	camera.rotation = Vector3(pitch, yaw, 0.0)

func _axis(positive: Array, negative: Array) -> float:
	return float(_any(positive)) - float(_any(negative))

func _any(keys: Array) -> bool:
	for key in keys:
		if Input.is_physical_key_pressed(key):
			return true
	return false

func _show_speed() -> void:
	_badge.text = "Free cam · dev    Mouse  Look    WASD  Fly    Space/Ctrl  Up/Down    Shift  Fast    Wheel  Speed %d m/s    F2 / Esc  Back" % roundi(speed())
