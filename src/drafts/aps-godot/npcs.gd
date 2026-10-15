extends Node3D
## The campus cast: spawns the NPCs on walkable ground, moves them each frame,
## and runs talking (a hint over whoever is in reach, a speech bubble with
## their lines). Lines are Taglish with a little Kapampangan, like the browser game.

const Npc := preload("res://npc.gd")
const World := preload("res://world.gd")
## How close the student must be to talk, in metres.
const REACH := 1.8

const CAST := [
	{"id": "migo", "name": "Migo", "home": Vector2(8.5, 5.7), "roam": 5.0, "lines": [
		"Uy! May quiz daw sa Math mamaya. Nag-review ka na?",
		"Ako hindi pa. Bahala na si Batman.",
	]},
	{"id": "bea", "name": "Bea", "home": Vector2(14.5, 5.6), "roam": 4.0, "lines": [
		"Ang init ngayon, grabe. Sa canteen muna ako, may aircon kaya do'n?",
		"Joke lang. Pero 'yung halo-halo do'n, sulit.",
	]},
	{"id": "rica", "name": "Rica", "home": Vector2(29.0, 13.5), "roam": 4.0, "lines": [
		"Hinihintay ko si Paolo. Lagi siyang late, promise.",
		"Pag nakita mo siya, sabihin mo nagugutom na ako.",
	]},
	{"id": "paolo", "name": "Paolo", "home": Vector2(24.0, 14.5), "roam": 3.0, "lines": [
		"Si Rica ba hinahanap mo? Nandiyan lang siya sa patio.",
		"Five minutes lang ako late, hindi naman ten. Progress 'yan!",
	]},
	{"id": "bianca", "name": "Bianca", "home": Vector2(-34.0, 52.0), "roam": 5.0, "lines": [
		"Nagdasal muna ako bago exam. Kailangan ko ng lahat ng tulong.",
		"Mayap a gatpanapun! Ingat ka pauwi mamaya.",
	]},
	{"id": "kuya-ben", "name": "Kuya Ben", "home": Vector2(2.3, 4.2), "roam": 0.0, "facing": -1.0, "lines": [
		"Good afternoon, iho! Ingat sa pagtawid, tingin muna sa kaliwa't kanan.",
		"Suot mo lagi ang ID mo, ha. Pag may kailangan ka, nandito lang ako.",
	]},
	{"id": "ate-lorna", "name": "Ate Lorna", "home": Vector2(0, 0), "roam": 0.0, "facing": -1.0, "canteen_stall": 50.8, "lines": [
		"Ano sa'yo, anak? Masarap ang sisig namin ngayon.",
		"Dakal a salamat! Balik ka bukas, may turon na.",
	]},
	{"id": "coach-gab", "name": "Coach Gab", "home": Vector2(53.0, 90.5), "roam": 2.0, "lines": [
		"May practice mamaya sa gym. Sali ka?",
		"Tatlong ikot muna sa court bago laro. Walang reklamo!",
	]},
]

var camera: Camera3D
var student: Node3D
## Turns a world point into a point on the UI layer (set by the scene).
var to_screen: Callable
var cast: Array[Npc] = []
var talking_to: Npc
var line := 0
var bubble := PanelContainer.new()
var bubble_name := Label.new()
var bubble_text := Label.new()
var hint := Label.new()

func _ready() -> void:
	name = "NPCs"
	for data in CAST:
		var npc := Npc.new()
		var entry: Dictionary = data.duplicate()
		if entry.has("canteen_stall"):
			# in front of her stall, inside the canteen hall
			entry.home = World.canteen_world(entry.canteen_stall, -1.6)
		entry.home = free_spot(entry.home)
		npc.setup(entry)
		add_child(npc)
		cast.append(npc)

## The nearest walkable spot to a wished-for one, searching outwards.
static func free_spot(wish: Vector2) -> Vector2:
	if not World.blocked(wish.x, wish.y):
		return wish
	for ring in range(1, 20):
		for i in 16:
			var angle := TAU * i / 16.0
			var spot := wish + Vector2(cos(angle), sin(angle)) * ring * 0.3
			if not World.blocked(spot.x, spot.y):
				return spot
	return wish

## Builds the hint and bubble on a UI layer outside the pixel viewport, so text stays sharp.
func build_ui(parent: Node) -> void:
	var layer := CanvasLayer.new()
	layer.name = "Talk"
	parent.add_child(layer)
	var box := StyleBoxFlat.new()
	box.bg_color = Color("fff6e4")
	box.border_color = Color("263548")
	box.set_border_width_all(3)
	box.set_corner_radius_all(8)
	box.set_content_margin_all(10)
	box.content_margin_left = 14
	box.content_margin_right = 14
	bubble.add_theme_stylebox_override("panel", box)
	bubble.visible = false
	layer.add_child(bubble)
	var stack := VBoxContainer.new()
	stack.add_theme_constant_override("separation", 4)
	bubble.add_child(stack)
	bubble_name.add_theme_font_size_override("font_size", 15)
	bubble_name.add_theme_color_override("font_color", Color("7a2430"))
	stack.add_child(bubble_name)
	bubble_text.add_theme_font_size_override("font_size", 17)
	bubble_text.add_theme_color_override("font_color", Color("263548"))
	bubble_text.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	bubble_text.custom_minimum_size.x = 300
	stack.add_child(bubble_text)
	hint.text = "E  Talk"
	hint.add_theme_font_size_override("font_size", 14)
	hint.add_theme_color_override("font_color", Color("fff1d8"))
	var tag := StyleBoxFlat.new()
	tag.bg_color = Color(0.05, 0.08, 0.11, 0.78)
	tag.set_corner_radius_all(4)
	tag.set_content_margin_all(4)
	tag.content_margin_left = 8
	tag.content_margin_right = 8
	hint.add_theme_stylebox_override("normal", tag)
	hint.visible = false
	layer.add_child(hint)

func _student_ground() -> Vector2:
	return Vector2(student.position.x, student.position.z)

## The NPC close enough to talk to, nearest first, or null.
func in_reach() -> Npc:
	var best: Npc = null
	var best_d := REACH
	for npc in cast:
		var d := npc.ground().distance_to(_student_ground())
		if d < best_d:
			best = npc
			best_d = d
	return best

## Talk to whoever is in reach, or show the next line. True if a key was used for talking.
func interact() -> bool:
	if talking_to != null:
		line += 1
		if line >= talking_to.lines.size():
			_close()
		else:
			_show_line()
		return true
	var npc := in_reach()
	if npc == null:
		return false
	talking_to = npc
	line = 0
	npc.start_talk()
	_show_line()
	return true

func _show_line() -> void:
	bubble_name.text = talking_to.display_name
	bubble_text.text = talking_to.lines[line]
	bubble.visible = true

func _close() -> void:
	if talking_to != null:
		talking_to.stop_talk()
	talking_to = null
	bubble.visible = false

func update(delta: float) -> void:
	var right := Vector2(camera.global_transform.basis.x.x, camera.global_transform.basis.x.z).normalized()
	var at := _student_ground()
	for npc in cast:
		npc.update(delta, right, at)
		npc.face(camera)
	# walking away ends the conversation
	if talking_to != null and talking_to.ground().distance_to(at) > REACH * 1.8:
		_close()
	var near := in_reach() if talking_to == null else null
	hint.visible = near != null and to_screen.is_valid()
	if hint.visible:
		var p: Vector2 = to_screen.call(near.position + Vector3(0, 2.05, 0))
		hint.position = p - Vector2(hint.size.x * 0.5, hint.size.y)
	if bubble.visible and to_screen.is_valid():
		var p: Vector2 = to_screen.call(talking_to.position + Vector3(0, 2.0, 0))
		bubble.reset_size()
		bubble.position = p - Vector2(bubble.size.x * 0.5, bubble.size.y + 6)
