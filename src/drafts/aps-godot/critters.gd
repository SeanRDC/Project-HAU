extends Node3D
## Ambient life: the campus cats and the maya birds. Both are small pixel sheets drawn
## here in code (no art files), at the characters' density, edged in a darker tone of
## their own colour like the cast, lit and shadowed like them.
##
## Cats: three strays with names, each round its own spot. They sit and flick their tail,
## stroll, and curl up asleep (more at noon, at night and in the rain). Stand still near
## one and it may come over; press E beside it to pet it (it purrs). Run at one and it
## dashes off.
## Birds: flocks of maya (tree sparrows) hopping and pecking on the open ground by day.
## Come close, or run, and the whole flock flutters up and away; it lands again a while
## later. They are gone at night and in the rain.

const World := preload("res://world.gd")
const Npc := preload("res://npc.gd")
const Npcs := preload("res://npcs.gd")
const Opening := preload("res://opening.gd")

## Metres per sprite pixel: the characters' (85 px for 1.83 m).
const DENSITY := 1.83 / 85.0
## How close the student must be to pet a cat.
const PET_REACH := 1.3
## Birds take off when the student comes this close (further when running).
const SCARE := 2.4
const SCARE_RUNNING := 4.5

## name, home (world x, z), coat
const CATS := [
	{"name": "Mingming", "home": Vector2(-6.0, 6.2), "coat": "orange"},
	{"name": "Kiko", "home": Vector2(33.0, 13.0), "coat": "tuxedo"},
	{"name": "Tisay", "home": Vector2(-31.0, 57.0), "coat": "calico"},
]
## Where flocks feed (world x, z) and how many birds each.
const FLOCKS := [
	[Vector2(12.0, 7.0), 5], [Vector2(24.0, 11.5), 4], [Vector2(-36.0, 52.5), 6],
	[Vector2(-84.0, 70.5), 5], [Vector2(-150.0, 63.0), 4], [Vector2(-20.0, 108.0), 5],
]

var camera: Camera3D
var student: Node3D
var sound: Node
var to_screen: Callable
## Set by the scene each frame.
var hour := 16.5
var rain := 0.0
var cats: Array[Dictionary] = []
var flocks: Array[Dictionary] = []
## Times a cat has been petted and a flock has taken off, for the checks.
var pets := 0
var takeoffs := 0
var _rng := RandomNumberGenerator.new()
var _hint := PanelContainer.new()
var _hint_label := Label.new()
var _bubble := PanelContainer.new()
var _bubble_label := Label.new()
var _bubble_cat: Dictionary = {}
var _bubble_age := 0.0
var _time := 0.0

func _ready() -> void:
	name = "Critters"
	_rng.seed = 7171
	for data in CATS:
		_add_cat(data)
	for data in FLOCKS:
		_add_flock(data[0], data[1])

# --- Drawing ----------------------------------------------------------------------

## A sheet of frames side by side, each drawn by `paint(image, frame, x0)`, then edged:
## every filled pixel next to an empty one takes a darker tone of its own colour.
static func _sheet(width: int, height: int, frames: int, paint: Callable) -> ImageTexture:
	var image := Image.create(width * frames, height, false, Image.FORMAT_RGBA8)
	for frame in frames:
		paint.call(image, frame, frame * width)
	var edged := image.duplicate() as Image
	for y in height:
		for x in width * frames:
			var c := image.get_pixel(x, y)
			if c.a < 0.5:
				continue
			for d: Vector2i in [Vector2i(1, 0), Vector2i(-1, 0), Vector2i(0, 1), Vector2i(0, -1)]:
				var n := Vector2i(x, y) + d
				var inside := n.x >= 0 and n.y >= 0 and n.x < width * frames and n.y < height and (n.x / width) == (x / width)
				if not inside or image.get_pixel(n.x, n.y).a < 0.5:
					edged.set_pixel(x, y, c.darkened(0.32))
					break
	return ImageTexture.create_from_image(edged)

static func _ellipse(image: Image, x0: int, c: Vector2, r: Vector2, colour: Callable) -> void:
	for y in range(int(c.y - r.y - 1), int(c.y + r.y + 2)):
		for x in range(int(c.x - r.x - 1), int(c.x + r.x + 2)):
			var d := Vector2((x + 0.5 - c.x) / r.x, (y + 0.5 - c.y) / r.y)
			if d.length_squared() <= 1.0:
				_put(image, x0, x, y, colour.call(x, y))

static func _put(image: Image, x0: int, x: int, y: int, colour: Color) -> void:
	if x >= 0 and y >= 0 and y < image.get_height() and x0 + x < image.get_width():
		image.set_pixel(x0 + x, y, colour)

## A cat's coat colour at a pixel (x, y) of a frame.
static func _coat(kind: String, x: int, y: int) -> Color:
	match kind:
		"orange":
			return Color("a8602a") if posmod(x + y / 3, 4) == 0 else Color("d9893b")
		"tuxedo":
			return Color("eceae4") if y >= 12 and posmod(x, 9) > 5 else Color("2f2d33")
		_: # calico: white with orange and black patches
			var cell := posmod(x / 4 + (y / 3) * 3, 5)
			return Color("d9893b") if cell == 1 else (Color("2f2d33") if cell == 3 else Color("efece5"))

static func _cat_sheets(kind: String) -> Dictionary:
	var coat := func(x: int, y: int) -> Color: return _coat(kind, x, y)
	var eye := Color("c9d24a")
	var nose := Color("d98a8a")
	# walking, facing right: four frames with the legs swinging
	var walk := _sheet(26, 18, 4, func(image: Image, frame: int, x0: int) -> void:
		var swing: int = [0, 1, 0, -1][frame]
		for leg: Vector2i in [Vector2i(7, swing), Vector2i(9, -swing), Vector2i(16, -swing), Vector2i(18, swing)]:
			for y in range(11, 17):
				_put(image, x0, leg.x + (leg.y if y > 13 else 0), y, coat.call(leg.x, 14))
		_ellipse(image, x0, Vector2(12.5, 9.5), Vector2(8.0, 3.6), coat)
		_ellipse(image, x0, Vector2(21.0, 6.5), Vector2(3.4, 3.1), coat)
		for ear: Vector2i in [Vector2i(19, 3), Vector2i(22, 3)]:
			_put(image, x0, ear.x, ear.y, coat.call(ear.x, ear.y))
			_put(image, x0, ear.x, ear.y - 1, coat.call(ear.x, ear.y))
		_put(image, x0, 22, 6, eye)
		_put(image, x0, 24, 7, nose)
		var tip: int = [0, 1, 1, 0][frame]
		for k in 6:
			_put(image, x0, 4 - k / 2, 8 - k + tip, coat.call(3, 6)))
	# sitting, facing right: the tail flicks over two frames
	var sit := _sheet(26, 18, 2, func(image: Image, frame: int, x0: int) -> void:
		_ellipse(image, x0, Vector2(12.0, 12.0), Vector2(5.0, 5.2), coat)
		for leg in [14, 16]:
			for y in range(12, 17):
				_put(image, x0, leg, y, coat.call(leg, 14))
		_ellipse(image, x0, Vector2(15.0, 5.5), Vector2(3.4, 3.1), coat)
		for ear: Vector2i in [Vector2i(13, 2), Vector2i(16, 2)]:
			_put(image, x0, ear.x, ear.y, coat.call(ear.x, ear.y))
			_put(image, x0, ear.x, ear.y - 1, coat.call(ear.x, ear.y))
		_put(image, x0, 17, 5, eye)
		_put(image, x0, 18, 6, nose)
		for k in 8:
			_put(image, x0, 6 + k, 16 if k < 6 or frame == 0 else 15, coat.call(9, 16)))
	# asleep, curled: breathing over two frames
	var sleep := _sheet(26, 18, 2, func(image: Image, frame: int, x0: int) -> void:
		_ellipse(image, x0, Vector2(12.0, 13.5 - frame * 0.3), Vector2(8.0, 3.4 + frame * 0.3), coat)
		_ellipse(image, x0, Vector2(18.5, 13.5), Vector2(3.0, 2.6), coat)
		_put(image, x0, 17, 11, coat.call(17, 11))
		_put(image, x0, 20, 11, coat.call(20, 11))
		_put(image, x0, 19, 13, Color("3a3030"))
		for k in 7:
			_put(image, x0, 6 + k, 16, coat.call(6, 16)))
	return {"walk": [walk, 4], "sit": [sit, 2], "sleep": [sleep, 2]}

static var _bird_sheets: Dictionary = {}
## A maya: buff body, brown streaked back and wings, a chestnut cap, a white cheek with a
## black spot and bib. Hopping/pecking (3 frames) and flying (2 frames), facing right.
static func _birds() -> Dictionary:
	if not _bird_sheets.is_empty():
		return _bird_sheets
	var body := func(x: int, y: int) -> Color: return Color("7a5534") if y < 4 and posmod(x, 2) == 0 else (Color("8c6a46") if y < 4 else Color("b49470"))
	var head := func(_x: int, y: int) -> Color: return Color("7a3f22") if y < 2 else Color("e8e2d4")
	var ground := _sheet(10, 8, 3, func(image: Image, frame: int, x0: int) -> void:
		var peck := frame == 2
		_ellipse(image, x0, Vector2(4.5, 4.6), Vector2(3.0, 2.0), body)
		var h := Vector2(7.2, 4.6) if peck else Vector2(6.8, 2.6)
		_ellipse(image, x0, h, Vector2(1.6, 1.5), head)
		_put(image, x0, int(h.x) + 1, int(h.y) + 1, Color("2a2420"))
		_put(image, x0, int(h.x) + 2, int(h.y) + (1 if peck else 0), Color("3a3230"))
		_put(image, x0, 1, 3, body.call(1, 3))
		_put(image, x0, 0, 3, body.call(0, 3))
		var lift := 1 if frame == 1 else 0
		for leg in [4, 5]:
			_put(image, x0, leg, 7 - lift, Color("8a6a52")))
	var flying := _sheet(12, 8, 2, func(image: Image, frame: int, x0: int) -> void:
		_ellipse(image, x0, Vector2(5.5, 4.5), Vector2(3.2, 1.7), body)
		_ellipse(image, x0, Vector2(8.6, 3.8), Vector2(1.5, 1.4), head)
		_put(image, x0, 10, 4, Color("3a3230"))
		_put(image, x0, 1, 4, body.call(1, 4))
		for k in 5:
			var y := 3 - k / 2 if frame == 0 else 5 + k / 2
			_put(image, x0, 4 + k / 2, clampi(y, 0, 7), Color("7a5534")))
	_bird_sheets = {"ground": [ground, 3], "fly": [flying, 2]}
	return _bird_sheets

static func _sprite(texture: Texture2D, frames: int) -> Sprite3D:
	var sprite := Sprite3D.new()
	sprite.shaded = true
	sprite.double_sided = true
	sprite.alpha_cut = SpriteBase3D.ALPHA_CUT_DISCARD
	sprite.alpha_scissor_threshold = 0.35
	sprite.texture_filter = BaseMaterial3D.TEXTURE_FILTER_NEAREST_WITH_MIPMAPS
	sprite.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_DOUBLE_SIDED
	sprite.pixel_size = DENSITY
	sprite.texture = texture
	sprite.hframes = frames
	return sprite

static func _show(sprite: Sprite3D, sheet: Array, frame: int) -> void:
	if sprite.texture != sheet[0]:
		sprite.texture = sheet[0]
		sprite.hframes = sheet[1]
	sprite.frame = posmod(frame, sheet[1])
	sprite.position.y = sprite.texture.get_height() * DENSITY * 0.5

# --- Cats -------------------------------------------------------------------------

func _add_cat(data: Dictionary) -> void:
	var sheets := _cat_sheets(data.coat)
	var sprite := _sprite(sheets.sit[0], sheets.sit[1])
	sprite.name = "Cat_" + data.name
	var body := Node3D.new()
	body.name = "Cat_" + data.name
	body.add_child(sprite)
	add_child(body)
	var home := Npcs.free_spot(data.home)
	var cat := {"name": data.name, "node": body, "sprite": sprite, "sheets": sheets, "home": home, "at": home,
		"state": "sit", "timer": _rng.randf_range(2.0, 6.0), "target": home, "facing": 1.0, "phase": 0.0, "walked": 0.0}
	_place(body, home, 0.0)
	cats.append(cat)

func _update_cat(cat: Dictionary, delta: float, at: Vector2, still: bool, running: bool, right: Vector2) -> void:
	var toward: Vector2 = at - cat.at
	var near := toward.length()
	cat.timer -= delta
	cat.phase += delta
	var sleepy := 0.6 if (hour >= 18.0 or hour < 6.0 or (hour >= 11.0 and hour < 14.0) or rain > 0.35) else 0.2
	if running and near < 2.2 and cat.state != "dash":
		# startled: dash away from the student
		cat.state = "dash"
		cat.timer = 1.4
		cat.target = _clear_spot(cat.at, cat.at - toward.normalized() * 3.5)
	match cat.state:
		"petted":
			_show(cat.sprite, cat.sheets.sit, int(cat.phase * 2.0))
			if cat.timer <= 0.0:
				cat.state = "sit"
				cat.timer = _rng.randf_range(2.0, 5.0)
		"sleep":
			_show(cat.sprite, cat.sheets.sleep, int(cat.phase * 0.8))
			if cat.timer <= 0.0:
				cat.state = "sit"
				cat.timer = _rng.randf_range(3.0, 7.0)
		"sit":
			_show(cat.sprite, cat.sheets.sit, int(cat.phase * 1.3) if int(cat.phase) % 4 == 0 else 0)
			if near < 6.0 and absf(toward.dot(right)) > 0.05:
				cat.facing = signf(toward.dot(right))
			if still and near < 4.5 and near > 1.0 and _rng.randf() < delta * 0.25:
				cat.state = "come" # curious: it walks over to a student standing still
			elif cat.timer <= 0.0:
				if _rng.randf() < sleepy:
					cat.state = "sleep"
					cat.timer = _rng.randf_range(8.0, 20.0)
				else:
					cat.state = "walk"
					cat.target = _clear_spot(cat.at, cat.home + Vector2(_rng.randf_range(-5.0, 5.0), _rng.randf_range(-3.0, 3.0)))
		"come":
			cat.target = cat.at + toward - toward.normalized() * 0.7
			if not still or near < 0.8 or near > 6.0:
				cat.state = "sit"
				cat.timer = _rng.randf_range(4.0, 8.0)
				if near < 1.2 and sound != null:
					sound.meow()
					_say(cat, "Meow!")
			else:
				_walk(cat, delta, 0.9, right)
		"walk", "dash":
			if _walk(cat, delta, 2.6 if cat.state == "dash" else 0.6, right) or cat.timer < -12.0:
				cat.state = "sit"
				cat.timer = _rng.randf_range(3.0, 8.0)

## Steps the cat towards its target; true once it has arrived (or is stuck).
func _walk(cat: Dictionary, delta: float, speed: float, right: Vector2) -> bool:
	var to: Vector2 = cat.target - cat.at
	if to.length() < 0.06:
		return true
	var step := to.limit_length(speed * delta)
	var next: Vector2 = cat.at + step
	if World.blocked(next.x, next.y) or absf(World.floor_height(next.x, next.y) - World.floor_height(cat.at.x, cat.at.y)) > 0.2:
		return true
	cat.at = next
	cat.walked += step.length()
	if absf(step.dot(right)) > 0.0001:
		cat.facing = signf(step.dot(right))
	_show(cat.sprite, cat.sheets.walk, int(cat.walked / 0.18))
	_place(cat.node, cat.at, 0.0)
	return false

## The furthest spot towards `wish` reachable in a straight line.
static func _clear_spot(from: Vector2, wish: Vector2) -> Vector2:
	var best := from
	for i in range(1, 13):
		var spot := from.lerp(wish, i / 12.0)
		if World.blocked(spot.x, spot.y) or absf(World.floor_height(spot.x, spot.y) - World.floor_height(best.x, best.y)) > 0.2:
			break
		best = spot
	return best

func cat_in_reach() -> Dictionary:
	for cat in cats:
		if (cat.at as Vector2).distance_to(Vector2(student.position.x, student.position.z)) < PET_REACH:
			return cat
	return {}

## E beside a cat: it sits for a pet and purrs. False when no cat is near.
func pet() -> bool:
	var cat := cat_in_reach()
	if cat.is_empty():
		return false
	cat.state = "petted"
	cat.timer = 2.2
	pets += 1
	if sound != null:
		sound.purr()
	_say(cat, "Prrr...")
	return true

# --- Birds ------------------------------------------------------------------------

func _add_flock(spot: Vector2, count: int) -> void:
	var flock := {"spot": Npcs.free_spot(spot), "birds": [], "state": "feeding", "timer": 0.0}
	for i in count:
		var sprite := _sprite(_birds().ground[0], 3)
		var node := Node3D.new()
		node.name = "Bird"
		node.add_child(sprite)
		add_child(node)
		var at: Vector2 = flock.spot + Vector2(_rng.randf_range(-1.6, 1.6), _rng.randf_range(-1.0, 1.0))
		at = _clear_spot(flock.spot, at)
		var bird := {"node": node, "sprite": sprite, "at": at, "y": 0.0, "hop": 0.0, "from": at, "to": at,
			"timer": _rng.randf_range(0.2, 2.0), "peck": 0.0, "vel": Vector3.ZERO, "facing": 1.0}
		_place(node, at, 0.0)
		flock.birds.append(bird)
	flocks.append(flock)

func _update_flock(flock: Dictionary, delta: float, at: Vector2, running: bool, right: Vector2) -> void:
	var day := hour >= 6.0 and hour < 18.0 and rain < 0.35
	match flock.state:
		"feeding":
			var scared := not day
			for bird in flock.birds:
				if (bird.at as Vector2).distance_to(at) < (SCARE_RUNNING if running else SCARE):
					scared = true
			if scared:
				_take_off(flock, at)
				return
			for bird in flock.birds:
				_feed(bird, delta, flock.spot, right)
		"flying":
			flock.timer -= delta
			for bird in flock.birds:
				bird.vel.y += delta * 1.2
				var p: Vector3 = bird.node.position + bird.vel * delta
				bird.node.position = p
				_show(bird.sprite, _birds().fly, int(flock.timer * 14.0 + bird.peck * 7.0))
				bird.sprite.flip_h = bird.facing < 0.0
			if flock.timer <= 0.0:
				flock.state = "away"
				flock.timer = _rng.randf_range(10.0, 20.0)
				for bird in flock.birds:
					bird.node.visible = false
		"away":
			flock.timer -= delta
			if flock.timer <= 0.0 and day and (flock.spot as Vector2).distance_to(at) > 7.0:
				flock.state = "feeding"
				for bird in flock.birds:
					bird.node.visible = true
					bird.at = _clear_spot(flock.spot, flock.spot + Vector2(_rng.randf_range(-1.6, 1.6), _rng.randf_range(-1.0, 1.0)))
					bird.to = bird.at
					bird.hop = 1.0
					_place(bird.node, bird.at, 0.0)

func _take_off(flock: Dictionary, from: Vector2) -> void:
	flock.state = "flying"
	flock.timer = 2.5
	takeoffs += 1
	var near := false
	for bird in flock.birds:
		var away: Vector2 = (bird.at - from).normalized() if (bird.at as Vector2).distance_to(from) > 0.01 else Vector2.RIGHT
		away = away.rotated(_rng.randf_range(-0.5, 0.5))
		bird.vel = Vector3(away.x * 4.5, _rng.randf_range(2.2, 3.4), away.y * 4.5)
		bird.peck = _rng.randf()
		near = near or (bird.at as Vector2).distance_to(from) < 8.0
	if near and sound != null:
		sound.flutter()

## A feeding bird: pecks, now and then hops a little way, a small arc off the ground.
func _feed(bird: Dictionary, delta: float, spot: Vector2, right: Vector2) -> void:
	bird.timer -= delta
	if bird.hop < 1.0:
		bird.hop = minf(1.0, bird.hop + delta * 5.0)
		bird.at = (bird.from as Vector2).lerp(bird.to, bird.hop)
		_place(bird.node, bird.at, sin(PI * bird.hop) * 0.12)
		_show(bird.sprite, _birds().ground, 1)
	else:
		bird.peck -= delta
		_show(bird.sprite, _birds().ground, 2 if bird.peck > 0.0 else 0)
		if bird.timer <= 0.0:
			bird.timer = _rng.randf_range(0.4, 2.2)
			if _rng.randf() < 0.45:
				bird.peck = 0.25
			else:
				var wish: Vector2 = bird.at + Vector2(_rng.randf_range(-0.5, 0.5), _rng.randf_range(-0.4, 0.4))
				if wish.distance_to(spot) > 2.5:
					wish = bird.at.lerp(spot, 0.3)
				bird.from = bird.at
				bird.to = _clear_spot(bird.at, wish)
				bird.hop = 0.0
				if absf((bird.to - bird.from).dot(right)) > 0.001:
					bird.facing = signf((bird.to - bird.from).dot(right))
	bird.sprite.flip_h = bird.facing < 0.0

# --- Each frame -------------------------------------------------------------------

static func _place(node: Node3D, at: Vector2, lift: float) -> void:
	node.position = Vector3(at.x, World.floor_height(at.x, at.y) + 0.015 + lift, at.y)

func update(delta: float, still: bool, running: bool, talking: bool, npc_near: bool) -> void:
	_time += delta
	var right := Vector2(camera.global_transform.basis.x.x, camera.global_transform.basis.x.z).normalized()
	var forward := -camera.global_transform.basis.z
	var at := Vector2(student.position.x, student.position.z)
	for cat in cats:
		_update_cat(cat, delta, at, still, running, right)
		cat.sprite.flip_h = cat.facing < 0.0
		cat.sprite.rotation.y = atan2(-forward.x, -forward.z)
	for flock in flocks:
		_update_flock(flock, delta, at, running, right)
		for bird in flock.birds:
			bird.sprite.rotation.y = atan2(-forward.x, -forward.z)
	# the pet prompt, when no one is there to talk to
	var cat := cat_in_reach()
	_hint.visible = not cat.is_empty() and not talking and not npc_near and to_screen.is_valid() and cat.state != "dash"
	if _hint.visible:
		_hint_label.text = "Hawakan si " + cat.name
		_hint.reset_size()
		var p: Vector2 = to_screen.call(cat.node.position + Vector3(0, 0.75, 0))
		_hint.position = p - Vector2(_hint.size.x * 0.5, _hint.size.y + 4.0 - sin(_time * 3.0) * 3.0)
	if _bubble.visible:
		_bubble_age += delta
		_bubble.modulate.a = clampf((2.0 - _bubble_age) / 0.5, 0.0, 1.0)
		_bubble.visible = _bubble_age < 2.0 and to_screen.is_valid()
		if _bubble.visible:
			_bubble.reset_size()
			var p: Vector2 = to_screen.call(_bubble_cat.node.position + Vector3(0, 0.75, 0))
			_bubble.position = p - Vector2(_bubble.size.x * 0.5, _bubble.size.y + (34.0 if _hint.visible else 4.0))

func _say(cat: Dictionary, words: String) -> void:
	if not to_screen.is_valid():
		return
	_bubble_cat = cat
	_bubble_label.text = words
	_bubble_age = 0.0
	_bubble.visible = true

## The pet prompt and the cat's little bubble, in the talk's style, on the UI layer.
func build_ui(parent: Node) -> void:
	var layer := CanvasLayer.new()
	layer.name = "Critters"
	parent.add_child(layer)
	var lettering := Theme.new()
	lettering.default_font = Opening.lettering()
	_hint.theme = lettering
	_hint.add_theme_stylebox_override("panel", Npcs._box(Color(22 / 255.0, 16 / 255.0, 34 / 255.0, 0.78), 16, 5))
	var row := HBoxContainer.new()
	row.add_theme_constant_override("separation", 8)
	_hint.add_child(row)
	var key := PanelContainer.new()
	var cap := Npcs._box(Npcs.PAPER, 5)
	cap.content_margin_left = 7
	cap.content_margin_right = 7
	key.add_theme_stylebox_override("panel", cap)
	var key_label := Label.new()
	key_label.text = "E"
	key_label.add_theme_font_size_override("font_size", 13)
	key_label.add_theme_color_override("font_color", Npcs.INK)
	key.add_child(key_label)
	row.add_child(key)
	_hint_label.add_theme_font_size_override("font_size", 15)
	_hint_label.add_theme_color_override("font_color", Npcs.PAPER)
	row.add_child(_hint_label)
	_hint.visible = false
	layer.add_child(_hint)
	_bubble.theme = lettering
	_bubble.add_theme_stylebox_override("panel", Npcs._box(Npcs.PAPER, 10, 6))
	_bubble_label.add_theme_font_size_override("font_size", 14)
	_bubble_label.add_theme_color_override("font_color", Npcs.INK)
	_bubble.add_child(_bubble_label)
	_bubble.visible = false
	layer.add_child(_bubble)
