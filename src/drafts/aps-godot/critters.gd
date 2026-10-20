extends Node3D
## Ambient life: the campus cats and the maya birds. Their sheets are pixel frames
## written out here as rows of letters (no art files), side-on after Mikko's references
## (a side-view tabby, a sparrow sheet), at the characters' density, edged in a darker
## tone of their own colour like the cast, and lit and shadowed like them.
##
## Cats: five strays with names, each round its own spot. They sit and flick their tail,
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
	{"name": "Tisay", "home": Vector2(-31.0, 57.0), "coat": "grey"},
	{"name": "Itim", "home": Vector2(-24.0, 118.5), "coat": "black"},
	{"name": "Puti", "home": Vector2(-118.0, 83.0), "coat": "white"},
]
## Where flocks feed (world x, z) and how many birds each.
const FLOCKS := [
	[Vector2(12.0, 7.0), 6], [Vector2(24.0, 11.5), 5], [Vector2(-36.0, 52.5), 8],
	[Vector2(-84.0, 70.5), 6], [Vector2(-150.0, 63.0), 6], [Vector2(-20.0, 108.0), 7],
	[Vector2(52.0, 92.0), 5], [Vector2(-95.0, 56.0), 6],
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

## Sitting, facing right (after the side-view tabby reference): one frame.
const CAT_SIT := [
	["................o....o....", "...............oo...oo....", "...............opo.opo....", "..............oopooopoo...", "..............ooooooooo...", ".............ososooooooo..", ".............oooooooeoool.", ".............oooooooooolln", ".............ooooooooolll.", "..............ooooowwwll..", "..............oooowwww....", ".............oooooowww....", "............ooooooowww....", "...........oosooooowww....", "..........oooosooooww.....", ".........oooooosoooow.....", "........ooossooosooow.....", "........ooooosoooooooo....", ".......ooosooosooooooo....", ".......oooosoooosoooooo...", ".......ooooosoooooooooo...", ".......oooooooooooo.ooo...", ".......oooooooooooo.ooo...", "........ooooooooooo.ooo...", ".ooo....oooooooooo..ooo...", "oolsoo..ooooooooo...ooo...", "o.lssoooooooooooo...ooo...", "..osssoooooooowww..www....", "....oooooooowww....www...."],
]
## Walking, facing right: four frames, the legs swinging.
const CAT_WALK := [
	["........................o...o...", "........................oo.oo...", "........................opoop...", "..oo...................ooooooo..", ".oo....................oosoooeo.", ".o.....................ooooooolln", ".o...ooooooooooooooooooooooolll.", ".oo.oossooossooossooooooooowl...", "..oooossooossooossoooooooooww...", "...ooossooossooossoooooooowww...", "...ooooooooooooooooooooooowww...", "...oooooooooooooooooooooowww....", "....ooooooooooooooooooooww......", "....oo..oo..........oo..oo......", "....oo...oo.........oo...oo.....", "...oo....oo........oo....oo.....", "...oo.....oo.......oo.....oo....", "..ww......ww......ww......ww...."],
	["........................o...o...", "........................oo.oo...", "........................opoop...", "..oo...................ooooooo..", ".oo....................oosoooeo.", ".o.....................ooooooolln", ".o...ooooooooooooooooooooooolll.", ".oo.oossooossooossooooooooowl...", "..oooossooossooossoooooooooww...", "...ooossooossooossoooooooowww...", "...ooooooooooooooooooooooowww...", "...oooooooooooooooooooooowww....", "....ooooooooooooooooooooww......", ".....oo.oo...........oo.oo......", ".....oo.oo...........oo.oo......", ".....oo.oo...........oo.oo......", ".....oo..oo..........oo..oo.....", "....ww...ww.........ww...ww....."],
	["........................o...o...", "........................oo.oo...", "........................opoop...", "..oo...................ooooooo..", ".oo....................oosoooeo.", ".o.....................ooooooolln", ".o...ooooooooooooooooooooooolll.", ".oo.oossooossooossooooooooowl...", "..oooossooossooossoooooooooww...", "...ooossooossooossoooooooowww...", "...ooooooooooooooooooooooowww...", "...oooooooooooooooooooooowww....", "....ooooooooooooooooooooww......", "....oo..oo..........oo..oo......", "...oo...oo.........oo...oo......", "...oo...oo.........oo...oo......", "..oo....oo........oo....oo......", "..ww....ww........ww....ww......"],
	["........................o...o...", "........................oo.oo...", "........................opoop...", "..oo...................ooooooo..", ".oo....................oosoooeo.", ".o.....................ooooooolln", ".o...ooooooooooooooooooooooolll.", ".oo.oossooossooossooooooooowl...", "..oooossooossooossoooooooooww...", "...ooossooossooossoooooooowww...", "...ooooooooooooooooooooooowww...", "...oooooooooooooooooooooowww....", "....ooooooooooooooooooooww......", ".....oooo............oooo.......", ".....oooo............oooo.......", "....oo.oo...........oo.oo.......", "....oo.oo...........oo.oo.......", "...ww..ww..........ww..ww......."],
]
## Asleep, curled up: one frame (it breathes by scale).
const CAT_SLEEP := [
	["...........................", "............o.o............", "...........oooooo..........", ".........oossoossoo........", ".......ooosooosooosoo..o.o.", ".....oooosoooosooooso.ooooo", "....ooosoooosooooooooooosoo", "...ooosooooooooooooooooooeo", "..oooooooooooooooooooooooll", "..oooooooooooooooooooooolln", ".oolllooooooooooooooooolll.", ".oolssssoooooooooooooooww..", "..oooooooooooooooooowwww..."],
]
## A maya on the ground, facing right: standing, mid-hop, pecking.
const BIRD_GROUND := [
	["..........cc....", ".........cccc...", "........cccocc..", "........hhdhhyy.", ".......bhhhdh...", "....kbbbbfddf...", "..kbkbkbbffff...", ".kbkkbkbbfff....", "kkbkbbbbfff.....", "kk..bbbffff.....", ".......g.g......", ".......g.g......"],
	["................", "..........cc....", ".........cccc...", "........cccocc..", "........hhdhhyy.", "....kbbbhhhdh...", "..kbkbkbbfddf...", ".kbkkbkbbffff...", "kkbkbbbbfff.....", "kk..bbbffff.....", ".......g..g.....", ".......g..g....."],
	["................", "................", "................", "................", "....kbbbb.......", "..kbkbkbbbcccc..", ".kbkkbkbbccccoc.", "kkbkbbbbfhhdhh..", "kk..bbbffffdhyy.", "........g.g.....", "........g.g.....", "........g.g....."],
]
## A maya flying: wings up, wings down.
const BIRD_FLY := [
	[".........kk.......", "........kbk.......", ".......kbbk.......", "......kbbk....cc..", ".....kbbbk...cccc.", "kk..bbbbbbbbcccocc", ".kkbbbbffffhhdhhyy", "..k...fffffdh....."],
	["..................", "..................", "..............cc..", ".............cccc.", "kk..bbbbbbbbcccocc", ".kkbbbkbbfffhhdhyy", "..k..kbbkfffdh....", ".....kbbk.........", "......kbk.........", ".......kk........."],
]

## The cats' coats: a colour for each letter in the frames (o coat, s stripe, l muzzle,
## w white, p ear and nose pink, e eye, n nose).
const COATS := {
	"orange": {"o": "d68a3c", "s": "a9612a", "l": "ebb26e", "w": "eee6d8", "p": "d79a8c", "e": "3b2a18", "n": "6b3a2a"},
	"tuxedo": {"o": "34323a", "s": "2a2830", "l": "eee6d8", "w": "eee6d8", "p": "d79a8c", "e": "c9c24a", "n": "6b3a2a"},
	"grey": {"o": "8f8b86", "s": "5f5b57", "l": "c2bdb4", "w": "eee6d8", "p": "d79a8c", "e": "8fa04a", "n": "5a4a48"},
	"black": {"o": "2c2b30", "s": "232227", "l": "3a3940", "w": "3a3940", "p": "6a4a4a", "e": "c9c24a", "n": "1a1a1e"},
	"white": {"o": "e9e3d6", "s": "d4ccbe", "l": "f2eee6", "w": "f2eee6", "p": "d79a8c", "e": "5f93b8", "n": "c98a8a"},
}
## The maya's colours (b back, k dark streak, c chestnut cap, h white cheek, d black spot
## and bib, f buff belly, y beak, g legs, o eye).
const BIRD_COLOURS := {"b": "8a6442", "k": "4e3424", "c": "7c4426", "h": "ece6da", "d": "2a2420",
	"f": "c9b394", "y": "4a3a30", "g": "a07e62", "o": "2a2420"}

## A sheet from frames of letter rows (each frame bottom-aligned in a box as big as the
## largest), every filled pixel next to an empty one edged in a darker tone of its own
## colour, as the cast are.
static func _sheet(frames: Array, colours: Dictionary) -> Array:
	var width := 0
	var height := 0
	for rows: Array in frames:
		height = maxi(height, rows.size())
		for row: String in rows:
			width = maxi(width, row.length())
	var image := Image.create(width * frames.size(), height, false, Image.FORMAT_RGBA8)
	var filled := func(f: int, x: int, y: int) -> bool:
		var rows: Array = frames[f]
		var row_index := y - (height - rows.size())
		if x < 0 or x >= width or row_index < 0 or row_index >= rows.size():
			return false
		var row: String = rows[row_index]
		return x < row.length() and row[x] != "."
	for f in frames.size():
		var rows: Array = frames[f]
		for r in rows.size():
			var row: String = rows[r]
			var y := r + height - rows.size()
			for x in row.length():
				if row[x] == ".":
					continue
				var colour := Color(colours[row[x]])
				for d: Vector2i in [Vector2i(1, 0), Vector2i(-1, 0), Vector2i(0, 1), Vector2i(0, -1)]:
					if not filled.call(f, x + d.x, y + d.y):
						colour = colour.darkened(0.32)
						break
				image.set_pixel(f * width + x, y, colour)
	return [ImageTexture.create_from_image(image), frames.size()]

static func _cat_sheets(coat: String) -> Dictionary:
	var colours: Dictionary = COATS[coat]
	return {"walk": _sheet(CAT_WALK, colours), "sit": _sheet(CAT_SIT, colours), "sleep": _sheet(CAT_SLEEP, colours)}

static var _bird_sheets: Dictionary = {}
static func _birds() -> Dictionary:
	if _bird_sheets.is_empty():
		_bird_sheets = {"ground": _sheet(BIRD_GROUND, BIRD_COLOURS), "fly": _sheet(BIRD_FLY, BIRD_COLOURS)}
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
			_show(cat.sprite, cat.sheets.sit, 0)
			if cat.timer <= 0.0:
				cat.state = "sit"
				cat.timer = _rng.randf_range(2.0, 5.0)
		"sleep":
			_show(cat.sprite, cat.sheets.sleep, 0)
			if cat.timer <= 0.0:
				cat.state = "sit"
				cat.timer = _rng.randf_range(3.0, 7.0)
		"sit":
			_show(cat.sprite, cat.sheets.sit, 0)
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
		var sprite := _sprite(_birds().ground[0], _birds().ground[1])
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
		cat.sprite.scale.y = 1.0 + (0.03 * sin(cat.phase * 2.2) if cat.state == "sleep" else 0.0)
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
		var p: Vector2 = to_screen.call(cat.node.position + Vector3(0, 0.95, 0))
		_hint.position = p - Vector2(_hint.size.x * 0.5, _hint.size.y + 4.0 - sin(_time * 3.0) * 3.0)
	if _bubble.visible:
		_bubble_age += delta
		_bubble.modulate.a = clampf((2.0 - _bubble_age) / 0.5, 0.0, 1.0)
		_bubble.visible = _bubble_age < 2.0 and to_screen.is_valid()
		if _bubble.visible:
			_bubble.reset_size()
			var p: Vector2 = to_screen.call(_bubble_cat.node.position + Vector3(0, 0.95, 0))
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
