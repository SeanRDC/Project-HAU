extends Node3D
## The campus cast: spawns the NPCs on walkable ground, moves them each frame,
## and runs talking the way the browser game does: a prompt over whoever is in
## reach, then a speech bubble with their portrait and name that types each line
## out with a blip in their voice. Lines are Taglish with a little Kapampangan.

const Npc := preload("res://npc.gd")
const World := preload("res://world.gd")
const Opening := preload("res://opening.gd")
## How close the student must be to talk, in metres.
const REACH := 1.8

## Each NPC's talks, first match wins: "when" lists what must be remembered,
## "not" what must not be. A step is a line, or a question with replies to pick:
## {"ask": line, "choices": [{"text": what you say, "reply": [steps], "remember": key}]}.
## Every talk that ends also remembers "met.<id>". Some keys carry between people:
## Rica asks you to pass a message to Paolo, and Ate Lorna hears from Bea.
const CAST := [
	{"id": "migo", "name": "Migo", "home": Vector2(8.5, 5.7), "roam": 5.0, "umbrella": Color("2f4f7a"), "talks": [
		{"when": ["migo.reviewed"], "say": ["O, ikaw 'yung nag-review! Pakopya mamaya... joke lang. Good luck sa quiz!"]},
		{"when": ["migo.cramming"], "say": ["Tara na sa canteen, review tayo. Libre ko na 'yung tubig."]},
		{"say": [
			"Uy! May quiz daw sa Math mamaya.",
			{"ask": "Nag-review ka na?", "choices": [
				{"text": "Oo, kagabi pa.", "remember": "migo.reviewed", "reply": ["Sana all. Ako, nakatulog sa unang page."]},
				{"text": "Hindi pa rin, ikaw?", "remember": "migo.cramming", "reply": ["Ako rin! Sabay na tayo mag-review mamaya, sa canteen."]},
			]},
		]},
	]},
	{"id": "bea", "name": "Bea", "home": Vector2(14.5, 5.6), "roam": 4.0, "umbrella": Color("d47b8e"), "talks": [
		{"when": ["bea.turon"], "say": ["Turon pa rin ba? Sige na nga, try ko rin bukas."]},
		{"when": ["met.bea"], "say": ["Ang init pa rin, grabe. Halo-halo talaga ang sagot."]},
		{"say": [
			"Ang init ngayon, grabe. 'Yung halo-halo sa canteen, sulit.",
			{"ask": "Ikaw, ano'ng paborito mo do'n?", "choices": [
				{"text": "Halo-halo rin!", "reply": ["Ayun! Sabay tayo mamaya pag-break."]},
				{"text": "Turon ni Ate Lorna.", "remember": "bea.turon", "reply": ["Ay, oo, 'yung may langka! Sasabihin ko kay Ate Lorna na fan ka niya."]},
			]},
		]},
	]},
	{"id": "rica", "name": "Rica", "home": Vector2(29.0, 13.5), "roam": 4.0, "umbrella": Color("6a4a8a"), "talks": [
		{"when": ["paolo.told"], "say": ["Salamat ha! Dumating na rin, may dala pang siopao. Pinatawad ko na."]},
		{"when": ["rica.asked"], "say": ["Wala pa rin si Paolo? Grabe na talaga 'to."]},
		{"when": ["met.rica"], "say": ["Bahala na si Paolo. Kakain na lang ako mag-isa."]},
		{"say": [
			"Hinihintay ko si Paolo. Lagi siyang late, promise.",
			{"ask": "Pag nakita mo siya, pakisabi gutom na ako?", "choices": [
				{"text": "Sige, sasabihin ko.", "remember": "rica.asked", "reply": ["Salamat! Nandiyan lang 'yun sa patio, malamang."]},
				{"text": "I-text mo na lang siya.", "reply": ["Na-seen lang ako. Classic Paolo."]},
			]},
		]},
	]},
	{"id": "paolo", "name": "Paolo", "home": Vector2(24.0, 14.5), "roam": 3.0, "umbrella": Color("3a5a3a"), "talks": [
		{"when": ["paolo.told"], "say": ["Papunta na nga ako. Five minutes lang, promise."]},
		{"when": ["rica.asked"], "say": [
			"Uy. Nakita mo ba si Rica?",
			{"ask": "May sinabi ba siya?", "choices": [
				{"text": "Gutom na raw siya.", "remember": "paolo.told", "reply": ["Lagot. Bibili muna ako ng siopao, peace offering."]},
				{"text": "Wala naman.", "reply": ["Hay, salamat. Akala ko galit na."]},
			]},
		]},
		{"say": ["Si Rica ba hinahanap mo? Nandiyan lang siya sa patio.", "Five minutes lang ako late, hindi naman ten. Progress 'yan!"]},
	]},
	{"id": "bianca", "name": "Bianca", "home": Vector2(-34.0, 52.0), "roam": 5.0, "umbrella": Color("8a3a3a"), "talks": [
		{"when": ["bianca.cheered"], "say": ["Salamat sa kanina, ha. Medyo kumalma ako. Mayap a gatpanapun!"]},
		{"when": ["met.bianca"], "say": ["Isang dasal pa. Para sigurado."]},
		{"say": [
			"Nagdasal muna ako bago exam. Kailangan ko ng lahat ng tulong.",
			{"ask": "Kinakabahan ka rin ba sa exams?", "choices": [
				{"text": "Kaya mo 'yan!", "remember": "bianca.cheered", "reply": ["Salamat... Kailangan ko talaga 'yon ngayon."]},
				{"text": "Oo, sobra.", "reply": ["Isasama na kita sa dasal ko. Ingat ka pauwi mamaya."]},
			]},
		]},
	]},
	{"id": "kuya-ben", "name": "Kuya Ben", "home": Vector2(2.3, 4.2), "roam": 0.0, "facing": -1.0, "umbrella": Color("2b2b30"), "talks": [
		{"when": ["ben.no_id"], "say": ["Bukas, dala mo na ID mo ha. Pinalusot lang kita ngayon."]},
		{"when": ["met.kuya-ben"], "say": ["Ingat sa pagtawid, iho. Tingin muna sa kaliwa't kanan."]},
		{"say": [
			"Good afternoon, iho! Ingat sa pagtawid, tingin muna sa kaliwa't kanan.",
			{"ask": "Suot mo ba ang ID mo?", "choices": [
				{"text": "Opo, Kuya!", "reply": ["Ayos! Pag may kailangan ka, nandito lang ako."]},
				{"text": "Naiwan ko po...", "remember": "ben.no_id", "reply": ["Hala. Sige, ngayon lang, ha. Bukas, 'wag mo nang kalimutan."]},
			]},
		]},
	]},
	{"id": "ate-lorna", "name": "Ate Lorna", "home": Vector2(0, 0), "roam": 0.0, "facing": -1.0, "canteen_stall": 50.55, "talks": [
		{"when": ["lorna.ordered"], "say": ["O, ikaw ulit! Balik ka bukas, may turon na."]},
		{"when": ["bea.turon"], "not": ["met.ate-lorna"], "say": [
			"Ikaw pala 'yung mahilig sa turon, sabi ni Bea!",
			{"ask": "Itatabi kita ng isa bukas?", "choices": [
				{"text": "Opo, salamat po!", "remember": "lorna.ordered", "reply": ["Dakal a salamat, anak!"]},
				{"text": "Next time na lang po.", "reply": ["Sige, anak. Nandito lang ako."]},
			]},
		]},
		{"when": ["met.ate-lorna"], "say": ["Dakal a salamat! Balik ka bukas, may turon na."]},
		{"say": [
			{"ask": "Ano sa'yo, anak? Masarap ang sisig namin ngayon.", "choices": [
				{"text": "Isang sisig po!", "remember": "lorna.ordered", "reply": ["Ayan, mainit pa. Dakal a salamat!"]},
				{"text": "Titingin-tingin lang po.", "reply": ["Sige lang, anak. Balik ka pag gutom ka na."]},
			]},
		]},
	]},
	# characters still being made, standing in front of APS 104-105 to see them in the game:
	# idle only, nothing to say yet (no prompt shows over them)
	{"id": "gf", "name": "GF (prototype)", "home": Vector2(-33.5, 5.2), "roam": 0.0, "facing": 1.0, "talks": []},
	{"id": "blonde", "name": "Blonde short hair", "home": Vector2(-28.5, 5.4), "roam": 0.0, "facing": -1.0, "umbrella": Color("c98a3a"), "talks": []},
	{"id": "coach-gab", "name": "Coach Gab", "home": Vector2(53.0, 90.5), "roam": 2.0, "umbrella": Color("245a3c"), "talks": [
		{"when": ["gab.joined"], "say": ["O, nandito ka na! Tatlong ikot muna sa court bago laro. Walang reklamo!"]},
		{"when": ["met.coach-gab"], "say": ["Bukas pa rin ang slot sa team. Isip-isip ka."]},
		{"say": [
			{"ask": "May practice mamaya sa gym. Sali ka?", "choices": [
				{"text": "Sali ako, Coach!", "remember": "gab.joined", "reply": ["Ayan! Alas-singko, sa court. Magdala ka ng tubig."]},
				{"text": "Next time po.", "reply": ["Sige. Pero tandaan mo, bukas lagi ang pinto ng gym."]},
			]},
		]},
	]},
]

## Each speaker's voice for the text blips (Hz); the browser game's where they had one.
const VOICES := {"migo": 410.0, "bea": 659.0, "rica": 622.0, "paolo": 330.0, "bianca": 698.0,
	"kuya-ben": 220.0, "ate-lorna": 494.0, "coach-gab": 210.0}
## What each NPC says in passing as it waves: "first" until the student has talked to
## them, "met" after. Taglish with a little Kapampangan, like their talks.
const HELLOS := {
	"migo": {"first": ["Uy, pre!", "Musta? Ready ka na sa quiz?"], "met": ["Uy, ikaw ulit! Review tayo?", "O, tara canteen mamaya!"]},
	"bea": {"first": ["Hi! Ang init, no?", "Uy, hello!"], "met": ["Hi ulit! Halo-halo mamaya?", "Uy! Kumusta na ka?"]},
	"rica": {"first": ["Hello! Busy ka?", "Hi, hi!"], "met": ["Uy, ikaw pala!", "Hi ulit! Salamat kanina."]},
	"paolo": {"first": ["Yo.", "Uy, sup."], "met": ["Uy, pre. Ikaw ulit.", "O, ano'ng balita?"]},
	"bianca": {"first": ["Hello! Ganda ng chapel, no?", "Hi po!"], "met": ["Hi ulit!", "Uy, kumusta na ka?"]},
	"kuya-ben": {"first": ["Magandang araw po!", "Ingat po sa daan!"], "met": ["O, ikaw ulit! Ingat.", "Musta ang klase?"]},
	"ate-lorna": {"first": ["Kain ka muna, anak!", "Turon, mainit pa!"], "met": ["O, balik ka! May bagong luto.", "Anak, kumain ka na?"]},
	"coach-gab": {"first": ["Uy! Galaw-galaw!", "Practice mamaya, ha!"], "met": ["Ayan na ang atleta ko!", "Tubig, 'wag kalimutan!"]},
	"default": {"first": ["Hi!", "Uy, hello!", "Kumusta?"], "met": ["Uy, ikaw ulit!", "Hello ulit!"]},
}
## How likely each NPC is to say hello as it waves (the rest of the time it just waves):
## the friendly ones most times, the others now and then. Anyone not listed only waves.
const CHATTY := {"ate-lorna": 0.8, "kuya-ben": 0.75, "coach-gab": 0.7, "bea": 0.6, "migo": 0.5,
	"rica": 0.4, "bianca": 0.35, "paolo": 0.25}
## Lines for the hour and the weather, shared by everyone: in the rain most hellos are
## about it, and now and then someone greets the time of day instead.
const RAIN_HELLOS := ["Ingat, umuulan!", "May payong ka?", "Basang-basa na tayo!"]
const TIME_HELLOS := {
	"morning": ["Magandang umaga!", "Mayap a abak!"],
	"noon": ["Ang init, grabe!", "Kain na tayo!"],
	"afternoon": ["Magandang hapon!", "Mayap a gatpanapun!"],
	"night": ["Gabi na, uwi na!", "Mayap a bengi!", "Ingat pauwi!"],
}
## Seconds a hello stays up (it types out, then fades over the last half second).
const HELLO_TIME := 2.8
## Letters per second as a line types out, as in the browser game.
const CHARS_PER_SECOND := 42.0
## The browser game's dialogue colours.
const PAPER := Color("fbf5e6")
const INK := Color("2a2030")
const MAROON := Color("7c1f2c")
const CREAM := Color("fbeed0")
const BUBBLE_TEXT_WIDTH := 360.0

var camera: Camera3D
var student: Node3D
## Plays the voice blips (set by the scene).
var sound: Node
## Turns a world point into a point on the UI layer (set by the scene).
var to_screen: Callable
var cast: Array[Npc] = []
var talking_to: Npc
## What the student has said and done, as keys (see CAST). Kept for the session.
var memory := {}
## How hard it is raining (set by the scene), for the umbrellas and the hellos.
var rain := 0.0
## The hour (set by the scene), for the hellos.
var hour := 16.5
## The hellos up now: {npc, panel, label, age, shown}.
var hellos: Array = []
var _hello_rng := RandomNumberGenerator.new()
var _layer: CanvasLayer
## The steps still to come in this talk, and the replies on offer now.
var queue: Array = []
var options: Array = []
var choice := 0
var _said := ""
var choice_panel := PanelContainer.new()
var choice_list := VBoxContainer.new()
var shown := 0.0 # letters of the current line out so far
var age := 0.0 # seconds the current line has been up
var bubble := Control.new()
var bubble_panel := PanelContainer.new()
var bubble_shadow := Panel.new()
var bubble_name := Label.new()
var bubble_tag := PanelContainer.new()
var bubble_text := Label.new()
var portrait := TextureRect.new()
var tail := Polygon2D.new()
var more := Polygon2D.new()
var hint := PanelContainer.new()
var hint_label := Label.new()
var _portraits := {}
var _time := 0.0

func _ready() -> void:
	name = "NPCs"
	_hello_rng.seed = 2026
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
		var portrait_path := "res://sprites/npcs/%s/portrait.png" % npc.id
		if ResourceLoader.exists(portrait_path):
			_portraits[npc.id] = load(portrait_path)

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

static func _box(color: Color, radius: int, margin := 0) -> StyleBoxFlat:
	var box := StyleBoxFlat.new()
	box.bg_color = color
	box.set_corner_radius_all(radius)
	box.set_content_margin_all(margin)
	return box

## The talk prompt and the speech bubble, styled like the browser game's, on a UI
## layer outside the pixel viewport so the text stays sharp.
func build_ui(parent: Node) -> void:
	var layer := CanvasLayer.new()
	layer.name = "Talk"
	parent.add_child(layer)
	_layer = layer
	# the opening's lettering font for everything said (the hint, the bubble, the replies)
	var lettering := Theme.new()
	lettering.default_font = Opening.lettering()
	for control: Control in [hint, bubble, choice_panel]:
		control.theme = lettering
	# "E  Kausapin si ..." over whoever is in reach
	hint.add_theme_stylebox_override("panel", _box(Color(22 / 255.0, 16 / 255.0, 34 / 255.0, 0.78), 16, 5))
	var row := HBoxContainer.new()
	row.add_theme_constant_override("separation", 8)
	hint.add_child(row)
	var key := PanelContainer.new()
	var cap := _box(PAPER, 5)
	cap.content_margin_left = 7
	cap.content_margin_right = 7
	cap.shadow_color = Color(0, 0, 0, 0.25)
	cap.shadow_offset = Vector2(0, 2)
	key.add_theme_stylebox_override("panel", cap)
	var key_label := Label.new()
	key_label.text = "E"
	key_label.add_theme_font_size_override("font_size", 13)
	key_label.add_theme_color_override("font_color", INK)
	key.add_child(key_label)
	row.add_child(key)
	hint_label.add_theme_font_size_override("font_size", 15)
	hint_label.add_theme_color_override("font_color", PAPER)
	row.add_child(hint_label)
	hint.visible = false
	layer.add_child(hint)
	# the bubble: shadow, paper, the portrait card, the words, a tail and a name tag
	bubble.visible = false
	layer.add_child(bubble)
	bubble_shadow.add_theme_stylebox_override("panel", _box(Color(20 / 255.0, 10 / 255.0, 35 / 255.0, 0.28), 12))
	bubble.add_child(bubble_shadow)
	var paper := _box(PAPER, 12, 10)
	paper.content_margin_right = 16
	bubble_panel.add_theme_stylebox_override("panel", paper)
	bubble.add_child(bubble_panel)
	var inner := HBoxContainer.new()
	inner.add_theme_constant_override("separation", 12)
	bubble_panel.add_child(inner)
	var card := PanelContainer.new()
	card.add_theme_stylebox_override("panel", _box(Color(124 / 255.0, 31 / 255.0, 44 / 255.0, 0.1), 7))
	portrait.custom_minimum_size = Vector2(96, 96)
	portrait.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	portrait.stretch_mode = TextureRect.STRETCH_SCALE
	portrait.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
	card.add_child(portrait)
	inner.add_child(card)
	bubble_text.add_theme_font_size_override("font_size", 17)
	bubble_text.add_theme_color_override("font_color", INK)
	bubble_text.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	bubble_text.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	bubble_text.size_flags_vertical = Control.SIZE_EXPAND_FILL
	inner.add_child(bubble_text)
	tail.color = PAPER
	tail.polygon = PackedVector2Array([Vector2(-10, -1), Vector2(10, -1), Vector2(0, 13)])
	bubble.add_child(tail)
	more.color = MAROON
	more.polygon = PackedVector2Array([Vector2(-6, 0), Vector2(6, 0), Vector2(0, 8)])
	bubble.add_child(more)
	var tag := _box(MAROON, 8, 3)
	tag.content_margin_left = 10
	tag.content_margin_right = 10
	bubble_tag.add_theme_stylebox_override("panel", tag)
	bubble_name.add_theme_font_size_override("font_size", 13)
	bubble_name.add_theme_color_override("font_color", CREAM)
	bubble_tag.add_child(bubble_name)
	bubble.add_child(bubble_tag)
	# your replies: a dark card at the bottom of the screen, the picked one in maroon
	choice_panel.add_theme_stylebox_override("panel", _box(Color(22 / 255.0, 16 / 255.0, 34 / 255.0, 0.86), 12, 10))
	choice_list.add_theme_constant_override("separation", 4)
	choice_panel.add_child(choice_list)
	choice_panel.visible = false
	layer.add_child(choice_panel)

func _student_ground() -> Vector2:
	return Vector2(student.position.x, student.position.z)

## The NPC close enough to talk to, nearest first, or null.
func in_reach() -> Npc:
	var best: Npc = null
	var best_d := REACH
	for npc in cast:
		if npc.talks.is_empty():
			continue # nothing to say yet
		var d := npc.ground().distance_to(_student_ground())
		if d < best_d:
			best = npc
			best_d = d
	return best

## Words of the current line are still coming out.
func typing() -> bool:
	return talking_to != null and shown < _said.length()

## The line in the bubble now.
func said() -> String:
	return _said

## Replies are on offer: the question is all out.
func choosing() -> bool:
	return talking_to != null and not options.is_empty() and not typing()

## What this NPC says now, by what has happened: the first talk that fits.
func script_for(npc: Npc) -> Array:
	for talk: Dictionary in npc.talks:
		var needs: Array = talk.get("when", [])
		var blocks: Array = talk.get("not", [])
		if needs.all(func(key: String) -> bool: return memory.has(key)) \
				and not blocks.any(func(key: String) -> bool: return memory.has(key)):
			return (talk.say as Array).duplicate()
	return []

## Like the browser game: a key while the words come out shows the whole line,
## the next one moves on (or says the highlighted reply), and after the last
## line the talk ends. True if the key was used for talking.
func interact() -> bool:
	if talking_to != null:
		if typing():
			shown = _said.length()
			bubble_text.visible_characters = -1
		elif choosing():
			pick(choice)
		elif not queue.is_empty():
			_next()
		else:
			_close()
		return true
	var npc := in_reach()
	if npc == null:
		return false
	talking_to = npc
	queue = script_for(npc)
	npc.start_talk()
	_next()
	return true

## Moves the highlight up or down the replies.
func move_choice(step: int) -> void:
	if choosing():
		choice = wrapi(choice + step, 0, options.size())
		_mark_choice()
		if sound != null:
			sound.blip(520.0 + choice * 60.0)

## Says reply index: remembers it, then their answer, then the rest of the talk.
func pick(index: int) -> bool:
	if not choosing() or index < 0 or index >= options.size():
		return false
	var option: Dictionary = options[index]
	if option.has("remember"):
		memory[option.remember] = true
	options = []
	choice_panel.visible = false
	queue = (option.get("reply", []) as Array) + queue
	if queue.is_empty():
		_close()
	else:
		_next()
	return true

func _next() -> void:
	var step: Variant = queue.pop_front()
	options = []
	choice = 0
	if step is Dictionary:
		_said = step.ask
		options = step.choices
		_fill_choices()
	else:
		_said = str(step)
	_show_line()

static func _reply_look(color: Color) -> StyleBoxFlat:
	var look := _box(color, 7)
	look.content_margin_left = 14
	look.content_margin_right = 18
	look.content_margin_top = 5
	look.content_margin_bottom = 5
	return look

func _fill_choices() -> void:
	for old in choice_list.get_children():
		choice_list.remove_child(old)
		old.queue_free()
	for i in options.size():
		var button := Button.new()
		button.text = "%d   %s" % [i + 1, options[i].text]
		button.alignment = HORIZONTAL_ALIGNMENT_LEFT
		button.focus_mode = Control.FOCUS_NONE
		button.add_theme_font_size_override("font_size", 16)
		button.add_theme_color_override("font_color", PAPER)
		button.add_theme_color_override("font_hover_color", CREAM)
		button.add_theme_color_override("font_pressed_color", CREAM)
		button.add_theme_stylebox_override("pressed", _reply_look(MAROON))
		button.mouse_entered.connect(func() -> void:
			choice = i
			_mark_choice())
		button.pressed.connect(func() -> void: pick(i))
		choice_list.add_child(button)
	_mark_choice()

func _mark_choice() -> void:
	var buttons := choice_list.get_children()
	for i in buttons.size():
		var look := _reply_look(MAROON if i == choice else Color(0, 0, 0, 0))
		(buttons[i] as Button).add_theme_stylebox_override("normal", look)
		(buttons[i] as Button).add_theme_stylebox_override("hover", look)

func _show_line() -> void:
	shown = 0.0
	age = 0.0
	bubble_name.text = talking_to.display_name
	bubble_text.text = _said
	bubble_text.visible_characters = 0
	# sized to the whole line, so the bubble does not grow while it types
	var font := bubble_text.get_theme_font("font")
	var width := font.get_string_size(_said, HORIZONTAL_ALIGNMENT_LEFT, -1, 17).x + 2
	bubble_text.custom_minimum_size.x = minf(width, BUBBLE_TEXT_WIDTH)
	bubble.visible = true

func _close() -> void:
	if talking_to != null:
		talking_to.stop_talk()
		memory["met." + talking_to.id] = true
	talking_to = null
	queue = []
	options = []
	choice_panel.visible = false
	bubble.visible = false

func update(delta: float) -> void:
	_time += delta
	var right := Vector2(camera.global_transform.basis.x.x, camera.global_transform.basis.x.z).normalized()
	var at := _student_ground()
	if talking_to != null:
		var said := _said
		age += delta
		var before := int(shown)
		shown = minf(said.length(), shown + delta * CHARS_PER_SECOND)
		# a blip every third letter, never on a space, in the speaker's voice
		if int(shown) != before and before % 3 == 0 and said[before] != " " and sound != null:
			sound.blip(VOICES.get(talking_to.id, 300.0))
		bubble_text.visible_characters = int(shown) if typing() else -1
		talking_to.speaking = typing()
	for npc in cast:
		npc.rain = rain
		npc.update(delta, right, at)
		npc.face(camera)
		if npc.greeting:
			npc.greeting = false
			if npc != talking_to and _layer != null and _hello_rng.randf() < CHATTY.get(npc.id, 0.0):
				_say_hello(npc)
	# being moved away ends the conversation
	if talking_to != null and talking_to.ground().distance_to(at) > REACH * 1.8:
		_close()
	var near := in_reach() if talking_to == null else null
	hint.visible = near != null and to_screen.is_valid()
	if hint.visible:
		hint_label.text = "Kausapin si " + near.display_name
		hint.reset_size()
		var p: Vector2 = to_screen.call(near.position + Vector3(0, 2.05, 0))
		hint.position = p - Vector2(hint.size.x * 0.5, hint.size.y + 4.0 - sin(_time * 3.0) * 3.0)
	if bubble.visible and to_screen.is_valid():
		_place_bubble()
	_update_hellos(delta)
	choice_panel.visible = choosing()
	if choice_panel.visible:
		choice_panel.reset_size()
		var view := choice_panel.get_viewport_rect().size
		choice_panel.position = Vector2((view.x - choice_panel.size.x) * 0.5, view.y - choice_panel.size.y - 26.0)

## What `npc` says as it waves: about the rain when it is raining (mostly), now and then
## the time of day, else its own line, which changes once the student has met them.
func hello_for(npc: Npc) -> String:
	if rain > 0.35 and _hello_rng.randf() < 0.65:
		return RAIN_HELLOS[_hello_rng.randi_range(0, RAIN_HELLOS.size() - 1)]
	if _hello_rng.randf() < 0.35:
		var time := "night" if hour >= 18.0 or hour < 6.0 else ("morning" if hour < 11.0 else ("noon" if hour < 14.0 else "afternoon"))
		var lines: Array = TIME_HELLOS[time]
		return lines[_hello_rng.randi_range(0, lines.size() - 1)]
	var own: Dictionary = HELLOS.get(npc.id, HELLOS["default"])
	var said: Array = own["met"] if memory.has("met." + npc.id) else own["first"]
	return said[_hello_rng.randi_range(0, said.size() - 1)]

## A small paper bubble over the NPC's head that types its hello out in its voice, then
## fades. It never stops the student; a new hello replaces the NPC's last one.
func _say_hello(npc: Npc) -> void:
	_drop_hello(npc)
	var panel := PanelContainer.new()
	panel.theme = bubble.theme
	panel.add_theme_stylebox_override("panel", _box(PAPER, 10, 6))
	var label := Label.new()
	label.text = hello_for(npc)
	label.visible_characters = 0
	label.add_theme_font_size_override("font_size", 14)
	label.add_theme_color_override("font_color", INK)
	panel.add_child(label)
	_layer.add_child(panel)
	hellos.append({"npc": npc, "panel": panel, "label": label, "age": 0.0, "shown": 0.0})

func _drop_hello(npc: Npc) -> void:
	for hello in hellos.duplicate():
		if hello.npc == npc:
			(hello.panel as Control).queue_free()
			hellos.erase(hello)

func _update_hellos(delta: float) -> void:
	for hello in hellos.duplicate():
		var npc: Npc = hello.npc
		hello.age += delta
		if hello.age > HELLO_TIME or npc == talking_to or not to_screen.is_valid():
			_drop_hello(npc)
			continue
		var label: Label = hello.label
		var before := int(hello.shown)
		hello.shown = minf(label.text.length(), hello.shown + delta * CHARS_PER_SECOND)
		label.visible_characters = int(hello.shown)
		if int(hello.shown) != before and before % 4 == 0 and label.text[before] != " " and sound != null:
			sound.blip(VOICES.get(npc.id, 300.0))
		var panel: Control = hello.panel
		panel.modulate.a = clampf((HELLO_TIME - hello.age) / 0.5, 0.0, 1.0)
		panel.reset_size()
		# over the head, above the talk prompt when that is up too
		var lift := 2.75 if hint.visible and in_reach() == npc else 2.3
		var p: Vector2 = to_screen.call(npc.position + Vector3(0, lift, 0))
		panel.position = p - Vector2(panel.size.x * 0.5, panel.size.y)

func _place_bubble() -> void:
	bubble_panel.reset_size()
	var size := bubble_panel.size
	# the bubble's own (window) viewport, not the pixel world this node lives in
	var view := bubble.get_viewport_rect().size
	var anchor: Vector2 = to_screen.call(talking_to.position + Vector3(0, 2.0, 0))
	# the bubble pops up: fading in and settling a few pixels
	var pop := minf(1.0, age * 9.0)
	var x := clampf(anchor.x - size.x * 0.5, 12.0, maxf(12.0, view.x - size.x - 12.0))
	var y := maxf(34.0, anchor.y - size.y - 18.0) + (1.0 - pop) * 10.0
	bubble.position = Vector2(x, y)
	bubble.modulate.a = pop
	bubble_shadow.position = Vector2(2, 5)
	bubble_shadow.size = size
	tail.position = Vector2(clampf(anchor.x - x, 20.0, size.x - 20.0), size.y)
	bubble_tag.reset_size()
	bubble_tag.position = Vector2(118, -bubble_tag.size.y * 0.55)
	# the mouth moves while the words come out; now and then a blink
	var frame := 0
	if typing() and fmod(age, 0.22) < 0.12:
		frame = 1
	elif fmod(age * 0.37 + 0.3, 1.0) > 0.96:
		frame = 2
	var atlas := AtlasTexture.new()
	atlas.atlas = _portraits[talking_to.id]
	atlas.region = Rect2(frame * 32, 0, 32, 32)
	portrait.texture = atlas
	# a blinking arrow once the line is all out
	more.visible = not typing() and options.is_empty() and int(age * 2.5) % 2 == 0
	more.position = Vector2(size.x - 22, size.y - 18)
