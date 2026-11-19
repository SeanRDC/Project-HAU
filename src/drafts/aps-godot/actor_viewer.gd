extends Control
## Looks at one cutscene character alone (--actor-view, or tools\view-actor.cmd): the
## model on a plain background, drawn at the portraits' pixel density, nothing else.
## Drag with the mouse (or A/D, the arrows) to turn it, wheel (or W/S) to go from the
## whole body to a close-up, 1-8 for its expressions, L to swing the light, Esc to quit.

const Actor := preload("res://actor.gd")
const CLOSE := 0.62 # frame height in metres at the closest
const WHOLE := 2.1 # ... and with the whole body in

var actor: Node3D
var _viewport := SubViewport.new()
var _camera := Camera3D.new()
var _sun := DirectionalLight3D.new()
var _help := Label.new()
var _turn := 0.0
var _height := WHOLE
var _light := -32.0
var _dragging := false

func _init(who := "lance") -> void:
	actor = Actor.new(who)

func _ready() -> void:
	set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	_viewport.own_world_3d = true
	_viewport.msaa_3d = Viewport.MSAA_DISABLED
	add_child(_viewport)
	var environment := Environment.new()
	environment.background_mode = Environment.BG_COLOR
	environment.background_color = Color("c9d3d6")
	environment.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
	environment.ambient_light_color = Color("8f98a8")
	environment.ambient_light_energy = 0.35
	environment.tonemap_mode = Environment.TONE_MAPPER_LINEAR
	var world := WorldEnvironment.new()
	world.environment = environment
	_viewport.add_child(world)
	_sun.shadow_enabled = true
	_viewport.add_child(_sun)
	_viewport.add_child(actor)
	_camera.projection = Camera3D.PROJECTION_ORTHOGONAL
	_camera.keep_aspect = Camera3D.KEEP_HEIGHT
	_viewport.add_child(_camera)
	_camera.current = true
	var picture := TextureRect.new()
	picture.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	picture.texture = _viewport.get_texture()
	picture.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
	picture.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	picture.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_COVERED
	picture.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(picture)
	_help.position = Vector2(16, 12)
	_help.add_theme_color_override("font_color", Color("2b2f33"))
	add_child(_help)
	get_window().size_changed.connect(_frame)
	_frame()

func _frame() -> void:
	# Whole pixels at the portraits' density: the buffer is the window shrunk by a whole number.
	var window := Vector2(get_window().size)
	var scale := maxi(1, roundi(window.y / (_height * Actor.CLOSE_DENSITY)))
	_viewport.size = Vector2i(ceili(window.x / scale), ceili(window.y / scale))
	_camera.size = _height
	var aim := lerpf(1.50, 0.95, inverse_lerp(CLOSE, WHOLE, _height))
	var turn := deg_to_rad(_turn)
	_camera.position = Vector3(sin(turn) * 4.0, aim + 0.1, cos(turn) * 4.0)
	_camera.look_at(Vector3(0.0, aim, 0.0))
	_sun.rotation_degrees = Vector3(-38.0, _light, 0.0)
	_help.text = "%s  ·  %s\nDrag or A/D: turn  ·  Wheel or W/S: zoom  ·  1-8: face  ·  L: light  ·  Esc: quit" \
		% [actor.name, actor.expression]

func _unhandled_input(event: InputEvent) -> void:
	if event is InputEventMouseButton:
		if event.button_index == MOUSE_BUTTON_LEFT or event.button_index == MOUSE_BUTTON_RIGHT:
			_dragging = event.pressed
		elif event.pressed and event.button_index == MOUSE_BUTTON_WHEEL_UP:
			_zoom(-0.12)
		elif event.pressed and event.button_index == MOUSE_BUTTON_WHEEL_DOWN:
			_zoom(0.12)
	elif event is InputEventMouseMotion and _dragging:
		_turn -= event.relative.x * 0.5
		_frame()
	elif event is InputEventKey and event.pressed:
		var key: int = event.keycode
		if key >= KEY_1 and key <= KEY_8:
			actor.set_expression(Actor.EXPRESSIONS[key - KEY_1])
			_frame()
		elif key == KEY_L:
			_light = wrapf(_light + 45.0, -180.0, 180.0)
			_frame()
		elif key == KEY_ESCAPE:
			get_tree().quit()

func _process(delta: float) -> void:
	var spin := Input.get_axis("ui_left", "ui_right")
	if Input.is_key_pressed(KEY_A):
		spin -= 1.0
	if Input.is_key_pressed(KEY_D):
		spin += 1.0
	if spin != 0.0:
		_turn += spin * 90.0 * delta
		_frame()
	if Input.is_key_pressed(KEY_W) or Input.is_action_pressed("ui_up"):
		_zoom(-1.2 * delta)
	if Input.is_key_pressed(KEY_S) or Input.is_action_pressed("ui_down"):
		_zoom(1.2 * delta)

func _zoom(by: float) -> void:
	_height = clampf(_height + by, CLOSE, WHOLE)
	_frame()
