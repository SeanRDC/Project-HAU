extends CanvasLayer
## Developer fast travel: F1 opens a panel of places; clicking one (or picking it with
## the arrow keys and Enter) fades to black, jumps the student there with the right
## framing, and fades back. A dev tool, not part of the game: it skips walking, doors
## and story. aps.gd owns the places and the jump itself (`chosen`).

signal chosen(index: int)

const FADE_OUT := 0.16
const FADE_IN := 0.22

var panel := PanelContainer.new()
var _shade := ColorRect.new()
var _first: Button
var _busy := false

func _ready() -> void:
	layer = 10
	_shade.color = Color(0.03, 0.03, 0.035, 0.0)
	_shade.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	_shade.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(_shade)

## Builds the panel from the places' names, in the order aps.gd lists them.
func setup(names: Array) -> void:
	var box := StyleBoxFlat.new()
	box.bg_color = Color(0.05, 0.08, 0.11, 0.9)
	box.set_content_margin_all(14)
	box.set_corner_radius_all(4)
	box.border_color = Color("c9a24a")
	box.set_border_width_all(1)
	panel.add_theme_stylebox_override("panel", box)
	panel.set_anchors_and_offsets_preset(Control.PRESET_CENTER)
	panel.grow_horizontal = Control.GROW_DIRECTION_BOTH
	panel.grow_vertical = Control.GROW_DIRECTION_BOTH
	panel.visible = false
	add_child(panel)
	var stack := VBoxContainer.new()
	stack.add_theme_constant_override("separation", 10)
	panel.add_child(stack)
	var title := Label.new()
	title.text = "Fast travel · dev"
	title.add_theme_font_size_override("font_size", 20)
	title.add_theme_color_override("font_color", Color("fff1d8"))
	stack.add_child(title)
	var grid := GridContainer.new()
	grid.columns = 3
	grid.add_theme_constant_override("h_separation", 6)
	grid.add_theme_constant_override("v_separation", 6)
	stack.add_child(grid)
	for i in names.size():
		var button := Button.new()
		button.text = names[i]
		button.custom_minimum_size = Vector2(170, 34)
		button.focus_mode = Control.FOCUS_ALL
		button.pressed.connect(_pick.bind(i))
		grid.add_child(button)
		if i == 0:
			_first = button
	var hint := Label.new()
	hint.text = "Click a place, or arrows + Enter.    F1 / Esc  Close"
	hint.add_theme_font_size_override("font_size", 13)
	hint.add_theme_color_override("font_color", Color("b9b3a6"))
	stack.add_child(hint)

func is_open() -> bool:
	return panel.visible

func toggle() -> void:
	panel.visible = not panel.visible and not _busy
	if panel.visible and _first:
		_first.grab_focus()

func close() -> void:
	panel.visible = false

func _pick(index: int) -> void:
	if _busy:
		return
	_busy = true
	panel.visible = false
	var tween := create_tween()
	tween.tween_property(_shade, "color:a", 1.0, FADE_OUT)
	tween.tween_callback(func() -> void: chosen.emit(index))
	tween.tween_property(_shade, "color:a", 0.0, FADE_IN)
	tween.tween_callback(func() -> void: _busy = false)
