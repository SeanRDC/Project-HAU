extends CanvasLayer
## The opening: a quiet memory of HAU before the game starts, told like a manga page by
## page. Panels fade in one at a time and drift slowly; the narration types out beside
## them in Tagalog. Any key or click moves on; holding Space (or Esc) skips the rest. The
## game waits paused behind it (aps.gd).
##
## Each panel's picture is res://opening/panels/<id>.png when it has been drawn (see
## opening/README.md for what to draw), else res://opening/photos/<id>.jpg (a campus
## photo inked by shaders/manga.gdshader), else a grey card naming the picture to make.

signal finished

const PAPER := Color("f4f1ea")
const PEN := Color("1c1b19")
const CARD := Color("dedad1")
const MANGA := preload("res://shaders/manga.gdshader")
## The page sits inside these margins (fractions of the screen).
const MARGIN := Vector2(0.05, 0.07)
## Narration speed, characters a second, and the blip under it (Hz, a low voice).
const CPS := 32.0
const VOICE := 260.0
## How long a panel drifts across its slack, and how much bigger than its frame it is.
const DRIFT_TIME := 14.0
const SLACK := 1.1
## How long Space is held to skip; a tap still moves on like any key.
const HOLD := 0.9

## Pages in order. Each panel: id (its picture; "" for none), rect [x, y, w, h] in the page,
## lines [[text, where]] with where one of L, R (top corners), BL, BR (bottom corners), C.
## "frame": false leaves off the border (the blank, remembered pages); "marks" scatters
## pencil specks; "dark" is a black panel with white narration; "draw" says what the
## picture shows, for its grey card until it is drawn.
const PAGES := [
	{"panels": [
		{"id": "", "rect": [0.0, 0.0, 1.0, 0.55], "frame": false, "marks": true, "lines": [["Naaalala ko...", "C"]]},
		{"id": "alaala", "rect": [0.0, 0.55, 1.0, 0.45], "frame": false,
			"draw": "Nakahigang anino ng isang mukha, nakatingala (lapis)"},
	]},
	{"panels": [
		{"id": "langit", "rect": [0.0, 0.0, 1.0, 0.36], "draw": "Ulap sa langit ng Angeles, pinong guhit",
			"lines": [["Ang lugar na 'yon...", "C"]]},
		{"id": "fountain", "rect": [0.0, 0.40, 1.0, 0.60],
			"lines": [["Ang unibersidad na pinasukan ko noon...", "R"], ["...ang Holy Angel.", "L"]]},
	]},
	{"panels": [
		{"id": "walkway", "rect": [0.0, 0.0, 1.0, 0.46],
			"lines": [["Mahahaba ang mga walkway sa boulevard...", "R"], ["...at laging may sumisilong kapag umuulan.", "L"]]},
		{"id": "chapel", "rect": [0.0, 0.50, 0.49, 0.50], "lines": [["Sa dulo ng daan, ang kapilya.", "L"]]},
		{"id": "aps", "rect": [0.51, 0.50, 0.49, 0.50], "lines": [["At sa tabi ng kalsada...", "R"], ["...ang APS.", "BL"]]},
	]},
	{"panels": [
		{"id": "hallway", "rect": [0.0, 0.0, 0.38, 1.0],
			"lines": [["Sa pasilyo ng APS...", "L"], ["...laging may nagmamadali papuntang canteen.", "BR"]]},
		{"id": "stairs", "rect": [0.40, 0.0, 0.29, 1.0], "lines": [["Matarik ang hagdan paakyat.", "R"]]},
		{"id": "corridor", "rect": [0.71, 0.0, 0.29, 1.0], "lines": [["Sa ikalawang palapag ang una kong klase.", "BL"]]},
	]},
	{"panels": [
		{"id": "canteen", "rect": [0.0, 0.0, 1.0, 0.48],
			"lines": [["Sa canteen, si Ate Lorna...", "R"], ["...laging may turon pagsapit ng alas-tres.", "L"]]},
		{"id": "gym", "rect": [0.0, 0.52, 1.0, 0.48],
			"lines": [["Sa gym kita unang nakilala.", "R"], ["Mainit noon. Amoy goma ang sahig.", "BL"]]},
	]},
	{"panels": [
		{"id": "kaibigan", "rect": [0.0, 0.0, 1.0, 0.48], "draw": "Close-up: ang kaibigan, nakangiti, pawisan, sa gym",
			"lines": [["\"Mayap a abak!\" ang lagi mong bati...", "R"], ["...kahit hapon na.", "L"]]},
		{"id": "ako", "rect": [0.0, 0.52, 1.0, 0.48], "draw": "Close-up: ang bida, nakatungo, hindi makatingin",
			"lines": [["Ako naman...", "L"], ["...hindi ko alam ang isasagot.", "R"]]},
	]},
	{"panels": [
		{"id": "litrato", "rect": [0.0, 0.0, 1.0, 0.56], "draw": "Selfie ng dalawa sa harap ng angel fountain, sa cellphone",
			"lines": [["May kumuha ng litrato natin sa fountain.", "L"], ["Nasa cellphone ko pa rin hanggang ngayon.", "R"]]},
		{"id": "ulan", "rect": [0.0, 0.60, 1.0, 0.40], "draw": "Ulan sa boulevard, walang tao sa ilalim ng walkway",
			"lines": [["Tapos dumating ang tag-ulan...", "C"]]},
	]},
	{"panels": [
		{"id": "", "rect": [0.0, 0.0, 1.0, 1.0], "frame": false, "marks": true,
			"lines": [["Bakit ka umalis noon?", "L"], ["Iniisip ko pa rin...", "R"]]},
	]},
	{"panels": [
		{"id": "mata", "rect": [0.0, 0.1, 1.0, 0.8], "dark": true, "draw": "Close-up ng mga mata ng bida, may luha sa gilid",
			"lines": [["Pero sigurado ako...", "L"], ["...nakita kita.", "R"]]},
	]},
]

var sound: Node
var args := {}
var _root := Control.new()
var _page := Control.new()
var _font := lettering()
var _advance := false
var _skipping := false
var _instant := false
var _holding := false
var _hold := 0.0
var _hint := Label.new()
var _fill := ColorRect.new()

## The lettering font: the opening's narration and the NPCs' talk (npcs.gd).
static func lettering() -> SystemFont:
	var font := SystemFont.new()
	font.font_names = PackedStringArray(["Comic Sans MS", "Comic Neue", "Chalkboard SE"])
	return font

## Plain launches get the opening; --opening forces it, --opening-capture=<png> with
## --opening-page=<n> saves one finished page (n = PAGES.size() is the title) and quits.
static func wanted(launch: Dictionary) -> bool:
	return launch.is_empty() or launch.has("opening") or launch.has("opening-capture")

## Every panel can show something: its drawing, its photo, or a card saying what to draw.
static func panels_ready() -> bool:
	for page in PAGES:
		for panel in page["panels"]:
			var id: String = panel["id"]
			if id != "" and _picture(id) == null and not panel.has("draw"):
				return false
	return PAGES.size() >= 8

static func _picture(id: String) -> Texture2D:
	for path in ["res://opening/panels/%s.png" % id, "res://opening/photos/%s.jpg" % id]:
		if ResourceLoader.exists(path):
			return load(path)
	return null

static func _drawn(id: String) -> bool:
	return ResourceLoader.exists("res://opening/panels/%s.png" % id)

func _ready() -> void:
	layer = 100
	process_mode = Node.PROCESS_MODE_ALWAYS
	_root.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	_root.mouse_filter = Control.MOUSE_FILTER_STOP
	add_child(_root)
	var paper := ColorRect.new()
	paper.color = PAPER
	paper.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	paper.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_root.add_child(paper)
	_page.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	_page.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_root.add_child(_page)
	if args.has("opening-capture"):
		_capture.call_deferred(int(args.get("opening-page", "0")), String(args["opening-capture"]))
	else:
		_play.call_deferred()

func _input(event: InputEvent) -> void:
	var key := event as InputEventKey
	var click := event as InputEventMouseButton
	if key != null and key.keycode == KEY_SPACE:
		if not key.echo:
			_holding = key.pressed
			if not key.pressed and _hold < 1.0:
				_advance = true
		get_viewport().set_input_as_handled()
		return
	if not ((key != null and key.pressed and not key.echo) or (click != null and click.pressed)):
		return
	if key != null and key.keycode == KEY_ESCAPE:
		_skipping = true
	_advance = true
	get_viewport().set_input_as_handled()

## Holding Space fills the bar under the hint; let go early and it drains back.
func _process(delta: float) -> void:
	if _hint.get_parent() == null:
		return
	if _skipping:
		_hint.modulate.a = move_toward(_hint.modulate.a, 0.0, delta * 3.0)
		return
	_hold = clampf(_hold + (delta if _holding else -2.0 * delta) / HOLD, 0.0, 1.0)
	_fill.scale.x = _hold
	_hint.modulate.a = move_toward(_hint.modulate.a, 1.0 if _holding else 0.5, delta * 3.0)
	if _hold >= 1.0:
		_skipping = true
		_advance = true

func _play() -> void:
	_skip_hint()
	for page in PAGES:
		if _skipping:
			break
		await _show_page(page)
	await _title()
	var out := create_tween()
	out.tween_property(_root, "modulate:a", 0.0, 1.2)
	await out.finished
	finished.emit()

func _capture(index: int, path: String) -> void:
	_instant = true
	if index < PAGES.size():
		await _show_page(PAGES[index])
	else:
		await _title()
	for i in 8:
		await get_tree().process_frame
	var saved := get_viewport().get_texture().get_image().save_png(path)
	print("opening capture: ", path, " ", "ok" if saved == OK else "failed")
	get_tree().quit()

# --- Pages ------------------------------------------------------------------------

## "HOLD SPACE TO SKIP" in the margin under the page's bottom right, lettered like the
## narration, with a thin pen line beneath that fills while Space is held.
func _skip_hint() -> void:
	var area := _area()
	var size := maxi(12, int(area.size.y * 0.024))
	_hint.text = "HOLD SPACE TO SKIP"
	_hint.add_theme_font_override("font", _font)
	_hint.add_theme_font_size_override("font_size", size)
	_hint.add_theme_color_override("font_color", PEN)
	_hint.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	_hint.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_hint.modulate.a = 0.0
	_root.add_child(_hint)
	_hint.size = Vector2(area.size.x, 0)
	_hint.position = Vector2(area.position.x, area.end.y + area.size.y * 0.012)
	var width := _font.get_string_size(_hint.text, HORIZONTAL_ALIGNMENT_LEFT, -1, size).x
	var track := ColorRect.new()
	track.color = Color(PEN, 0.18)
	track.size = Vector2(width, 2)
	track.position = Vector2(area.size.x - width, _hint.get_minimum_size().y)
	track.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_hint.add_child(track)
	_fill.color = PEN
	_fill.size = track.size
	_fill.scale.x = 0.0
	_fill.mouse_filter = Control.MOUSE_FILTER_IGNORE
	track.add_child(_fill)

func _area() -> Rect2:
	var screen := get_viewport().get_visible_rect().size
	return Rect2(screen * MARGIN, screen * (Vector2.ONE - 2.0 * MARGIN))

func _clear_page() -> void:
	for child in _page.get_children():
		child.queue_free()
	_page.modulate.a = 1.0

func _show_page(page: Dictionary) -> void:
	_clear_page()
	var area := _area()
	var built: Array = []
	var index := 0
	for panel in page["panels"]:
		var r: Array = panel["rect"]
		var rect := Rect2(area.position + area.size * Vector2(r[0], r[1]), area.size * Vector2(r[2], r[3]))
		built.append([panel, _panel(panel, rect, index)])
		index += 1
	for item in built:
		var node: Control = item[1]
		if not _instant:
			var fade := create_tween()
			fade.tween_property(node, "modulate:a", 1.0, 0.9)
			await _wait(0.7)
		for line in node.get_meta("lines"):
			await _type(line)
		if _skipping:
			return
	if _instant:
		return
	await _wait(1.2)
	var out := create_tween()
	out.tween_property(_page, "modulate:a", 0.0, 0.7)
	await out.finished

## One panel: its frame, its drifting picture (or card), its border, and its narration
## (hidden until typed; kept in the panel's "lines" meta).
func _panel(panel: Dictionary, rect: Rect2, index: int) -> Control:
	var frame := Control.new()
	frame.position = rect.position
	frame.size = rect.size
	frame.clip_contents = true
	frame.mouse_filter = Control.MOUSE_FILTER_IGNORE
	frame.modulate.a = 1.0 if _instant else 0.0
	_page.add_child(frame)
	var dark: bool = panel.get("dark", false)
	if dark:
		var black := ColorRect.new()
		black.color = PEN
		black.size = rect.size
		frame.add_child(black)
	var id: String = panel["id"]
	if id != "":
		var picture := _picture(id)
		if picture != null:
			_drifting(frame, picture, rect.size, index, not _drawn(id))
		else:
			_card(frame, rect.size, id, panel.get("draw", ""), dark)
	if panel.get("marks", false):
		var specks := Specks.new()
		specks.size = rect.size
		specks.seed_value = index * 7 + int(rect.position.x + rect.position.y)
		frame.add_child(specks)
	if panel.get("frame", true):
		var border := Panel.new()
		var box := StyleBoxFlat.new()
		box.draw_center = false
		box.border_color = PEN
		box.set_border_width_all(3)
		border.add_theme_stylebox_override("panel", box)
		border.size = rect.size
		border.mouse_filter = Control.MOUSE_FILTER_IGNORE
		frame.add_child(border)
	var lines: Array = []
	for line in panel.get("lines", []):
		lines.append(_caption(frame, rect.size, line[0], line[1], dark))
	frame.set_meta("lines", lines)
	return frame

func _drifting(frame: Control, picture: Texture2D, size: Vector2, index: int, photo: bool) -> void:
	var image := TextureRect.new()
	image.texture = picture
	image.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	image.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_COVERED
	image.size = size * SLACK
	var material := ShaderMaterial.new()
	material.shader = MANGA
	material.set_shader_parameter("ink", 1.0 if photo else 0.0)
	material.set_shader_parameter("paper", PAPER)
	material.set_shader_parameter("pen", PEN)
	image.material = material
	frame.add_child(image)
	# drift across the slack: alternate panels pan the other way, tall ones pan down
	var slack := size * (SLACK - 1.0)
	var from := Vector2(-slack.x, -slack.y * 0.5) if index % 2 == 0 else Vector2(0.0, -slack.y * 0.5)
	var to := Vector2(0.0, -slack.y * 0.5) if index % 2 == 0 else Vector2(-slack.x, -slack.y * 0.5)
	if size.y > size.x:
		from = Vector2(-slack.x * 0.5, -slack.y)
		to = Vector2(-slack.x * 0.5, 0.0)
	image.position = from
	if not _instant:
		var drift := create_tween()
		drift.tween_property(image, "position", to, DRIFT_TIME).set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_IN_OUT)

## The grey card a panel shows until its picture is drawn: which picture, and what it shows.
func _card(frame: Control, size: Vector2, id: String, draw: String, dark: bool) -> void:
	var card := ColorRect.new()
	card.color = PEN.lightened(0.12) if dark else CARD
	card.size = size
	frame.add_child(card)
	var note := Label.new()
	note.text = "[ opening/panels/%s.png ]\n%s" % [id, draw]
	note.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	note.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	note.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	note.size = size
	note.add_theme_font_size_override("font_size", maxi(12, int(_area().size.y * 0.02)))
	note.add_theme_color_override("font_color", Color(PAPER, 0.5) if dark else Color(PEN, 0.45))
	frame.add_child(note)

func _caption(frame: Control, size: Vector2, text: String, where: String, dark: bool) -> Label:
	var label := Label.new()
	label.text = text.to_upper()
	label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	label.add_theme_font_override("font", _font)
	label.add_theme_font_size_override("font_size", maxi(14, int(_area().size.y * 0.033)))
	label.add_theme_color_override("font_color", PAPER if dark else PEN)
	label.add_theme_color_override("font_outline_color", PEN if dark else PAPER)
	label.add_theme_constant_override("outline_size", 16)
	label.add_theme_constant_override("line_spacing", -2)
	var pad := size * Vector2(0.035, 0.07)
	var column := clampf(size.x * 0.3, minf(190.0, size.x * 0.8), size.x * 0.8)
	var box := Vector2(column, size.y - 2.0 * pad.y)
	match where:
		"L", "BL":
			label.position = pad
		"R", "BR":
			label.position = Vector2(size.x - pad.x - column, pad.y)
		_:
			box.x = size.x * 0.6
			label.position = Vector2(size.x * 0.2, pad.y)
	label.size = box
	label.vertical_alignment = VERTICAL_ALIGNMENT_BOTTOM if where.begins_with("B") \
		else (VERTICAL_ALIGNMENT_CENTER if where == "C" else VERTICAL_ALIGNMENT_TOP)
	label.visible_characters = -1 if _instant else 0
	frame.add_child(label)
	return label

func _title() -> void:
	_clear_page()
	var area := _area()
	var title := Label.new()
	title.text = "PROJECT HAU"
	title.add_theme_font_override("font", _font)
	title.add_theme_font_size_override("font_size", int(area.size.y * 0.09))
	title.add_theme_color_override("font_color", PEN)
	var under := Label.new()
	under.text = "Holy Angel University  ·  Angeles City, Pampanga"
	under.add_theme_font_size_override("font_size", maxi(13, int(area.size.y * 0.024)))
	under.add_theme_color_override("font_color", Color(PEN, 0.6))
	for label: Label in [title, under]:
		label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		label.size = Vector2(area.size.x, 0)
		label.modulate.a = 1.0 if _instant else 0.0
		_page.add_child(label)
	title.position = area.position + Vector2(0, area.size.y * 0.38)
	under.position = area.position + Vector2(0, area.size.y * 0.54)
	if _instant:
		return
	var fade := create_tween()
	fade.tween_property(title, "modulate:a", 1.0, 1.4)
	fade.tween_property(under, "modulate:a", 1.0, 1.0)
	await _wait(4.0)

# --- Timing -----------------------------------------------------------------------

## Waits, or less if a key moves on (or the opening is being skipped).
func _wait(seconds: float) -> void:
	if _instant:
		return
	_advance = false
	var end := Time.get_ticks_msec() + int(seconds * 1000.0)
	while Time.get_ticks_msec() < end and not _advance and not _skipping:
		await get_tree().process_frame

## Types a line out with a soft blip, then holds it long enough to read.
func _type(label: Label) -> void:
	if _instant or _skipping:
		label.visible_characters = -1
		return
	_advance = false
	var total := label.get_total_character_count()
	var shown := 0.0
	var last := Time.get_ticks_msec()
	while shown < total and not _advance and not _skipping:
		await get_tree().process_frame
		var now := Time.get_ticks_msec()
		var before := int(shown)
		shown += (now - last) / 1000.0 * CPS
		last = now
		label.visible_characters = int(shown)
		if sound != null and int(shown) / 3 != before / 3:
			sound.blip(VOICE)
	label.visible_characters = -1
	await _wait(1.4 + total * 0.04)

## Pencil specks scattered over a blank page, like dust and stray marks on the paper.
class Specks extends Control:
	var seed_value := 0

	func _draw() -> void:
		var rng := RandomNumberGenerator.new()
		rng.seed = seed_value
		for cluster in 14:
			var centre := Vector2(rng.randf() * size.x, rng.randf() * size.y)
			for mark in rng.randi_range(2, 7):
				var at := centre + Vector2(rng.randf_range(-9, 9), rng.randf_range(-9, 9))
				var tilt := rng.randf_range(-0.5, 0.5)
				var length := rng.randf_range(2.0, 7.0)
				draw_line(at, at + Vector2(sin(tilt), cos(tilt)) * length, Color(0.11, 0.1, 0.1, rng.randf_range(0.25, 0.7)), 1.0)
